// PSS — SCREENED (processed family)
import { processedStock } from '$lib/stocks/index.js';

function stationFrom(mma) {
  return (mma.split('_')[0] || '').toUpperCase();
}

export const load = async () => {
  const mmaCode = 'PSS_SCREENED';
  const positiveOnly = true;

  const slots = await processedStock.slots({ mmaCode, positiveOnly });
  const stationCode = stationFrom(mmaCode);

  return {
    stationCode,
    mmaCode,
    positiveOnly,
    slots
  };
};
