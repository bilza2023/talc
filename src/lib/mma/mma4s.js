// /src/lib/mma/mma4s.js
// MMA4S (SSSS) — class-based engine, own table, own suppliers, allowed dispatch targets
// Prisma delegate: prisma.raw  or prisma.mMA4S (supports either schema mapping)
//
// API (same across 2S/3S/4S):
// deposit, dispatch, receive, cancel, onHand, stock, inbound, outbound, activeSlots
//
// Amounts:
// - deposit(): sets amountDispatch AND amountReceive (both = provided amount*, see below)
// - dispatch(): sets amountDispatch
// - receive(): sets/overrides amountReceive (defaults to row.amountDispatch if not provided)
//
// Back-compat: deposit/dispatch/receive accept `amount` as a fallback.
//   deposit:  amountDispatch = amountDispatch ?? amount ?? 0
//             amountReceive  = amountReceive  ?? amount ?? amountDispatch
//   dispatch: amountDispatch = amountDispatch ?? amount ?? 0
//   receive:  amountReceive  = amountReceive  ?? amount ?? row.amountDispatch

import { PrismaClient, EdgeStatus, BornAs } from '@prisma/client';

function getMMA4SDelegate(clientOrTx) {
  return clientOrTx?.raw ?? clientOrTx?.mMA4S ?? null;
}

export default class MMA4S {
  /**
   * @param {object} opts
   * @param {PrismaClient} [opts.prisma]
   * @param {string[]} [opts.registry]        // valid mma codes for this engine
   * @param {number[]} [opts.suppliersAllowed]// supplier ids allowed to write here
   * @param {string[]} [opts.dispatchTargets] // which mma codes we can dispatch to
   */
  constructor(opts = {}) {
    this.prisma = opts.prisma ?? new PrismaClient();
    this.REGISTRY = new Set(opts.registry ?? []);
    this.SUPPLIERS = new Set(opts.suppliersAllowed ?? []);
    this.TARGETS = new Set(opts.dispatchTargets ?? []);
  }

