// ===============================
// /src/lib/core/pss/pss.sorted.js
// PSS — SORTED stage helpers
// ===============================
import { prisma, sortedStock } from '../../stocks/index.js';

const STATION = 'PSS';
const MMA_CODE = 'PSS_SORTED';

const ROUTES = {
  KEF: { stationCode: 'KEF', mmaCode: 'KEF_SORTED' },
};

// ————— utilities —————
const nz2 = (n) => Number(n);
const jmeta2 = (m) => (m && typeof m === 'object' ? m : {});
function assertIds2({ supplierId }) {
  const id = nz2(supplierId);
  if (!Number.isFinite(id) || id <= 0) throw new Error('Invalid supplierId');
  return id;
}
function assertQty2(qty) {
  const q = nz2(qty);
  if (!Number.isFinite(q) || q <= 0) throw new Error('Invalid qty');
  return q;
}
function assertText2(v, name) {
  if (!v || typeof v !== 'string') throw new Error(`Invalid ${name}`);
  return v;
}
async function supplierIdFromSortedTransport(transportId) {
  const id = nz2(transportId);
  if (!Number.isFinite(id) || id <= 0) throw new Error('Invalid transportId');
  const row = await prisma.sortedTransport.findFirst({
    where: { transportId: id, type: 'DISPATCH' },
    select: { supplierId: true },
  });
  if (!row) throw new Error('DISPATCH not found for transportId');
  return row.supplierId;
}

const PssSorted = {
  code: MMA_CODE,

  // Seed stock at PSS_SORTED (used by tests)
  async purchaseSorted({ supplierId, shade, size, qty, meta } = {}) {
    const sId = assertIds2({ supplierId });
    const q = assertQty2(qty);
    const Sh = assertText2(shade, 'shade');
    const Sz = assertText2(size, 'size');

    return sortedStock.deposit({
      toStationCode: STATION,
      toMmaCode: MMA_CODE,
      supplierId: sId,
      shade: Sh,
      size: Sz,
      qty: q,
      meta: jmeta2(meta),
    });
  },

  // Ship sorted → KEF_SORTED
  async dispatchSortedToKef({ supplierId, shade, size, qty, meta } = {}) {
    const sId = assertIds2({ supplierId });
    const q = assertQty2(qty);
    const Sh = assertText2(shade, 'shade');
    const Sz = assertText2(size, 'size');

    return sortedStock.dispatch({
      fromStationCode: STATION,
      fromMmaCode: MMA_CODE,
      toStationCode: ROUTES.KEF.stationCode,
      toMmaCode: ROUTES.KEF.mmaCode,
      supplierId: sId,
      shade: Sh,
      size: Sz,
      qty: q,
      meta: jmeta2(meta),
    });
  },

  // Complete inbound to PSS_SORTED (works even if caller omits supplierId)
  async receiveSorted({ transportId, supplierId, meta } = {}) {
    const sId = supplierId ? nz2(supplierId) : await supplierIdFromSortedTransport(transportId);
    if (!Number.isFinite(sId) || sId <= 0) throw new Error('Invalid supplierId');

    return sortedStock.receive({
      transportId: nz2(transportId),
      toStationCode: STATION,
      toMmaCode: MMA_CODE,
      supplierId: sId,
      meta: jmeta2(meta),
    });
  },
};

export default PssSorted;
