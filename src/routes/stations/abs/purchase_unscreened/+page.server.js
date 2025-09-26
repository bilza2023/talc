// /src/routes/stations/abs/purchase_unscreened/+page.server.js
import { fail } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';
import { rawStock } from '$lib/stocks/index.js'; // tested Stock instance

/* Reuse a single Prisma instance in dev */
const prisma = globalThis.__prisma ?? new PrismaClient();
if (!globalThis.__prisma) globalThis.__prisma = prisma;

const stationCode = 'ABS';
const stationName = 'ABS';
const mmaCode = 'ABS_UNSCREENED_RAW'; // canonical MMA for unscreened purchases

/** @type {import('./$types').PageServerLoad} */
export async function load({ parent }) {
  // pull what the /stations/abs layout already fetched for us (suppliers, enum options, etc.)
  const p = await parent();

  return {
    stationCode,
    stationName,
    mmaCode,
    suppliers: p.suppliers ?? [],
    shadeOptions: p.shadeOptions ?? ['WHITE', 'GREY', 'LIGHTGREY', 'GREEN', 'MIXED'],
    sizeOptions: p.sizeOptions ?? ['LUMPS', 'CHIPS', 'FINE', 'ANY']
  };
}

export const actions = {
  /** Handles "purchase" into the UNSCREENED (RAW) MMA */
  async purchaseUnscreened({ request }) {
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

      // Core operation — deposit into RAW/UNSCREENED stock
      await rawStock.deposit({
        toMmaCode: mmaCode,           // REQUIRED key
        toStationCode: stationCode,   // optional but consistent
        supplierId,
        shade,
        size,
        qty,
        reason: 'DIRECT',
        meta: { source: 'stations/abs/purchase_unscreened', note }
      });

      return {
        success: true,
        posted: { supplierId, shade, size, qty }
      };
    } catch (err) {
      console.error('purchaseUnscreened error:', err);
      return fail(500, {
        error: `Failed to record purchase: ${err?.message ?? 'Unknown error'}`,
        posted: { supplierId, shade, size, qty }
      });
    }
  }
};
