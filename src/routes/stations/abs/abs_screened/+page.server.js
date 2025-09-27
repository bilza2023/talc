
// /src/routes/unscreened/+page.server.js
import { processedStock } from '$lib/stocks/index.js';


export const load = async ({ url }) => {
  const mmaCode =  'ABS_PROCESSED';
  const positiveOnly = true; // keep UI clean; switch to false if you want zero/negative

  const slots = await processedStock.slots({ mmaCode, positiveOnly });
//  console.log("slots",slots);
  // derive station code from MMA (e.g., 'ABS' from 'ABS_UNSCREENED_RAW')
  const stationCode = (mmaCode.split('_')[0] || '').toUpperCase();

  return {
    stationCode,
    mmaCode,
    positiveOnly,
    slots
  };
};
