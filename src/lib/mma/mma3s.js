
// /src/lib/mma/mma3s.js
// MMA3S (SSS) ledger engine — works whether the Prisma model is named `MMA3S` (=> prisma.mMA3S)
// and mapped to table "mma3s". No Size here.
// MMAs are registry codes like "JSS.RAW", "PSS.DUMP" validated against a provided registry.

import { PrismaClient, EdgeStatus, BornAs } from '@prisma/client';

// Get the Prisma delegate for the 3S model on either a client or a transaction.
// With model name `MMA3S`, Prisma exposes `prisma.mMA3S` (camel-case quirk).
function getMMA3SDelegate(clientOrTx) {
  return clientOrTx?.mMA3S ?? null;
}

export function createMMA3S(opts = {}) {
  const prisma = opts.prisma ?? new PrismaClient();
  const REGISTRY = new Set(opts.registry ?? []);

  // ---------- assertions ----------
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

  // ---------- math (tx-bound) ----------
  async function onHandTx(tx, { mmaCode, supplierId, shade }) {
    const Raw3 = getMMA3SDelegate(tx);
    if (!Raw3) throw new Error('Prisma model for MMA3S not found on transaction (expected mMA3S)');

    // deposits in (born here)
    const depIn = await Raw3.aggregate({
      _sum: { receiveQty: true },
      where: {
        bornAs: BornAs.DEPOSIT,
        toMmaCode: mmaCode,
        ...(supplierId ? { supplierId } : {}),
        ...(shade ? { receiveShade: shade } : {}),
      },
    });

    // transfers received
    const trIn = await Raw3.aggregate({
      _sum: { receiveQty: true },
      where: {
        bornAs: BornAs.TRANSFER,
        toMmaCode: mmaCode,
        status: EdgeStatus.RECEIVED,
        ...(supplierId ? { supplierId } : {}),
        ...(shade ? { receiveShade: shade } : {}),
      },
    });

    // transfers outbound (planned)
    const trOut = await Raw3.aggregate({
      _sum: { dispatchQty: true },
      where: {
        bornAs: BornAs.TRANSFER,
        fromMmaCode: mmaCode,
        status: { in: [EdgeStatus.IN_TRANSIT, EdgeStatus.RECEIVED] },
        ...(supplierId ? { supplierId } : {}),
        ...(shade ? { dispatchShade: shade } : {}),
      },
    });

    const inQty =
      Number(depIn._sum.receiveQty ?? 0) + Number(trIn._sum.receiveQty ?? 0);
    const outQty = Number(trOut._sum.dispatchQty ?? 0);
    return inQty - outQty;
  }

  // ---------- public API ----------
  return {
    // writes ---------------------------------------------------------------
    async deposit({ mmaCode, supplierId, shade, qty, meta }) {
      assertMma(mmaCode, 'mmaCode');
      assertPositiveQty(qty);
      assertShade(shade);

      const Raw3 = getMMA3SDelegate(prisma);
      if (!Raw3) throw new Error('Prisma model for MMA3S not found (expected prisma.mMA3S)');

      return Raw3.create({
        data: {
          bornAs: BornAs.DEPOSIT,
          status: EdgeStatus.RECEIVED,
          fromMmaCode: null,
          toMmaCode: mmaCode,
          supplierId,
          dispatchShade: shade,
          receiveShade: shade,
          dispatchQty: qty,
          receiveQty: qty,
          meta: meta ?? null,
          receivedAt: new Date(),
        },
      });
    },

    async dispatch({ fromMmaCode, toMmaCode, supplierId, shade, qty, meta }) {
      assertMma(fromMmaCode, 'fromMmaCode');
      assertMma(toMmaCode, 'toMmaCode');
      if (fromMmaCode === toMmaCode)
        throw new Error('fromMmaCode and toMmaCode must differ');
      assertPositiveQty(qty);
      assertShade(shade);

      return prisma.$transaction(async (tx) => {
        const Raw3 = getMMA3SDelegate(tx);
        if (!Raw3) throw new Error('Prisma model for MMA3S not found on transaction (expected mMA3S)');

        const available = await onHandTx(tx, {
          mmaCode: fromMmaCode,
          supplierId,
          shade,
        });
        if (Number(available) < Number(qty)) {
          throw new Error(
            `Insufficient stock at ${fromMmaCode} for supplier=${supplierId}, shade=${shade}. ` +
              `available=${available}, requested=${qty}`
          );
        }

        return Raw3.create({
          data: {
            bornAs: BornAs.TRANSFER,
            status: EdgeStatus.IN_TRANSIT,
            fromMmaCode,
            toMmaCode,
            supplierId,
            dispatchShade: shade,
            dispatchQty: qty,
            meta: meta ?? null,
          },
        });
      });
    },

    // Completes the SAME row created at dispatch. Verifies supplier & destination MMA.
    async receive({ id, toMmaCode, supplierId, receiveQty, receiveShade, meta }) {
      if (id == null) throw new Error('receive() requires row id');
      if (!supplierId) throw new Error('receive() requires supplierId for verification');
      if (!toMmaCode) throw new Error('receive() requires toMmaCode for verification');

      return prisma.$transaction(async (tx) => {
        const Raw3 = getMMA3SDelegate(tx);
        if (!Raw3) throw new Error('Prisma model for MMA3S not found on transaction (expected mMA3S)');

        const row = await Raw3.findUnique({ where: { id } });
        if (!row) throw new Error('Transfer not found');
        if (row.bornAs !== 'TRANSFER') throw new Error('Row is not a TRANSFER');
        if (row.status === 'CANCELED') throw new Error('Transfer is canceled');

        if (row.status === 'RECEIVED') {
          if (meta && JSON.stringify(meta) !== JSON.stringify(row.meta ?? null)) {
            await Raw3.update({ where: { id: row.id }, data: { meta } });
          }
          return row;
        }

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

        return Raw3.update({
          where: { id: row.id },
          data: {
            status: EdgeStatus.RECEIVED,
            receiveQty: finalQty,
            receiveShade: finalShade,
            receivedAt: new Date(),
            meta: meta ?? row.meta,
          },
        });
      });
    },

    async cancel({ id, meta }) {
      if (id == null) throw new Error('cancel() requires row id');

      return prisma.$transaction(async (tx) => {
        const Raw3 = getMMA3SDelegate(tx);
        if (!Raw3) throw new Error('Prisma model for MMA3S not found on transaction (expected mMA3S)');

        const row = await Raw3.findUnique({ where: { id } });
        if (!row) throw new Error('Transfer not found');
        if (row.bornAs !== 'TRANSFER') throw new Error('Row is not a TRANSFER');
        if (row.status !== 'IN_TRANSIT')
          throw new Error('Only IN_TRANSIT transfers can be canceled');

        return Raw3.update({
          where: { id },
          data: { status: EdgeStatus.CANCELED, meta: meta ?? row.meta },
        });
      });
    },

    // reads ----------------------------------------------------------------
    async onHand({ mmaCode, supplierId, shade }) {
      assertMma(mmaCode, 'mmaCode');
      return prisma.$transaction((tx) =>
        onHandTx(tx, { mmaCode, supplierId, shade })
      );
    },

    // Summarize per (supplierId, shade)
    async stock({ mmaCode, positiveOnly = true } = {}) {
      assertMma(mmaCode, 'mmaCode');

      const Raw3 = getMMA3SDelegate(prisma);
      if (!Raw3) throw new Error('Prisma model for MMA3S not found (expected prisma.mMA3S)');

      const [depositsIn, transfersIn, transfersOut] = await prisma.$transaction([
        Raw3.groupBy({
          by: ['supplierId', 'receiveShade'],
          where: { bornAs: BornAs.DEPOSIT, toMmaCode: mmaCode },
          _sum: { receiveQty: true },
        }),
        Raw3.groupBy({
          by: ['supplierId', 'receiveShade'],
          where: {
            bornAs: BornAs.TRANSFER,
            toMmaCode: mmaCode,
            status: EdgeStatus.RECEIVED,
          },
          _sum: { receiveQty: true },
        }),
        Raw3.groupBy({
          by: ['supplierId', 'dispatchShade'],
          where: {
            bornAs: BornAs.TRANSFER,
            fromMmaCode: mmaCode,
            status: { in: [EdgeStatus.IN_TRANSIT, EdgeStatus.RECEIVED] },
          },
          _sum: { dispatchQty: true },
        }),
      ]);

      const key = (sid, shade) => `${sid}::${shade}`;
      const acc = new Map();
      const add = (sid, shade, delta) => {
        const k = key(sid, shade);
        acc.set(k, (acc.get(k) ?? 0) + Number(delta ?? 0));
      };

      for (const r of depositsIn)
        add(r.supplierId, r.receiveShade, r._sum.receiveQty ?? 0);
      for (const r of transfersIn)
        add(r.supplierId, r.receiveShade, r._sum.receiveQty ?? 0);
      for (const r of transfersOut)
        add(r.supplierId, r.dispatchShade, -Number(r._sum.dispatchQty ?? 0));

      const rows = [];
      for (const [k, qty] of acc.entries()) {
        const [supplierIdStr, shade] = k.split('::');
        if (!positiveOnly || qty > 0) {
          rows.push({ supplierId: Number(supplierIdStr), shade, qty });
        }
      }
      rows.sort((a, b) => b.qty - a.qty);
      return rows;
    },

    async inbound({ mmaCode, status = 'IN_TRANSIT' } = {}) {
      assertMma(mmaCode, 'mmaCode');

      const Raw3 = getMMA3SDelegate(prisma);
      if (!Raw3) throw new Error('Prisma model for MMA3S not found (expected prisma.mMA3S)');

      const where = {
        toMmaCode: mmaCode,
        bornAs: BornAs.TRANSFER,
        ...(status ? { status } : {}),
      };
      return Raw3.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      });
    },

    async outbound({ mmaCode, status = 'IN_TRANSIT' } = {}) {
      assertMma(mmaCode, 'mmaCode');

      const Raw3 = getMMA3SDelegate(prisma);
      if (!Raw3) throw new Error('Prisma model for MMA3S not found (expected prisma.mMA3S)');

      const where = {
        fromMmaCode: mmaCode,
        bornAs: BornAs.TRANSFER,
        ...(status ? { status } : {}),
      };
      return Raw3.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      });
    },

    // mirrors activeSlots() from 4S; returns positive stock lines
    async activePiles({ mmaCode }) {
      return this.stock({ mmaCode, positiveOnly: true });
    },
  };
}

// Optional default instance (supply registry at runtime)
const defaultRegistry = []; // e.g. ["JSS.RAW", "PSS.DUMP"]
const _default = createMMA3S({ registry: defaultRegistry });
export default _default;
