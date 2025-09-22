// src/lib/mma/registry.js

// If you already have MMA_LIST in $lib/enums.js, reuse it here.
// It may be either an array of strings (["ABS_SORTED", ...])
// or an array of objects ([{ code: "ABS_SORTED", ... }, ...]).
import { MMA_LIST } from './enums.js';

// Normalize to an array of string codes
export const MMA_REGISTRY = (Array.isArray(MMA_LIST) ? MMA_LIST : [])
  .map((e) => (typeof e === 'string' ? e : e?.code))
  .filter(Boolean);

// Optional: guard against duplicates in dev
if (process.env.NODE_ENV !== 'production') {
  const dupes = MMA_REGISTRY.filter((c, i, a) => a.indexOf(c) !== i);
  if (dupes.length) {
    // eslint-disable-next-line no-console
    console.warn('[MMA_REGISTRY] Duplicate codes:', [...new Set(dupes)]);
  }
}

Object.freeze(MMA_REGISTRY);
