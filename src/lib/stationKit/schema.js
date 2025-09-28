// /src/lib/stationKit/schema.js
// Zod schemas for stationKit configuration

import { z } from 'zod';
import { FAMILIES, STATION_CODES } from './constants.js';

export const zFamily = z.enum(FAMILIES);
export const zStation = z.enum(STATION_CODES);

export const zMma = z.object({
  family: zFamily,
  mmaCode: z.string().min(1),
  label: z.string().min(1),
  verbs: z.array(z.enum(['purchase', 'dispatch', 'receive', 'process'])).default([])
});

// Fixed key set with optional presence per station
const zMmas = z.object({
  RAW: zMma.optional(),
  SCREENED: zMma.optional(),
  SORTED: zMma.optional()
});

export const zStationEntry = z.object({
  code: zStation,
  label: z.string().min(1),
  mmas: zMmas // not all stations have all families
});

export const zStationRegistry = z.record(zStation, zStationEntry);

export const zRoute = z.object({
  from: z.object({ station: zStation, family: zFamily }),
  to:   z.object({ station: zStation, family: zFamily }),
  kind: z.enum(['process', 'transport']),
  enabled: z.boolean().default(true),
  processName: z.string().optional()
});

export const zRouteMatrix = z.array(zRoute);
