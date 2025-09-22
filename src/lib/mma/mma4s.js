// /src/lib/mma/mma4s.js
import { PrismaClient, EdgeStatus, BornAs } from '@prisma/client';

function getDelegate(clientOrTx, table) {
  const d = clientOrTx?.[table];
  if (!d) throw new Error(`MMA4S: Prisma delegate "${table}" not found on client/transaction`);
  return d;
}

export default class MMA4S {
  constructor(opts = {}) {
    if (!opts.table) throw new Error('MMA4S requires opts.table = "processed4s" | "sorted4s"');
    this.prisma = opts.prisma ?? new PrismaClient();
    this.table = opts.table;
    this.REGISTRY = new Set(opts.registry ?? []);
    this.SUPPLIERS = new Set(opts.suppliersAllowed ?? []);
    this.TARGETS = new Set(opts.dispatchTargets ?? []);
  }

  #assertMma(code, label = 'mmaCode') {
    if (!code || typeof code !== 'string') throw new Error(`${label} is required`);
    if (this.REGISTRY.size && !this.REGISTRY.has(code)) {
      throw new Error(`${label} "${code}" is not in registry for table ${this.table}`);
    }
  }
  #assertPositiveQty(qty) { if (qty == null || Number(qty) <= 0) throw new Error(`qty must be > 0`); }
  #assertShade(shade) { if (!shade || typeof shade !== 'string') throw new Error(`shade is required`); }
  #assertSize(size) { if (!size || typeof size !== 'string') throw new Error(`size is required for 4-slot stages`); }
  #assertSupplierAllowed(supplierId) {
    if (this.SUPPLIERS.size && !this.SUPPLIERS.has(Number(supplierId))) {
      throw new Error(`supplierId ${supplierId} not allowed for this stage`);
    }
  }
  #assertDispatchTarget(toMmaCode) {
    if (this.TARGETS.size && !this.TARGETS.has(String(toMmaCode))) {
      throw new Error(`dispatch to ${toMmaCode} not allowed for this stage`);
    }
  }

  async #onHandTx(tx, { mmaCode, supplierId, shade, size }) {
    const Raw = getDelegate(tx, this.table);

    const inDeposit = await Raw.aggregate({
      _sum: { receiveQty: true },
      where: {
        bornAs: BornAs.DEPOSIT, toMmaCode: mmaCode,
        ...(supplierId ? { supplierId } : {}), ...(size ? { size } : {}), ...(shade ? { receiveShade: shade } : {}),
      },
    });
    const inTransfer = await Raw.aggregate({
      _sum: { receiveQty: true },
      where: {
        bornAs: BornAs.TRANSFER, toMmaCode: mmaCode, status: EdgeStatus.RECEIVED,
        ...(supplierId ? { supplierId } : {}), ...(size ? { size } : {}), ...(shade ? { receiveShade: shade } : {}),
      },
    });
    const inProcess = await Raw.aggregate({
      _sum: { receiveQty: true },
      where: {
        bornAs: BornAs.PROCESS, toMmaCode: mmaCode, status: EdgeStatus.RECEIVED,
        ...(supplierId ? { supplierId } : {}), ...(size ? { size } : {}), ...(shade ? { receiveShade: shade } : {}),
      },
    });

    const outTransfer = await Raw.aggregate({
      _sum: { dispatchQty: true },
      where: {
        bornAs: BornAs.TRANSFER, fromMmaCode: mmaCode,
        status: { in: [EdgeStatus.IN_TRANSIT, EdgeStatus.RECEIVED] },
        ...(supplierId ? { supplierId } : {}), ...(size ? { size } : {}), ...(shade ? { dispatchShade: shade } : {}),
      },
    });
    const outProcess = await Raw.aggregate({
      _sum: { dispatchQty: true },
      where: {
        bornAs: BornAs.PROCESS, fromMmaCode: mmaCode, status: EdgeStatus.RECEIVED,
        ...(supplierId ? { supplierId } : {}), ...(size ? { size } : {}), ...(shade ? { dispatchShade: shade } : {}),
      },
    });

    const inQty = Number(inDeposit._sum.receiveQty ?? 0)
                + Number(inTransfer._sum.receiveQty ?? 0)
                + Number(inProcess._sum.receiveQty ?? 0);

    const outQty = Number(outTransfer._sum.dispatchQty ?? 0)
                 + Number(outProcess._sum.dispatchQty ?? 0);

    return inQty - outQty;
  }

  // ---------- VERBS ----------
  async deposit({ mmaCode, supplierId, shade, size, qty, meta }) {
    this.#assertMma(mmaCode); this.#assertSupplierAllowed(supplierId);
    this.#assertPositiveQty(qty); this.#assertShade(shade); this.#assertSize(size);

    const Raw = getDelegate(this.prisma, this.table);
    return Raw.create({
      data: {
        bornAs: BornAs.DEPOSIT, status: EdgeStatus.RECEIVED,
        fromMmaCode: null, toMmaCode: mmaCode,
        supplierId, size,
        dispatchShade: shade, receiveShade: shade,
        dispatchQty: qty, receiveQty: qty,
        // NOTE: transportation amounts are not relevant to deposits → leave null
        meta: meta ?? null,
        receivedAt: new Date(),
      },
    });
  }

  async dispatch({ fromMmaCode, toMmaCode, supplierId, shade, size, qty, amount, amountDispatch, meta }) {
    this.#assertMma(fromMmaCode, 'fromMmaCode'); this.#assertMma(toMmaCode, 'toMmaCode');
    this.#assertDispatchTarget(toMmaCode); this.#assertSupplierAllowed(supplierId);
    this.#assertPositiveQty(qty); this.#assertShade(shade); this.#assertSize(size);

    const dispatchAmount = amountDispatch ?? amount ?? 0;

    return this.prisma.$transaction(async (tx) => {
      const Raw = getDelegate(tx, this.table);
      const available = await this.#onHandTx(tx, { mmaCode: fromMmaCode, supplierId, shade, size });
      if (Number(available) < Number(qty)) {
        throw new Error(`Insufficient stock at ${fromMmaCode} for supplier=${supplierId}, shade=${shade}, size=${size}. available=${available}, requested=${qty}`);
      }

      return Raw.create({
        data: {
          bornAs: BornAs.TRANSFER, status: EdgeStatus.IN_TRANSIT,
          fromMmaCode, toMmaCode, supplierId, size,
          dispatchShade: shade, dispatchQty: qty,
          dispatchAmount, // <-- schema field
          meta: meta ?? null,
        },
      });
    });
  }

  async receive({ id, toMmaCode, supplierId, receiveQty, receiveShade, amount, amountReceive, meta }) {
    if (id == null) throw new Error('receive() requires row id');
    if (!supplierId) throw new Error('receive() requires supplierId for verification');
    if (!toMmaCode) throw new Error('receive() requires toMmaCode for verification');

    return this.prisma.$transaction(async (tx) => {
      const Raw = getDelegate(tx, this.table);
      const row = await Raw.findUnique({ where: { id } });
      if (!row) throw new Error('Transfer not found');
      if (row.bornAs !== 'TRANSFER') throw new Error('Row is not a TRANSFER');
      if (row.status === 'CANCELED') throw new Error('Transfer is canceled');

      if (row.status === 'RECEIVED') {
        if (meta && JSON.stringify(meta) !== JSON.stringify(row.meta ?? null)) {
          await Raw.update({ where: { id: row.id }, data: { meta } });
        }
        return row;
      }

      if (row.supplierId !== supplierId) throw new Error(`Supplier mismatch: row has supplierId=${row.supplierId}, got ${supplierId}`);
      if (row.toMmaCode !== toMmaCode) throw new Error(`Destination MMA mismatch: row toMmaCode=${row.toMmaCode}, got ${toMmaCode}`);

      const finalQty   = receiveQty   ?? row.dispatchQty;
      const finalShade = receiveShade ?? row.dispatchShade;
      const recvAmount = amountReceive ?? amount ?? row.dispatchAmount ?? 0;

      return Raw.update({
        where: { id: row.id },
        data: {
          status: EdgeStatus.RECEIVED,
          receiveQty: finalQty,
          receiveShade: finalShade,
          receiveAmount: recvAmount,  // <-- schema field
          receivedAt: new Date(),
          meta: meta ?? row.meta,
        },
      });
    });
  }

  async cancel({ id, meta }) {
    if (id == null) throw new Error('cancel() requires row id');

    return this.prisma.$transaction(async (tx) => {
      const Raw = getDelegate(tx, this.table);
      const row = await Raw.findUnique({ where: { id } });
      if (!row) throw new Error('Transfer not found');
      if (row.bornAs !== 'TRANSFER') throw new Error('Row is not a TRANSFER');
      if (row.status !== 'IN_TRANSIT') throw new Error('Only IN_TRANSIT transfers can be canceled');

      return Raw.update({ where: { id }, data: { status: EdgeStatus.CANCELED, meta: meta ?? row.meta } });
    });
  }

  // ---------- READS ----------
  async onHand({ mmaCode, supplierId, shade, size }) {
    this.#assertMma(mmaCode, 'mmaCode');
    return this.prisma.$transaction((tx) => this.#onHandTx(tx, { mmaCode, supplierId, shade, size }));
  }

  async stock({ mmaCode, positiveOnly = true } = {}) {
    this.#assertMma(mmaCode, 'mmaCode');
    const Raw = getDelegate(this.prisma, this.table);

    const [depositsIn, transfersIn, processesIn, transfersOut, processesOut] = await this.prisma.$transaction([
      Raw.groupBy({ by: ['supplierId','size','receiveShade'], where: { bornAs: BornAs.DEPOSIT, toMmaCode: mmaCode }, _sum: { receiveQty: true } }),
      Raw.groupBy({ by: ['supplierId','size','receiveShade'], where: { bornAs: BornAs.TRANSFER, toMmaCode: mmaCode, status: EdgeStatus.RECEIVED }, _sum: { receiveQty: true } }),
      Raw.groupBy({ by: ['supplierId','size','receiveShade'], where: { bornAs: BornAs.PROCESS,  toMmaCode: mmaCode, status: EdgeStatus.RECEIVED }, _sum: { receiveQty: true } }),
      Raw.groupBy({ by: ['supplierId','size','dispatchShade'], where: { bornAs: BornAs.TRANSFER, fromMmaCode: mmaCode, status: { in: [EdgeStatus.IN_TRANSIT, EdgeStatus.RECEIVED] } }, _sum: { dispatchQty: true } }),
      Raw.groupBy({ by: ['supplierId','size','dispatchShade'], where: { bornAs: BornAs.PROCESS,  fromMmaCode: mmaCode, status: EdgeStatus.RECEIVED }, _sum: { dispatchQty: true } }),
    ]);

    const key = (sid, shade, size) => `${sid}::${shade}::${size}`;
    const acc = new Map();
    const add = (sid, shade, size, delta) => { const k = key(sid, shade, size); acc.set(k, (acc.get(k) ?? 0) + Number(delta ?? 0)); };

    for (const r of depositsIn)  add(r.supplierId, r.receiveShade, r.size, r._sum.receiveQty ?? 0);
    for (const r of transfersIn) add(r.supplierId, r.receiveShade, r.size, r._sum.receiveQty ?? 0);
    for (const r of processesIn) add(r.supplierId, r.receiveShade, r.size, r._sum.receiveQty ?? 0);
    for (const r of transfersOut) add(r.supplierId, r.dispatchShade, r.size, -Number(r._sum.dispatchQty ?? 0));
    for (const r of processesOut) add(r.supplierId, r.dispatchShade, r.size, -Number(r._sum.dispatchQty ?? 0));

    const rows = [];
    for (const [k, qty] of acc.entries()) {
      const [supplierIdStr, shade, size] = k.split('::');
      if (!positiveOnly || qty > 0) rows.push({ supplierId: Number(supplierIdStr), shade, size, qty });
    }
    rows.sort((a, b) => b.qty - a.qty);
    return rows;
  }

  /**
   * Transport amount rollups for a single MMA code (this stage table).
   * Returns sums in plain numbers (0 if none).
   */
  async transportAmounts({ mmaCode }) {
    this.#assertMma(mmaCode, 'mmaCode');
    const Raw = getDelegate(this.prisma, this.table);

    const [outD, inD, inR] = await this.prisma.$transaction([
      Raw.aggregate({
        _sum: { dispatchAmount: true },
        where: { bornAs: BornAs.TRANSFER, fromMmaCode: mmaCode, status: { in: [EdgeStatus.IN_TRANSIT, EdgeStatus.RECEIVED] } },
      }),
      Raw.aggregate({
        _sum: { dispatchAmount: true },
        where: { bornAs: BornAs.TRANSFER, toMmaCode: mmaCode, status: EdgeStatus.IN_TRANSIT },
      }),
      Raw.aggregate({
        _sum: { receiveAmount: true },
        where: { bornAs: BornAs.TRANSFER, toMmaCode: mmaCode, status: EdgeStatus.RECEIVED },
      }),
    ]);

    return {
      outboundDispatched: Number(outD._sum.dispatchAmount ?? 0),
      inboundInTransit:   Number(inD._sum.dispatchAmount ?? 0),
      inboundReceived:    Number(inR._sum.receiveAmount ?? 0),
    };
  }

  async inbound({ mmaCode, status = EdgeStatus.IN_TRANSIT } = {}) {
    this.#assertMma(mmaCode, 'mmaCode');
    const Raw = getDelegate(this.prisma, this.table);
    const where = { toMmaCode: mmaCode, bornAs: BornAs.TRANSFER, ...(status ? { status } : {}) };
    return Raw.findMany({ where, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }] });
  }

  async outbound({ mmaCode, status = EdgeStatus.IN_TRANSIT } = {}) {
    this.#assertMma(mmaCode, 'mmaCode');
    const Raw = getDelegate(this.prisma, this.table);
    const where = { fromMmaCode: mmaCode, bornAs: BornAs.TRANSFER, ...(status ? { status } : {}) };
    return Raw.findMany({ where, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }] });
  }

  async activeSlots({ mmaCode }) {
    return this.stock({ mmaCode, positiveOnly: true });
  }
}
