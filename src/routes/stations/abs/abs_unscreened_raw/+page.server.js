// ABS — UNSCREENED (raw family)
import { rawStock } from '$lib/stocks/index.js';

function stationFrom(mma) {
  return (mma.split('_')[0] || '').toUpperCase();
}

export const load = async () => {
  const mmaCode = 'ABS_UNSCREENED_RAW';      // <- aligned to your naming
  const positiveOnly = true;

  const slots = await rawStock.slots({ mmaCode, positiveOnly });
  const stationCode = stationFrom(mmaCode);

  return {
    stationCode,
    mmaCode,
    positiveOnly,
    slots
  };
};
