// src/routes/mma4s/slots/+page.server.js
import { error } from '@sveltejs/kit';
import { mma4s } from '$lib/mma/mma4s.instance.js'; // use the global singleton

export async function load({ url }) {
  const mmaCode = url.searchParams.get('mma')?.trim();
  const supplierIdParam = url.searchParams.get('supplierId');

  if (!mmaCode || !supplierIdParam) {
    throw error(400, 'Required query params: mma and supplierId');
  }

  const supplierId = Number(supplierIdParam);
  if (!Number.isFinite(supplierId)) {
    throw error(400, 'supplierId must be a number');
  }

  // Active slots for this MMA (already positive-only)
  const allSlots = await mma4s.activeSlots({ mmaCode });

  const slots = allSlots
    .filter((r) => Number(r.supplierId) === supplierId && Number(r.qty) > 0)
    .map((r) => ({ shade: r.shade, size: r.size, qty: Number(r.qty) }))
    .sort((a, b) => b.qty - a.qty);

  return { mmaCode, supplierId, slots };
}
