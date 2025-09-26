
// /src/routes/unscreened/+page.server.js
import { rawStock } from '$lib/stocks/index.js';

/**
 * Unscreened slots page
 * - Reads slot balances for an UNSCREENED/RAW MMA.
 * - Default MMA: ABS_UNSCREENED_RAW
 * - Optional: pass ?mma=STATION_UNSCREENED_RAW to switch (e.g., PSS_UNSCREENED_RAW)
 * - Shows only positive slots by default.
 */
export const load = async ({ url }) => {
  const mmaCode = url.searchParams.get('mma') || 'ABS_UNSCREENED_RAW';
  const positiveOnly = true; // keep UI clean; switch to false if you want zero/negative

  const slots = await rawStock.slots({ mmaCode, positiveOnly });

  // derive station code from MMA (e.g., 'ABS' from 'ABS_UNSCREENED_RAW')
  const stationCode = (mmaCode.split('_')[0] || '').toUpperCase();

  return {
    stationCode,
    mmaCode,
    positiveOnly,
    slots
  };
};
