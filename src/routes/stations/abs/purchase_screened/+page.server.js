// ABS — Purchase (SCREENED)
// Uses processedStock and ABS_SCREENED (new naming).
import { fail } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';
import { processedStock } from '$lib/stocks/index.js';

/* Reuse a single Prisma instance in dev */
const prisma = globalThis.__prisma ?? new PrismaClient();
if (!globalThis.__prisma) globalThis.__prisma = prisma;

const stationCode = 'ABS';
const stationName = 'ABS';
const mmaCode = 'ABS_SCREENED'; // aligned to SCREENED naming

/** @type {import('./$types').PageServerLoad} */
export async function load({ parent }) {
  const p = await parent();

  // For screened, keep size options but drop "ANY" defensively (UI stays same).
  const baseSizes = p.sizeOptions ?? ['LUMPS', 'CHIPS', 'FINE', 'ANY'];
  const sizeOptions = baseSizes.filter((v) => v !== 'ANY');

  return {
    stationCode,
    stationName,
    mmaCode,
    suppliers: p.suppliers ?? [],
    shadeOptions: p.shadeOptions ?? ['WHITE', 'GREY', 'LIGHTGREY', 'GREEN', 'MIXED'],
    sizeOptions
  };
}

export const actions = {
  /** Handles purchase into ABS_SCREENED (processed family) */
  async purchaseScreened({ request }) {
    const form = await request.formData();

    const supplierId = Number(form.get('supplierId'));
    const shade = String(form.get('shade') || '');
    const size = String(form.get('size') || '');
    const qty = Number(form.get('qty'));
    const note = String(form.get('note') || '');

    // Basic guards (same UX as before)
    if (!supplierId || !Number.isFinite(supplierId)) {
      return fail(400, { error: 'Supplier is required', posted: { supplierId, shade, size, qty } });
    }
    if (!shade) {
      return fail(400, { error: 'Shade is required', posted: { supplierId, shade, size, qty } });
    }
    if (!size) {
      return fail(400, { error: 'Size is required', posted: { supplierId, shade, size, qty } });
    }
    if (!qty || !Number.isFinite(qty) || qty <= 0) {
      return fail(400, { error: 'Quantity must be a positive number', posted: { supplierId, shade, size, qty } });
    }

    try {
      // Verify supplier existence (same behavior as before)
      const supplier = await prisma.supplier.findUnique({ where: { id: supplierId }, select: { id: true } });
      if (!supplier) {
        return fail(400, { error: 'Unknown supplier', posted: { supplierId, shade, size, qty } });
      }

      // Core deposit to SCREENED family
      await processedStock.deposit({
        toMmaCode: mmaCode,
        toStationCode: stationCode,
        supplierId,
        shade,
        size,
        qty,
        reason: 'DIRECT',
        meta: { source: 'stations/abs/purchase_screened', note }
      });

      return { success: true, posted: { supplierId, shade, size, qty } };
    } catch (err) {
      console.error('purchaseScreened error:', err);
      return fail(500, {
        error: `Failed to record purchase: ${err?.message ?? 'Unknown error'}`,
        posted: { supplierId, shade, size, qty }
      });
    }
  }
};
