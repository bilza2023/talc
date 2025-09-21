// /src/lib/mma/mma4s.js
// MMA4S (SSSS) ledger engine — uses Prisma models: Supplier, Raw/MMA4S.
// MMAs are logic-only codes (e.g., "ABS.SLOTS", "PSS.DUMP") validated against a registry.

import { PrismaClient, EdgeStatus, BornAs } from '@prisma/client';

function getMMA4SDelegate(clientOrTx) {
  // Support both schema variants:
  //   model Raw { @@map("raw") }         → client.raw
  //   model MMA4S { @@map("raw") }       → client.mMA4S
  return (
    clientOrTx?.raw ??
    clientOrTx?.mMA4S ??
    null
  );
}

export function createMMA4S(opts = {}) {
  const prisma = opts.prisma ?? new PrismaClient();
  const REGISTRY = new Set(opts.registry ?? []);

  // --- assertions ------------------------------------------------------------
  const assertMma = (code, label = 'mmaCode') => {
    if (!code || typeof code !== 'string') throw new Error(`${label} is required`);
    if (!REGISTRY.has(code)) throw new Error(`${label} "${code}" is not in registry`);
  };
  const assertPositiveQty = (qty) => {
    if (qty == null || Number(qty) <= 0) throw new Error(`qty must be > 0`);
  };
  const assertShade = (shade) => {
    if (!shade || typeof shade !== 'string') throw new Error(`shade is required`);
  };
  const assertSize = (size) => {
    if (!size || typeof size !== 'string') throw new Error(`size is required`);
  };

  // --- math (tx-bound) -------------------------------------------------------
  async function onHandTx(tx, { mmaCode, supplierId, shade, size }) {
    const Raw = getMMA4SDelegate(tx);
    if (!Raw) throw new Error('Prisma model for MMA4S not found on transaction (expected raw or mMA4S)');

    // deposits in (born here)
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

    // transfers received
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

    // transfers outbound (planned)
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

    const inQty =
      Number(depIn._sum.receiveQty ?? 0) + Number(trIn._sum.receiveQty ?? 0);
    const outQty = Number(trOut._sum.dispatchQty ?? 0);
    return inQty - outQty;
  }

  // --- public API ------------------------------------------------------------
  return {
    // writes ---------------------------------------------------------------
    async deposit({ mmaCode, supplierId, shade, size, qty, meta }) {
      assertMma(mmaCode, 'mmaCode');
      assertPositiveQty(qty);
      assertShade(shade);
      assertSize(size);

      const Raw = getMMA4SDelegate(prisma);
      if (!Raw) throw new Error('Prisma model for MMA4S not found (expected prisma.raw or prisma.mMA4S)');

      return Raw.create({
        data: {
          bornAs: BornAs.DEPOSIT,
          status: EdgeStatus.RECEIVED,
          fromMmaCode: null,
          toMmaCode: mmaCode,
          supplierId,
          size,
          dispatchShade: shade,
          receiveShade: shade,
          dispatchQty: qty,
          receiveQty: qty,
          meta: meta ?? null,
          receivedAt: new Date(),
        },
      });
    },

    async dispatch({ fromMmaCode, toMmaCode, supplierId, shade, size, qty, meta }) {
      assertMma(fromMmaCode, 'fromMmaCode');
      assertMma(toMmaCode, 'toMmaCode');
      if (fromMmaCode === toMmaCode)
        throw new Error('fromMmaCode and toMmaCode must differ');
      assertPositiveQty(qty);
      assertShade(shade);
      assertSize(size);

      return prisma.$transaction(async (tx) => {
        const Raw = getMMA4SDelegate(tx);
        if (!Raw) throw new Error('Prisma model for MMA4S not found on transaction (expected raw or mMA4S)');

        const available = await onHandTx(tx, {
          mmaCode: fromMmaCode,
          supplierId,
          shade,
          size,
        });
        if (Number(available) < Number(qty)) {
          throw new Error(
            `Insufficient stock at ${fromMmaCode} for supplier=${supplierId}, shade=${shade}, size=${size}. ` +
              `available=${available}, requested=${qty}`
          );
        }

        const row = await Raw.create({
          data: {
            bornAs: BornAs.TRANSFER,
            status: EdgeStatus.IN_TRANSIT,
            fromMmaCode,
            toMmaCode,
            supplierId,
            size,
            dispatchShade: shade,
            dispatchQty: qty,
            meta: meta ?? null,
          },
        });
        return row;
      });
    },

    // Completes the SAME row created at dispatch. Verifies supplier & destination MMA.
    async receive({ id, toMmaCode, supplierId, receiveQty, receiveShade, meta }) {
      if (id == null) throw new Error('receive() requires row id');
      if (!supplierId) throw new Error('receive() requires supplierId for verification');
      if (!toMmaCode) throw new Error('receive() requires toMmaCode for verification');

      return prisma.$transaction(async (tx) => {
        const Raw = getMMA4SDelegate(tx);
        if (!Raw) throw new Error('Prisma model for MMA4S not found on transaction (expected raw or mMA4S)');

        const row = await Raw.findUnique({ where: { id } });
        if (!row) throw new Error('Transfer not found');
        if (row.bornAs !== 'TRANSFER') throw new Error('Row is not a TRANSFER');
        if (row.status === 'CANCELED') throw new Error('Transfer is canceled');

        if (row.status === 'RECEIVED') {
          // already completed; optionally update meta
          if (meta && JSON.stringify(meta) !== JSON.stringify(row.meta ?? null)) {
            await Raw.update({ where: { id: row.id }, data: { meta } });
          }
          return row;
        }

        // verify supplier + destination
        if (row.supplierId !== supplierId) {
          throw new Error(
            `Supplier mismatch: row has supplierId=${row.supplierId}, got ${supplierId}`
          );
        }
        if (row.toMmaCode !== toMmaCode) {
          throw new Error(
            `Destination MMA mismatch: row toMmaCode=${row.toMmaCode}, got ${toMmaCode}`
          );
        }

        const finalQty = receiveQty ?? row.dispatchQty;
        const finalShade = receiveShade ?? row.dispatchShade;

        const updated = await Raw.update({
          where: { id: row.id },
          data: {
            status: EdgeStatus.RECEIVED,
            receiveQty: finalQty,
            receiveShade: finalShade,
            receivedAt: new Date(),
            meta: meta ?? row.meta,
          },
        });
        return updated;
      });
    },

    async cancel({ id, meta }) {
      if (id == null) throw new Error('cancel() requires row id');

      return prisma.$transaction(async (tx) => {
        const Raw = getMMA4SDelegate(tx);
        if (!Raw) throw new Error('Prisma model for MMA4S not found on transaction (expected raw or mMA4S)');

        const row = await Raw.findUnique({ where: { id } });
        if (!row) throw new Error('Transfer not found');
        if (row.bornAs !== 'TRANSFER') throw new Error('Row is not a TRANSFER');
        if (row.status !== 'IN_TRANSIT')
          throw new Error('Only IN_TRANSIT transfers can be canceled');

        return Raw.update({
          where: { id },
          data: { status: EdgeStatus.CANCELED, meta: meta ?? row.meta },
        });
      });
    },

    // reads ----------------------------------------------------------------
    async onHand({ mmaCode, supplierId, shade, size }) {
      assertMma(mmaCode, 'mmaCode');
      return prisma.$transaction((tx) =>
        onHandTx(tx, { mmaCode, supplierId, shade, size })
      );
    },

    async stock({ mmaCode, positiveOnly = true } = {}) {
      assertMma(mmaCode, 'mmaCode');

      const Raw = getMMA4SDelegate(prisma);
      if (!Raw) throw new Error('Prisma model for MMA4S not found (expected prisma.raw or prisma.mMA4S)');

      const [depositsIn, transfersIn, transfersOut] = await prisma.$transaction([
        Raw.groupBy({
          by: ['supplierId', 'size', 'receiveShade'],
          where: { bornAs: BornAs.DEPOSIT, toMmaCode: mmaCode },
          _sum: { receiveQty: true },
        }),
        Raw.groupBy({
          by: ['supplierId', 'size', 'receiveShade'],
          where: {
            bornAs: BornAs.TRANSFER,
            toMmaCode: mmaCode,
            status: EdgeStatus.RECEIVED,
          },
          _sum: { receiveQty: true },
        }),
        Raw.groupBy({
          by: ['supplierId', 'size', 'dispatchShade'],
          where: {
            bornAs: BornAs.TRANSFER,
            fromMmaCode: mmaCode,
            status: { in: [EdgeStatus.IN_TRANSIT, EdgeStatus.RECEIVED] },
          },
          _sum: { dispatchQty: true },
        }),
      ]);

      const key = (sid, shade, size) => `${sid}::${shade}::${size}`;
      const acc = new Map();
      const add = (sid, shade, size, delta) => {
        const k = key(sid, shade, size);
        acc.set(k, (acc.get(k) ?? 0) + Number(delta ?? 0));
      };

      for (const r of depositsIn)
        add(r.supplierId, r.receiveShade, r.size, r._sum.receiveQty ?? 0);
      for (const r of transfersIn)
        add(r.supplierId, r.receiveShade, r.size, r._sum.receiveQty ?? 0);
      for (const r of transfersOut)
        add(r.supplierId, r.dispatchShade, r.size, -Number(r._sum.dispatchQty ?? 0));

      const rows = [];
      for (const [k, qty] of acc.entries()) {
        const [supplierIdStr, shade, size] = k.split('::');
        if (!positiveOnly || qty > 0) {
          rows.push({ supplierId: Number(supplierIdStr), shade, size, qty });
        }
      }
      rows.sort((a, b) => b.qty - a.qty);
      return rows;
    },

    async inbound({ mmaCode, status = 'IN_TRANSIT' } = {}) {
      assertMma(mmaCode, 'mmaCode');

      const Raw = getMMA4SDelegate(prisma);
      if (!Raw) throw new Error('Prisma model for MMA4S not found (expected prisma.raw or prisma.mMA4S)');

      const where = {
        toMmaCode: mmaCode,
        bornAs: BornAs.TRANSFER,
        ...(status ? { status } : {}),
      };
      return Raw.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      });
    },

    async outbound({ mmaCode, status = 'IN_TRANSIT' } = {}) {
      assertMma(mmaCode, 'mmaCode');

      const Raw = getMMA4SDelegate(prisma);
      if (!Raw) throw new Error('Prisma model for MMA4S not found (expected prisma.raw or prisma.mMA4S)');

      const where = {
        fromMmaCode: mmaCode,
        bornAs: BornAs.TRANSFER,
        ...(status ? { status } : {}),
      };
      return Raw.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      });
    },

    async activeSlots({ mmaCode }) {
      return this.stock({ mmaCode, positiveOnly: true });
    },
  };
}

// Default singleton (fill this with your allowed MMAs on boot)
const defaultRegistry = []; // e.g., ["ABS.SLOTS", "PSS.DUMP", "PSS.SLOTS"]
const _default = createMMA4S({ registry: defaultRegistry });
export default _default;
