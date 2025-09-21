import { z } from 'zod';

// ── MMA codes (add more as you go)
export const MMA = Object.freeze({
  ABS_RAW: 'ABS_RAW',
  ABS_PROCESSED: 'ABS_PROCESSED',
  
  
  PSS_PROCESSED: 'PSS_PROCESSED',
  PSS_SORTED: 'PSS_SORTED',

});
export const MMA_LIST = Object.values(MMA);

// ── Shade (grade) codes — make sure these match your Prisma schema exactly!
export const Shade = Object.freeze({
  WHITE: 'WHITE',
  GREY: 'GREY',
  LIGHTGREY: 'LIGHTGREY',
  GREEN: 'GREEN',
  MIXED: 'MIXED'
});
export const SHADE_LIST = Object.values(Shade);

// ── Size enum (already exists in Prisma): LUMPS / CHIPS / FINE
export const Size = Object.freeze({
  LUMPS: 'LUMPS',
  CHIPS: 'CHIPS',
  FINE: 'FINE',
});
export const SIZE_LIST = Object.values(Size);

// Zod guards (nativeEnum handles frozen objects correctly)
export const zMmaCode = z.nativeEnum(MMA);
export const zShade   = z.nativeEnum(Shade);
export const zSize    = z.nativeEnum(Size);