  // ---- local assertions / guards ------------------------------------------
  #assertMma(code, label = 'mmaCode') {
    if (!code || typeof code !== 'string') throw new Error(`${label} is required`);
    if (!this.REGISTRY.has(code)) throw new Error(`${label} "${code}" is not in registry`);
  }
  #assertPositiveQty(qty) {
    if (qty == null || Number(qty) <= 0) throw new Error(`qty must be > 0`);
  }
  #assertShade(shade) {
    if (!shade || typeof shade !== 'string') throw new Error(`shade is required`);
  }
  #assertSize(size) {
    if (!size || typeof size !== 'string') throw new Error(`size is required`);
  }
  #assertSupplierAllowed(supplierId) {
    if (this.SUPPLIERS.size && !this.SUPPLIERS.has(Number(supplierId))) {
      throw new Error(`supplierId ${supplierId} not allowed for this MMA`);
    }
  }
  #assertDispatchTarget(toMmaCode) {
    if (this.TARGETS.size && !this.TARGETS.has(String(toMmaCode))) {
      throw new Error(`dispatch to ${toMmaCode} not allowed for this MMA`);
    }
  }

  // ---- math (tx-bound) -----------------------------------------------------
  async #onHandTx(tx, { mmaCode, supplierId, shade, size }) {
    const Raw = getMMA4SDelegate(tx);
    if (!Raw) throw new Error('MMA4S model not found on transaction (expected raw or mMA4S)');

    const depIn = await Raw.aggregate({
      _sum: { receiveQty: true },
      where: {
        bornAs: BornAs.DEPOSIT,
        toMmaCode: mmaCode,
        ...(supplierId ? { supplierId } : {}),
        ...(size ? { size } : {}),
        ...(shade ? { receiveShade: shade } : {}),
      },
    });

    const trIn = await Raw.aggregate({
      _sum: { receiveQty: true },
      where: {
        bornAs: BornAs.TRANSFER,
        toMmaCode: mmaCode,
        status: EdgeStatus.RECEIVED,
        ...(supplierId ? { supplierId } : {}),
        ...(size ? { size } : {}),
        ...(shade ? { receiveShade: shade } : {}),
      },
    });

    const trOut = await Raw.aggregate({
      _sum: { dispatchQty: true },
      where: {
        bornAs: BornAs.TRANSFER,
        fromMmaCode: mmaCode,
        status: { in: [EdgeStatus.IN_TRANSIT, EdgeStatus.RECEIVED] },
        ...(supplierId ? { supplierId } : {}),
        ...(size ? { size } : {}),
        ...(shade ? { dispatchShade: shade } : {}),
      },
    });

    const inQty = Number(depIn._sum.receiveQty ?? 0) + Number(trIn._sum.receiveQty ?? 0);
    const outQty = Number(trOut._sum.dispatchQty ?? 0);
    return inQty - outQty;
  }

  // ---- public API ----------------------------------------------------------
  async deposit({
    mmaCode,
    supplierId,
    shade,
    size,
    qty,
    amount,            // fallback (for back-compat)
    amountDispatch,    // preferred
    amountReceive,     // preferred
    meta
  }) {
    this.#assertMma(mmaCode);
    this.#assertSupplierAllowed(supplierId);
    this.#assertPositiveQty(qty);
    this.#assertShade(shade);
    this.#assertSize(size);

    const Raw = getMMA4SDelegate(this.prisma);
    if (!Raw) throw new Error('MMA4S model not found (expected prisma.raw or prisma.mMA4S)');

    const aDispatch = amountDispatch ?? amount ?? 0;
    const aReceive  = amountReceive  ?? amount ?? aDispatch;

    return Raw.create({
      data: {
        bornAs: BornAs.DEPOSIT,
        status: EdgeStatus.RECEIVED,
        fromMmaCode: null,
        toMmaCode: mmaCode,
        supplierId,
        size,
        amountDispatch: aDispatch,
        amountReceive:  aReceive,
        dispatchShade: shade,
        receiveShade:  shade,
        dispatchQty: qty,
        receiveQty:  qty,
        meta: meta ?? null,
        receivedAt: new Date(),
      },
    });
  }

  async dispatch({
    fromMmaCode,
    toMmaCode,
    supplierId,
    shade,
    size,
    qty,
    amount,           // fallback
    amountDispatch,   // preferred
    meta
  }) {
    this.#assertMma(fromMmaCode, 'fromMmaCode');
    this.#assertMma(toMmaCode, 'toMmaCode');
    if (fromMmaCode === toMmaCode) throw new Error('fromMmaCode and toMmaCode must differ');
    this.#assertDispatchTarget(toMmaCode);
    this.#assertSupplierAllowed(supplierId);
    this.#assertPositiveQty(qty);
    this.#assertShade(shade);
    this.#assertSize(size);

    const aDispatch = amountDispatch ?? amount ?? 0;

    return this.prisma.$transaction(async (tx) => {
      const Raw = getMMA4SDelegate(tx);
      if (!Raw) throw new Error('MMA4S model not found on transaction (expected raw or mMA4S)');

      const available = await this.#onHandTx(tx, { mmaCode: fromMmaCode, supplierId, shade, size });
      if (Number(available) < Number(qty)) {
        throw new Error(
          `Insufficient stock at ${fromMmaCode} for supplier=${supplierId}, shade=${shade}, size=${size}. available=${available}, requested=${qty}`
        );
      }

      return Raw.create({
        data: {
          bornAs: BornAs.TRANSFER,
          status: EdgeStatus.IN_TRANSIT,
          fromMmaCode,
          toMmaCode,
          supplierId,
          size,
          amountDispatch: aDispatch,
          dispatchShade: shade,
          dispatchQty:   qty,
          meta: meta ?? null,
        },
      });
    });
  }

  async receive({
    id,
    toMmaCode,
    supplierId,
    receiveQty,
    receiveShade,
    amount,          // fallback
    amountReceive,   // preferred
    meta
  }) {
    if (id == null) throw new Error('receive() requires row id');
    if (!supplierId) throw new Error('receive() requires supplierId for verification');
    if (!toMmaCode) throw new Error('receive() requires toMmaCode for verification');

    return this.prisma.$transaction(async (tx) => {
      const Raw = getMMA4SDelegate(tx);
      if (!Raw) throw new Error('MMA4S model not found on transaction (expected raw or mMA4S)');

      const row = await Raw.findUnique({ where: { id } });
      if (!row) throw new Error('Transfer not found');
      if (row.bornAs !== 'TRANSFER') throw new Error('Row is not a TRANSFER');
      if (row.status === 'CANCELED') throw new Error('Transfer is canceled');

      if (row.status === 'RECEIVED') {
        // allow meta touch
        if (meta && JSON.stringify(meta) !== JSON.stringify(row.meta ?? null)) {
          await Raw.update({ where: { id: row.id }, data: { meta } });
        }
        return row;
      }

      if (row.supplierId !== supplierId) {
        throw new Error(`Supplier mismatch: row has supplierId=${row.supplierId}, got ${supplierId}`);
      }
      if (row.toMmaCode !== toMmaCode) {
        throw new Error(`Destination MMA mismatch: row toMmaCode=${row.toMmaCode}, got ${toMmaCode}`);
      }

      const finalQty     = receiveQty   ?? row.dispatchQty;
      const finalShade   = receiveShade ?? row.dispatchShade;
      const finalAmountR = amountReceive ?? amount ?? row.amountDispatch ?? 0;

      return Raw.update({
        where: { id: row.id },
        data: {
          status:       EdgeStatus.RECEIVED,
          receiveQty:   finalQty,
          receiveShade: finalShade,
          amountReceive: finalAmountR,
          receivedAt:   new Date(),
          meta:         meta ?? row.meta,
        },
      });
    });
  }

  async cancel({ id, meta }) {
    if (id == null) throw new Error('cancel() requires row id');

    return this.prisma.$transaction(async (tx) => {
      const Raw = getMMA4SDelegate(tx);
      if (!Raw) throw new Error('MMA4S model not found on transaction (expected raw or mMA4S)');

      const row = await Raw.findUnique({ where: { id } });
      if (!row) throw new Error('Transfer not found');
      if (row.bornAs !== 'TRANSFER') throw new Error('Row is not a TRANSFER');
      if (row.status !== 'IN_TRANSIT') throw new Error('Only IN_TRANSIT transfers can be canceled');

      return Raw.update({
        where: { id },
        data: { status: EdgeStatus.CANCELED, meta: meta ?? row.meta },
      });
    });
  }

  // reads ---------------------------------------------------------------------
  async onHand({ mmaCode, supplierId, shade, size }) {
    this.#assertMma(mmaCode, 'mmaCode');
    return this.prisma.$transaction((tx) => this.#onHandTx(tx, { mmaCode, supplierId, shade, size }));
  }

  async stock({ mmaCode, positiveOnly = true } = {}) {
    this.#assertMma(mmaCode, 'mmaCode');

    const Raw = getMMA4SDelegate(this.prisma);
    if (!Raw) throw new Error('MMA4S model not found (expected prisma.raw or prisma.mMA4S)');

    const [depositsIn, transfersIn, transfersOut] = await this.prisma.$transaction([
      Raw.groupBy({
        by: ['supplierId', 'size', 'receiveShade'],
        where: { bornAs: BornAs.DEPOSIT, toMmaCode: mmaCode },
        _sum: { receiveQty: true },
      }),
      Raw.groupBy({
        by: ['supplierId', 'size', 'receiveShade'],
        where: { bornAs: BornAs.TRANSFER, toMmaCode: mmaCode, status: EdgeStatus.RECEIVED },
        _sum: { receiveQty: true },
      }),
      Raw.groupBy({
        by: ['supplierId', 'size', 'dispatchShade'],
        where: { bornAs: BornAs.TRANSFER, fromMmaCode: mmaCode, status: { in: [EdgeStatus.IN_TRANSIT, EdgeStatus.RECEIVED] } },
        _sum: { dispatchQty: true },
      }),
    ]);

    const key = (sid, shade, size) => `${sid}::${shade}::${size}`;
    const acc = new Map();
    const add = (sid, shade, size, delta) => {
      const k = key(sid, shade, size);
      acc.set(k, (acc.get(k) ?? 0) + Number(delta ?? 0));
    };

    for (const r of depositsIn)  add(r.supplierId, r.receiveShade, r.size, r._sum.receiveQty ?? 0);
    for (const r of transfersIn) add(r.supplierId, r.receiveShade, r.size, r._sum.receiveQty ?? 0);
    for (const r of transfersOut) add(r.supplierId, r.dispatchShade, r.size, -Number(r._sum.dispatchQty ?? 0));

    const rows = [];
    for (const [k, qty] of acc.entries()) {
      const [supplierIdStr, shade, size] = k.split('::');
      if (!positiveOnly || qty > 0) rows.push({ supplierId: Number(supplierIdStr), shade, size, qty });
    }
    rows.sort((a, b) => b.qty - a.qty);
    return rows;
  }

  async inbound({ mmaCode, status = 'IN_TRANSIT' } = {}) {
    this.#assertMma(mmaCode, 'mmaCode');
    const Raw = getMMA4SDelegate(this.prisma);
    if (!Raw) throw new Error('MMA4S model not found (expected prisma.raw or prisma.mMA4S)');
    const where = { toMmaCode: mmaCode, bornAs: BornAs.TRANSFER, ...(status ? { status } : {}) };
    return Raw.findMany({ where, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }] });
  }

  async outbound({ mmaCode, status = 'IN_TRANSIT' } = {}) {
    this.#assertMma(mmaCode, 'mmaCode');
    const Raw = getMMA4SDelegate(this.prisma);
    if (!Raw) throw new Error('MMA4S model not found (expected prisma.raw or prisma.mMA4S)');
    const where = { fromMmaCode: mmaCode, bornAs: BornAs.TRANSFER, ...(status ? { status } : {}) };
    return Raw.findMany({ where, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }] });
  }

  async activeSlots({ mmaCode }) {
    return this.stock({ mmaCode, positiveOnly: true });
  }
}
