
// Single source of truth for allowed edges (routing policy).
// kind = 'process' (family change inside a station) OR 'transport' (between stations).

import { FAMILY, STATION } from './constants.js';

export const RouteMatrix = [
  // ABS RAW → ABS SCREENED (internal family change)
  {
    from: { station: STATION.ABS, family: FAMILY.RAW },
    to:   { station: STATION.ABS, family: FAMILY.SCREENED },
    kind: 'process',
    processName: 'screening',
    enabled: true
  },

  // PSS SCREENED → PSS SORTED (internal family change)
  {
    from: { station: STATION.PSS, family: FAMILY.SCREENED },
    to:   { station: STATION.PSS, family: FAMILY.SORTED },
    kind: 'process',
    processName: 'sorting',
    enabled: true
  },

  // ABS SCREENED → PSS SCREENED (transport)
  {
    from: { station: STATION.ABS, family: FAMILY.SCREENED },
    to:   { station: STATION.PSS, family: FAMILY.SCREENED },
    kind: 'transport',
    enabled: true
  },

  // PSS SORTED → KEF SORTED (transport)
  {
    from: { station: STATION.PSS, family: FAMILY.SORTED },
    to:   { station: STATION.KEF, family: FAMILY.SORTED },
    kind: 'transport',
    enabled: true
  },

  // Optional edge (currently disabled): PSS SCREENED → KEF SORTED
  {
    from: { station: STATION.PSS, family: FAMILY.SCREENED },
    to:   { station: STATION.KEF, family: FAMILY.SORTED },
    kind: 'transport',
    enabled: false
  }
];

// ---------- helpers ----------
export function findRoutesFrom(station, family, { enabledOnly = true } = {}) {
  return RouteMatrix.filter(r =>
    r.from.station === station &&
    r.from.family === family &&
    (!enabledOnly || r.enabled)
  );
}

export function findEdge({ fromStation, fromFamily, toStation, toFamily }) {
  return RouteMatrix.find(r =>
    r.from.station === fromStation &&
    r.from.family === fromFamily &&
    r.to.station === toStation &&
    r.to.family === toFamily
  ) || null;
}
