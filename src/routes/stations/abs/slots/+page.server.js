// Station: ABS — Slots overview (by MMA)
// Lists each MMA's positive slots and provides pre-filled action links.

import { rawStock, processedStock, sortedStock } from '$lib/stocks/index.js';
import { stations } from '../../../../lib/stations/stations';

// Hard-set for this route
const STATION_CODE = 'ABS';

// Where each ABS MMA is allowed to dispatch
// (keep this small and explicit; UI reads from here)
const DISPATCH_TARGETS = {
  ABS_RAW: [], // raw normally goes to 'screen' (process) not dispatch
  ABS_PROCESSED: [
    { toStationCode: 'PSS', toMmaCode: 'PSS_PROCESSED', label: '→ PSS / PROCESSED' }
  ],
  // add more later if needed
};

const STOCK_BY_MMA = {
  ABS_RAW: rawStock,
  ABS_PROCESSED: processedStock,
  // add ABS_SORTED if you create it later
};

export async function load() {
  const station = stations.ABS; // { stationCode, mmas:[{mmaCode,stock}] }
  const mmaCodes = station.mmas.map(m => m.mmaCode);

  const sections = [];
  for (const mmaCode of mmaCodes) {
    const stock = STOCK_BY_MMA[mmaCode];
    if (!stock) continue;

    const slots = await stock.slots({ mmaCode, positiveOnly: true }); // [{supplierId,shade,size,qty},...]

    // Attach precomputed dispatch links per slot
    const rows = slots.map(s => {
      const common = `fromStation=${STATION_CODE}&fromMma=${mmaCode}` +
                     `&supplierId=${s.supplierId}&shade=${encodeURIComponent(s.shade)}` +
                     `&size=${encodeURIComponent(s.size)}`;
      const dispatchLinks = (DISPATCH_TARGETS[mmaCode] ?? []).map(t => ({
        label: t.label,
        href: `/stations/${STATION_CODE}/dispatch?${common}` +
              `&toStation=${t.toStationCode}&toMma=${t.toMmaCode}`
      }));
      const processLinks = [];
      // Example: screen from RAW, sort from PROCESSED (optional pages)
      if (mmaCode === 'ABS_RAW') {
        processLinks.push({
          label: 'Screen (RAW → PROCESSED)',
          href: `/stations/${STATION_CODE}/screen?${common}&toMma=ABS_PROCESSED`
        });
      }
      if (mmaCode === 'ABS_PROCESSED') {
        processLinks.push({
          label: 'Sort (PROCESSED → SORTED)',
          href: `/stations/${STATION_CODE}/sort?${common}&toMma=ABS_SORTED`
        });
      }

      return { ...s, dispatchLinks, processLinks };
    });

    sections.push({ mmaCode, rows });
  }

  return {
    stationCode: STATION_CODE,
    sections,                  // [{ mmaCode, rows:[{supplierId,shade,size,qty,dispatchLinks,processLinks}] }]
  };
}
