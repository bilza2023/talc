
// /src/lib/core/abs/abs.screened.js
import { processedStock } from '$lib/stocks/index.js';

const STATION = 'ABS';
const MMA_CODE = 'ABS_SCREENED';

// Screened dispatch targets (owned by this MMA)
const ROUTES = {
  PSS: { stationCode: 'PSS', mmaCode: 'PSS_SORTED' },
  KEF: { stationCode: 'KEF', mmaCode: 'KEF_SORTED' }
};

const nz = (n) => Number(n);
const jmeta = (m) => (m && typeof m === 'object' ? m : {});
function guard({ supplierId, shade, size, qty }) {
  if (!Number.isFinite(nz(supplierId)) || nz(supplierId) <= 0) throw new Error('Invalid supplierId');
  if (!shade) throw new Error('Invalid shade');
  if (!size) throw new Error('Invalid size');
  if (!Number.isFinite(nz(qty)) || nz(qty) <= 0) throw new Error('Invalid qty');
}

const AbsScreened = {
  station: STATION,
  code: MMA_CODE,
  routes: { ...ROUTES },

  async purchaseScreened({ supplierId, shade, size, qty, meta } = {}) {
    guard({ supplierId, shade, size, qty });
    return processedStock.deposit({
      stationCode: STATION,
      mmaCode: MMA_CODE,
      bornAs: 'purchase',
      supplierId: nz(supplierId),
      shade, size,
      createdTon: nz(qty),
      meta: jmeta(meta)
    });
  },

  async dispatchScreenedToPss({ supplierId, shade, size, qty, meta } = {}) {
    guard({ supplierId, shade, size, qty });
    const r = ROUTES.PSS;
    return processedStock.dispatch({
      fromStationCode: STATION,
      fromMmaCode: MMA_CODE,
      toStationCode: r.stationCode,
      toMmaCode: r.mmaCode,
      supplierId: nz(supplierId),
      shade, size,
      createdTon: nz(qty),
      meta: jmeta(meta)
    });
  },

  async dispatchScreenedToKef({ supplierId, shade, size, qty, meta } = {}) {
    guard({ supplierId, shade, size, qty });
    const r = ROUTES.KEF;
    return processedStock.dispatch({
      fromStationCode: STATION,
      fromMmaCode: MMA_CODE,
      toStationCode: r.stationCode,
      toMmaCode: r.mmaCode,
      supplierId: nz(supplierId),
      shade, size,
      createdTon: nz(qty),
      meta: jmeta(meta)
    });
  },

  async receiveScreened({ rowId, meta } = {}) {
    const id = nz(rowId);
    if (!Number.isFinite(id) || id <= 0) throw new Error('Invalid rowId');
    return processedStock.receive({
      stationCode: STATION,
      mmaCode: MMA_CODE,
      rowId: id,
      meta: jmeta(meta)
    });
  }
};

export default AbsScreened;
