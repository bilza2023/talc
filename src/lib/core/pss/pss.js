// PSS façade — single file (processed + sorted)
// Minimal helpers used by tests: purchase*, dispatch*ToKef, receive*

import { prisma, processedStock, sortedStock } from '../../stocks/index.js';

const STATION = 'PSS';
const MMA = {
  PROCESSED: 'PSS_PROCESSED',
  SORTED: 'PSS_SORTED'
};
const ROUTES = {
  KEF: { stationCode: 'KEF', mmaCode: 'KEF_SORTED' }
};

/* util */
const asNum = (n) => Number(n);
const asStr = (v) => String(v);
const jmeta = (m) => (m && typeof m === 'object' ? m : {});

function assertQty(qty) {
  const q = asNum(qty);
  if (!Number.isFinite(q) || q <= 0) throw new Error('Invalid qty');
  return q;
}
function assertId(id, name = 'supplierId') {
  const n = asNum(id);
  if (!Number.isFinite(n) || n <= 0) throw new Error(`Invalid ${name}`);
  return n;
}
function assertText(v, name) {
  if (!v || typeof v !== 'string') throw new Error(`Invalid ${name}`);
  return v;
}

/* lookup supplierId from DISPATCH row if not provided */
async function supplierIdFromProcessedTransport(transportId) {
  const tid = asStr(transportId);
  const row = await prisma.processedTransport.findFirst({
    where: { transportId: tid, type: 'DISPATCH' },
    select: { supplierId: true }
  });
  if (!row) throw new Error('DISPATCH not found for transportId');
  return row.supplierId;
}
async function supplierIdFromSortedTransport(transportId) {
  const tid = asStr(transportId);
  const row = await prisma.sortedTransport.findFirst({
    where: { transportId: tid, type: 'DISPATCH' },
    select: { supplierId: true }
  });
  if (!row) throw new Error('DISPATCH not found for transportId');
  return row.supplierId;
}

const Pss = {
  code: STATION,
  mma: { ...MMA },

  // ===== processed =====
  async purchaseProcessed({ supplierId, shade, size, qty, meta } = {}) {
    return processedStock.deposit({
      toStationCode: STATION,
      toMmaCode: MMA.PROCESSED,
      supplierId: assertId(supplierId),
      shade: assertText(shade, 'shade'),
      size: assertText(size, 'size'),
      qty: assertQty(qty),
      meta: jmeta(meta)
    });
  },

  async dispatchProcessedToKef({ supplierId, shade, size, qty, meta } = {}) {
    return processedStock.dispatch({
      fromStationCode: STATION,
      fromMmaCode: MMA.PROCESSED,
      toStationCode: ROUTES.KEF.stationCode,
      toMmaCode: ROUTES.KEF.mmaCode,
      supplierId: assertId(supplierId),
      shade: assertText(shade, 'shade'),
      size: assertText(size, 'size'),
      qty: assertQty(qty),
      meta: jmeta(meta)
    });
  },

  async receiveProcessed({ transportId, supplierId, meta } = {}) {
    const tid = asStr(transportId);
    const sId = supplierId != null
      ? assertId(supplierId)
      : await supplierIdFromProcessedTransport(tid);

    return processedStock.receive({
      transportId: tid,
      toStationCode: STATION,
      toMmaCode: MMA.PROCESSED,
      supplierId: sId,
      meta: jmeta(meta)
    });
  },

  // ===== sorted =====
  async purchaseSorted({ supplierId, shade, size, qty, meta } = {}) {
    return sortedStock.deposit({
      toStationCode: STATION,
      toMmaCode: MMA.SORTED,
      supplierId: assertId(supplierId),
      shade: assertText(shade, 'shade'),
      size: assertText(size, 'size'),
      qty: assertQty(qty),
      meta: jmeta(meta)
    });
  },

  async dispatchSortedToKef({ supplierId, shade, size, qty, meta } = {}) {
    return sortedStock.dispatch({
      fromStationCode: STATION,
      fromMmaCode: MMA.SORTED,
      toStationCode: ROUTES.KEF.stationCode,
      toMmaCode: ROUTES.KEF.mmaCode,
      supplierId: assertId(supplierId),
      shade: assertText(shade, 'shade'),
      size: assertText(size, 'size'),
      qty: assertQty(qty),
      meta: jmeta(meta)
    });
  },

  async receiveSorted({ transportId, supplierId, meta } = {}) {
    const tid = asStr(transportId);
    const sId = supplierId != null
      ? assertId(supplierId)
      : await supplierIdFromSortedTransport(tid);

    return sortedStock.receive({
      transportId: tid,
      toStationCode: STATION,
      toMmaCode: MMA.SORTED,
      supplierId: sId,
      meta: jmeta(meta)
    });
  }
};

export default Pss;
