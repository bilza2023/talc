// src/lib/core/kef/kef.js
// KEF façade — single MMA (sorted). Only verb for now: receive from PSS.

import { prisma, sortedStock } from '../../stocks/index.js';

const STATION = 'KEF';
const MMA = { SORTED: 'KEF_SORTED' };

/* tiny utils (kept here for testability & parity with PSS) */
const asNum = (n) => Number(n);
const asStr = (v) => String(v);
const jmeta = (m) => (m && typeof m === 'object' ? m : {});

function assertId(id, name = 'supplierId') {
  const n = asNum(id);
  if (!Number.isFinite(n) || n <= 0) throw new Error(`Invalid ${name}`);
  return n;
}

/* lookup supplierId from DISPATCH row if not provided (same as PSS pattern) */
async function supplierIdFromSortedTransport(transportId) {
  const tid = asStr(transportId);
  const row = await prisma.sortedTransport.findFirst({
    where: { transportId: tid, type: 'DISPATCH' },
    select: { supplierId: true }
  });
  if (!row) throw new Error('DISPATCH not found for transportId');
  return row.supplierId;
}

const Kef = {
  code: STATION,
  mma: { ...MMA },

  /**
   * Receive "screened/sorted" coming from PSS into KEF_SORTED.
   * If supplierId is omitted, we infer it from the DISPATCH row.
   */
  async receiveSorted({ transportId, supplierId, qty, shade, amount, meta } = {}) {
    const tid = asStr(transportId);
    const sId = supplierId != null
      ? assertId(supplierId)
      : await supplierIdFromSortedTransport(tid);

    return sortedStock.receive({
      transportId: tid,
      toMmaCode: MMA.SORTED,
      toStationCode: STATION,
      supplierId: sId,
      // Optional overrides; if omitted, Stock.receive will default from DISPATCH
      qty,
      shade,
      amount,
      meta: jmeta(meta)
    });
  }
};

export default Kef;
