// /src/routes/stations/abs/+layout.server.js
import { PrismaClient } from '@prisma/client';

/* Reuse a single Prisma instance in dev */
const prisma = globalThis.__prisma ?? new PrismaClient();
if (!globalThis.__prisma) globalThis.__prisma = prisma;

/** @type {import('./$types').LayoutServerLoad} */
export async function load() {
  const stationCode = 'ABS';

  // 1) Get suppliers as a plain array (safe for .map in Svelte)
  const suppliers = await prisma.supplier.findMany({
    where: { /* add station-specific filter if/when you model it */ },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, code: true }
  });

  // 2) Hard options for now (match your enums)
  const shadeOptions = ['WHITE', 'GREY', 'LIGHTGREY', 'GREEN', 'MIXED'];
  const sizeOptions  = ['LUMPS', 'CHIPS', 'FINE', 'ANY'];

  // 3) Whatever MMAs you want visible on ABS page (adjust later)
  const mmas = [
    { mmaCode: 'ABS_UNSCREENED_RAW', label: 'Unscreened (RAW)' },
    { mmaCode: 'ABS_SCREENED',       label: 'Screened (PROCESSED)' }
  ];

  return {
    stationCode,
    suppliers,      // ← array, safe to {#each}
    shadeOptions,
    sizeOptions,
    mmas
  };
}
