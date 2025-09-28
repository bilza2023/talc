
// Declarative registry of stations and their MMAs.
// Keep this file as DATA (no DB calls). Everything else reads from here.

import { FAMILY, STATION } from './constants.js';

export const StationRegistry = {
  [STATION.ABS]: {
    code: STATION.ABS,
    label: 'Abbottabad Sorting Station',
    mmas: {
      [FAMILY.RAW]:      { family: FAMILY.RAW,      mmaCode: 'ABS_UNSCREENED_RAW', label: 'ABS Unscreened', verbs: ['purchase','dispatch','receive'] },
      [FAMILY.SCREENED]: { family: FAMILY.SCREENED, mmaCode: 'ABS_SCREENED',       label: 'ABS Screened',   verbs: ['dispatch','receive'] }
    }
  },

  [STATION.PSS]: {
    code: STATION.PSS,
    label: 'Peshawar Screening & Sorting',
    mmas: {
      [FAMILY.SCREENED]: { family: FAMILY.SCREENED, mmaCode: 'PSS_PROCESSED', label: 'PSS Screened', verbs: ['purchase','dispatch','receive','process'] },
      [FAMILY.SORTED]:   { family: FAMILY.SORTED,   mmaCode: 'PSS_SORTED',    label: 'PSS Sorted',   verbs: ['dispatch','receive'] }
    }
  },

  [STATION.KEF]: {
    code: STATION.KEF,
    label: 'Kohat Export Facility',
    mmas: {
      [FAMILY.SORTED]:   { family: FAMILY.SORTED,   mmaCode: 'KEF_SORTED',    label: 'KEF Sorted',   verbs: ['receive'] }
    }
  }
};

// ---------- tiny helpers (pure reads) ----------
export function getStation(code) {
  const st = StationRegistry[code];
  if (!st) throw new Error(`Unknown station: ${code}`);
  return st;
}
export function getMma(stationCode, family) {
  const st = getStation(stationCode);
  const mma = st.mmas?.[family];
  if (!mma) throw new Error(`Station ${stationCode} has no MMA for family ${family}`);
  return mma;
}
export function hasMma(stationCode, family) {
  return !!StationRegistry[stationCode]?.mmas?.[family];
}
