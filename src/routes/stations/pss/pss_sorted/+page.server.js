// PSS — SORTED (sorted family)
import { sortedStock } from '$lib/stocks/index.js';

function stationFrom(mma) {
  return (mma.split('_')[0] || '').toUpperCase();
}

export const load = async () => {
  const mmaCode = 'PSS_SORTED';
  const positiveOnly = true;

  const slots = await sortedStock.slots({ mmaCode, positiveOnly });
  const stationCode = stationFrom(mmaCode);

  return {
    stationCode,
    mmaCode,
    positiveOnly,
    slots
  };
};
