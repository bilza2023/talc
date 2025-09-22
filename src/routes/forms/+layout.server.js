// /src/routes/tests/+layout.server.js
import { error } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';
import createSupplierService from '$lib/services/supplierService.js';

import { processed4s, sorted4s } from '$lib/mma/index.js';
// If your enums are under $lib/mma/enums.js, switch this import line:
import { MMA_LIST, SHADE_LIST, SIZE_LIST } from '$lib/mma/enums.js';

/* ───────── Prisma & Service (reuse in dev) ───────── */
const prisma = globalThis.__prisma ?? new PrismaClient();
if (!globalThis.__prisma) globalThis.__prisma = prisma;

const supplierService = createSupplierService(prisma);

/* ───────── helpers ───────── */

async function loadSuppliers() {
  // Real DB-backed list; no fallback
  const rows = await supplierService.list();
  return rows.map((r) => ({ id: r.id, name: r.name }));
}

async function listInTransitFromInstance(inst) {
  for (const fnName of ['listInTransit', 'inTransit', 'getInTransit']) {
    const fn = inst?.[fnName];
    if (typeof fn === 'function') {
      try {
        const rows = await fn.call(inst);
        if (Array.isArray(rows)) return rows;
      } catch { /* try next */ }
    }
  }
  return [];
}

async function loadInTransit() {
  const a = await listInTransitFromInstance(processed4s);
  const b = await listInTransitFromInstance(sorted4s);
  return [...a, ...b];
}

/* ───────── loader ───────── */

export async function load({ depends }) {
  depends('tests:shared');

  const mmaList = MMA_LIST;
  const shadeList = SHADE_LIST;
  const sizeList = SIZE_LIST;

  const [suppliers, inTransit] = await Promise.all([
    loadSuppliers(),
    loadInTransit()
  ]);

  if (!Array.isArray(mmaList) || mmaList.length === 0) {
    throw error(500, 'MMA enums not found or empty. Check $lib/enums.js (or $lib/mma/enums.js).');
  }

  return {
    mmaList,
    shadeList,
    sizeList,
    suppliers,
    inTransit,
    nowISO: new Date().toISOString()
  };
}
