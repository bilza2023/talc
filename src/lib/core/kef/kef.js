// KEF façade — single-file, receive-only (sorted)
// Scope: only receive what PSS sends → lands in KEF_SORTED

import { prisma, sortedStock } from '../../stocks/index.js';

const STATION = 'KEF';
const MMA = { SORTED: 'KEF_SORTED' };

const asStr = (v) => String(v);
const asNum = (n) => Number(n);
const jmeta = (m) => (m && typeof m === 'object' ? m : {});

function assertId(id, name = 'supplierId') {
  const n = asNum(id);
  if (!Number.isFinite(n) || n <= 0) throw new Error(`Invalid ${name}`);
  return n;
}

// If caller omits supplierId, pick it from the DISPATCH row
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

  // Complete inbound to KEF_SORTED
  async receiveSorted({ transportId, supplierId, meta } = {}) {
    const tid = asStr(transportId);
    const sId =
      supplierId != null ? assertId(supplierId) : await supplierIdFromSortedTransport(tid);

    return sortedStock.receive({
      transportId: tid,
      toStationCode: STATION,
      toMmaCode: MMA.SORTED,
      supplierId: sId,
      meta: jmeta(meta)
    });
  }
};

export default Kef;
