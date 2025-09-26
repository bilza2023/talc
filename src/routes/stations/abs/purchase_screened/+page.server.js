
// /src/routes/stations/abs/purchase_screened/+page.server.js
import { fail } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';
import { processedStock } from '$lib/stocks/index.js'; // tested Stock instance for SCREENED

/* Reuse a single Prisma instance in dev */
const prisma = globalThis.__prisma ?? new PrismaClient();
if (!globalThis.__prisma) globalThis.__prisma = prisma;

const stationCode = 'ABS';
const stationName = 'ABS';
// NOTE: If your registry uses 'ABS_SCREENED' instead, change it here.
const mmaCode = 'ABS_PROCESSED';

/** @type {import('./$types').PageServerLoad} */
export async function load({ parent }) {
  const p = await parent();

  // For screened, we usually don't allow 'ANY' size; filter it out defensively.
  const baseSizes = p.sizeOptions ?? ['LUMPS', 'CHIPS', 'FINE'];
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
  /** Handles "purchase" into the SCREENED (PROCESSED) MMA */
  async purchaseScreened({ request }) {
    const form = await request.formData();

    const supplierId = Number(form.get('supplierId'));
    const shade = String(form.get('shade') || '');
    const size = String(form.get('size') || '');
    const qty = Number(form.get('qty'));
    const note = String(form.get('note') || '');

    // Basic guards
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
      // Verify supplier exists
      const supplier = await prisma.supplier.findUnique({ where: { id: supplierId }, select: { id: true } });
      if (!supplier) {
        return fail(400, { error: 'Unknown supplier', posted: { supplierId, shade, size, qty } });
      }

      // Core operation — deposit into SCREENED stock
      await processedStock.deposit({
        toMmaCode: mmaCode,           // REQUIRED key
        toStationCode: stationCode,   // optional but consistent
        supplierId,
        shade,
        size,
        qty,
        reason: 'DIRECT',
        meta: { source: 'stations/abs/purchase_screened', note }
      });

      return {
        success: true,
        posted: { supplierId, shade, size, qty }
      };
    } catch (err) {
      console.error('purchaseScreened error:', err);
      return fail(500, {
        error: `Failed to record purchase: ${err?.message ?? 'Unknown error'}`,
        posted: { supplierId, shade, size, qty }
      });
    }
  }
};
