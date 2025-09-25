

// /src/routes/stations/abs/+page.server.js
import { error } from '@sveltejs/kit';
import Abs from '$lib/core/abs/abs.js';

/** @type {import('./$types').PageServerLoad} */
export const load = async () => {
  const station = Abs;

  if (!station) {
    throw error(500, 'Station ABS is not available. Check $lib/core/abs/abs.js');
  }

  // Collect live data for each MMA instance
  const mmaEntries = Object.entries(station.mmas);
  if (mmaEntries.length === 0) {
    throw error(500, 'Station ABS has no MMAs defined.');
  }

  const mmas = await Promise.all(
    mmaEntries.map(async ([mmaCode, mma]) => {
      const [onHand, slots, inbound, outbound] = await Promise.all([
        mma.onHand(),
        mma.slots({ activeOnly: true }),
        mma.inbound(),
        mma.outbound()
      ]);

      return { mmaCode, onHand, slots, inbound, outbound };
    })
  );

  return {
    stationCode: station.code,
    stationName: station.name,
    mmas
  };
};
