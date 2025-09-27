// ===============================
// /src/lib/core/pss/pss.processed.js
// PSS — PROCESSED (screened) stage helpers
// ===============================
import { prisma, processedStock } from '../../stocks/index.js';

const STATION = 'PSS';
const MMA_CODE = 'PSS_PROCESSED';

// External routes allowed from PSS (processed)
const ROUTES = {
  KEF: { stationCode: 'KEF', mmaCode: 'KEF_SORTED' },
};

// ————— utilities —————
const nz = (n) => Number(n);
const jmeta = (m) => (m && typeof m === 'object' ? m : {});
function assertIds({ supplierId }) {
  const id = nz(supplierId);
  if (!Number.isFinite(id) || id <= 0) throw new Error('Invalid supplierId');
  return id;
}
function assertQty(qty) {
  const q = nz(qty);
  if (!Number.isFinite(q) || q <= 0) throw new Error('Invalid qty');
  return q;
}
function assertText(v, name) {
  if (!v || typeof v !== 'string') throw new Error(`Invalid ${name}`);
  return v;
}

// Pull supplierId from the DISPATCH row if caller didn’t provide it
async function supplierIdFromProcessedTransport(transportId) {
  const id = nz(transportId);
  if (!Number.isFinite(id) || id <= 0) throw new Error('Invalid transportId');
  const row = await prisma.processedTransport.findFirst({
    where: { transportId: id, type: 'DISPATCH' },
    select: { supplierId: true },
  });
  if (!row) throw new Error('DISPATCH not found for transportId');
  return row.supplierId;
}

const PssProcessed = {
  code: MMA_CODE,

  // Seed stock at PSS_PROCESSED (used by tests)
  async purchaseProcessed({ supplierId, shade, size, qty, meta } = {}) {
    const sId = assertIds({ supplierId });
    const q = assertQty(qty);
    const Sh = assertText(shade, 'shade');
    const Sz = assertText(size, 'size');

    return processedStock.deposit({
      toStationCode: STATION,
      toMmaCode: MMA_CODE,
      supplierId: sId,
      shade: Sh,
      size: Sz,
      qty: q,
      meta: jmeta(meta),
    });
  },

  // Ship processed → KEF_SORTED
  async dispatchProcessedToKef({ supplierId, shade, size, qty, meta } = {}) {
    const sId = assertIds({ supplierId });
    const q = assertQty(qty);
    const Sh = assertText(shade, 'shade');
    const Sz = assertText(size, 'size');

    return processedStock.dispatch({
      fromStationCode: STATION,
      fromMmaCode: MMA_CODE,
      toStationCode: ROUTES.KEF.stationCode,
      toMmaCode: ROUTES.KEF.mmaCode,
      supplierId: sId,
      shade: Sh,
      size: Sz,
      qty: q,
      meta: jmeta(meta),
    });
  },

  // Receive processed sent to PSS (e.g., ABS → PSS_PROCESSED)
  async receiveProcessed({ transportId, supplierId, meta } = {}) {
    // Allow caller to omit supplierId; fetch from dispatch row
    const sId = supplierId ? nz(supplierId) : await supplierIdFromProcessedTransport(transportId);
    if (!Number.isFinite(sId) || sId <= 0) throw new Error('Invalid supplierId');

    return processedStock.receive({
      transportId: nz(transportId),
      toStationCode: STATION,
      toMmaCode: MMA_CODE,
      supplierId: sId,
      meta: jmeta(meta),
    });
  },
};

export default PssProcessed;
