// ABS — SCREENED (processed family)
// Minimal loader: keep the page API the same as before.
import { processedStock } from '$lib/stocks/index.js';

function stationFrom(mma) {
  return (mma.split('_')[0] || '').toUpperCase();
}

export const load = async () => {
  const mmaCode = 'ABS_SCREENED';            // <- aligned to your naming
  const positiveOnly = true;                 // keep UI clean

  const slots = await processedStock.slots({ mmaCode, positiveOnly });
  const stationCode = stationFrom(mmaCode);

  return {
    stationCode,
    mmaCode,
    positiveOnly,
    slots
  };
};
