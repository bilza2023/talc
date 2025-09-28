
// Lightweight guards that validate actions against the policy in registry/routes.

import { getMma } from './registry.js';
import { findEdge } from './routes.js';

export function assertVerbAllowed({ station, family, verb }) {
  const mma = getMma(station, family);
  if (!mma.verbs?.includes(verb)) {
    throw new Error(`Verb "${verb}" not allowed at ${station}/${family}`);
  }
}

export function assertEdgeAllowed({ fromStation, fromFamily, toStation, toFamily }) {
  const edge = findEdge({ fromStation, fromFamily, toStation, toFamily });
  if (!edge || !edge.enabled) {
    throw new Error(`Edge not allowed: ${fromStation}/${fromFamily} → ${toStation}/${toFamily}`);
  }
  return edge;
}

// Optional semantic check when performing a process-style move
export function assertProcessFamilyChange({ fromFamily, toFamily, expected }) {
  if (expected && expected !== `${fromFamily}->${toFamily}`) {
    throw new Error(`Unexpected process transition: got ${fromFamily}->${toFamily}, want ${expected}`);
  }
}
