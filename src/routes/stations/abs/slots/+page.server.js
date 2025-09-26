// /home/bilal-tariq/ab/src/routes/stations/abs/slots/+page.server.js
import { error } from '@sveltejs/kit';
import Abs from '$lib/core/abs/abs.js';

const STATION_CODE = 'ABS';

// Hard-whitelisted routes for this station's MMAs (UI-friendly labels + URL params)
const DISPATCH_ROUTES = {
  ABS_UNSCREENED_RAW: [
    { toStation: 'PSS', toMma: 'PSS_SORTED', label: '→ PSS / SORTED' },
    { toStation: 'KEF', toMma: 'KEF_SORTED', label: '→ KEF / SORTED' }
  ]
};

// Process links per MMA (local transformations)
const PROCESS_ROUTES = {
  ABS_UNSCREENED_RAW: [
    { toMma: 'ABS_SCREENED', label: 'Screen (→ ABS_SCREENED)' }
  ]
};

/** @type {import('./$types').PageServerLoad} */
export const load = async () => {
  const station = Abs;
  if (!station) throw error(500, 'ABS station not available');

  // Build sections per MMA using the MMA **instance API**
  const mmaEntries = Object.entries(station.mmas);
  const sections = [];

  for (const [mmaCode, mma] of mmaEntries) {
    // positive-only live slots; switch to { activeOnly:false } to debug full grid
    const slots = await mma.slots({ activeOnly: true }); // [{ supplierId, supplierName, shade, size, qty, ... }]

    const rows = slots.map((s) => {
      const common =
        `fromStation=${encodeURIComponent(STATION_CODE)}` +
        `&fromMma=${encodeURIComponent(mmaCode)}` +
        `&supplierId=${encodeURIComponent(s.supplierId)}` +
        `&shade=${encodeURIComponent(s.shade)}` +
        `&size=${encodeURIComponent(s.size)}`;

      const dispatchLinks = (DISPATCH_ROUTES[mmaCode] ?? []).map((r) => ({
        label: r.label,
        // use a central process/dispatch route; adjust if your app uses another path
        href:
          `/process/dispatch?${common}` +
          `&toStation=${encodeURIComponent(r.toStation)}` +
          `&toMma=${encodeURIComponent(r.toMma)}`
      }));

      const processLinks = (PROCESS_ROUTES[mmaCode] ?? []).map((p) => ({
        label: p.label,
        // screen is a local process (withdraw→deposit): handled by the process route
        href: `/process/screen?${common}&toMma=${encodeURIComponent(p.toMma)}`
      }));

      return {
        supplierId: s.supplierId,
        supplierName: s.supplierName,
        shade: s.shade,
        size: s.size,
        qty: s.qty,
        dispatchLinks,
        processLinks
      };
    });

    sections.push({ mmaCode, rows });
  }

  return {
    stationCode: station.code,
    stationName: station.name,
    sections // [{ mmaCode, rows: [...] }]
  };
};
