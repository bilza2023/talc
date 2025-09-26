// /src/lib/core/abs/abs.js
// ABS façade: one object literal that exposes 9 verbs and hides MMA/category wiring.
import AbsUnscreened from './abs.unscreened.js';
import AbsScreened from './abs.screened.js';
import { rawStock, processedStock } from '../../stocks/index.js';
import getStationSuppliers from '../getStationSuppliers.js';

const STATION = 'ABS';
const SHADES = ['WHITE', 'GREY', 'LIGHTGREY', 'GREEN', 'MIXED'];
const SIZES  = ['LUMPS', 'CHIPS', 'FINE'];

const Abs = {
  /* Station identity + UI helpers */
  code: STATION,
  mma: { UNSCREENED: AbsUnscreened.code, SCREENED: AbsScreened.code },
  async suppliers() { return getStationSuppliers(STATION); },
  shades: SHADES,
  sizes: SIZES,

  /* Unscreened verbs (from MMA module) */
  purchaseUnscreened: AbsUnscreened.purchaseUnscreened,
  dispatchUnscreenedToPss: AbsUnscreened.dispatchUnscreenedToPss,
  dispatchUnscreenedToKef: AbsUnscreened.dispatchUnscreenedToKef,
  receiveUnscreened: AbsUnscreened.receiveUnscreened,

  /* Screened verbs (from MMA module) */
  purchaseScreened: AbsScreened.purchaseScreened,
  dispatchScreenedToPss: AbsScreened.dispatchScreenedToPss,
  dispatchScreenedToKef: AbsScreened.dispatchScreenedToKef,
  receiveScreened: AbsScreened.receiveScreened,

  /* Process: Unscreened → Screened (internal, orchestrated here) */
  async screening({ supplierId, shade, size, qty, meta } = {}) {
    // 1) create an in-transit row from UNSCREENED to SCREENED
    const out = await rawStock.dispatch({
      fromStationCode: STATION,
      fromMmaCode: AbsUnscreened.code,
      toStationCode: STATION,
      toMmaCode: AbsScreened.code,
      supplierId: Number(supplierId),
      shade, size,
      createdTon: Number(qty),
      meta: meta && typeof meta === 'object' ? meta : {},
      bornAs: 'process:screening'
    });

    // 2) complete at SCREENED
    const rowId = out?.id ?? out?.rowId;
    return processedStock.receive({
      stationCode: STATION,
      mmaCode: AbsScreened.code,
      rowId,
      meta: meta && typeof meta === 'object' ? meta : {}
    });
  }
};

export default Abs;
