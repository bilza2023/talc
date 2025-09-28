
// Shield the rest of the app from engine naming.
// SCREENED maps to the "processed" stock instance in the engine.

import { rawStock, screenedStock, sortedStock } from '../stocks/index.js';
import { FAMILY } from './constants.js';

export function familyToStock(family) {
  switch (family) {
    case FAMILY.RAW:      return rawStock;
    case FAMILY.SCREENED: return screenedStock; // engine "processed"
    case FAMILY.SORTED:   return sortedStock;
    default: throw new Error(`Unknown family: ${family}`);
  }
}
