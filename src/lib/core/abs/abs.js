// /home/bilal-tariq/ab/src/lib/core/abs/abs.js
import Mma from '$lib/core/Mma.js';
import createAbsUnscreenedRaw from '$lib/core/abs/abs_unscreened_raw.js';
import { rawStock, sortedStock } from '$lib/stocks/index.js';

const STATION_CODE = 'ABS';
const MMA_UNSCREENED = 'ABS_UNSCREENED_RAW';
const MMA_SCREENED   = 'ABS_SCREENED';

// Station-level policy lists
const SHADE_LIST = ['WHITE', 'GREY', 'LIGHTGREY', 'GREEN', 'MIXED'];
const SIZE_LIST  = ['LUMPS', 'CHIPS', 'FINE'];

// Hard-coded suppliers for ABS
const SUPPLIERS_ABS = [{ id: 540, name: 'ABS Supplier' }];

async function getSuppliersABS() {
  return SUPPLIERS_ABS;
}

// Base Mma (has onHand/slots/inbound/outbound)
const baseUnscreened = new Mma({
  stationCode: STATION_CODE,
  mmaCode: MMA_UNSCREENED,
  stock: rawStock,
  shadeList: SHADE_LIST,
  sizeList: SIZE_LIST,
  services: { getSuppliers: getSuppliersABS }
});

// Capability wrapper (only business verbs)
const caps = createAbsUnscreenedRaw({
  base: baseUnscreened,
  depositToScreened: (payload) =>
    sortedStock.deposit({ ...payload, mmaCode: MMA_SCREENED })
});

// Compose: expose BOTH business verbs and base pass-throughs
const abs_unscreened_raw = {
  ...caps,
  onHand:   (...a) => baseUnscreened.onHand(...a),
  slots:    (o)    => baseUnscreened.slots(o),
  inbound:  (...a) => baseUnscreened.inbound(...a),
  outbound: (...a) => baseUnscreened.outbound(...a)
};

const Abs = {
  code: STATION_CODE,
  name: 'Abbottabad Sorting Station',
  mmas: { [MMA_UNSCREENED]: abs_unscreened_raw },
  mma(code) { return this.mmas[code] ?? null; }
};

export default Abs;
