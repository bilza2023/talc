
// src/routes/mma4s/dispatch/+page.server.js
import { error, fail } from '@sveltejs/kit';
import { mma4s } from '$lib/mma/mma4s.instance.js';

export async function load({ url }) {
  const fromMma = url.searchParams.get('fromMma')?.trim();
  const toMma = url.searchParams.get('toMma')?.trim() || '';
  const supplierIdParam = url.searchParams.get('supplierId');
  const shade = url.searchParams.get('shade')?.trim();
  const size = url.searchParams.get('size')?.trim();

  if (!fromMma || !supplierIdParam || !shade || !size) {
    throw error(400, 'Required query params: fromMma, supplierId, shade, size');
  }

  const supplierId = Number(supplierIdParam);
  if (!Number.isFinite(supplierId)) {
    throw error(400, 'supplierId must be a number');
  }

  // Compute current on-hand for the exact (supplier × shade × size) slot at fromMma
  const slots = await mma4s.activeSlots({ mmaCode: fromMma });
  const slot = slots.find(
    (r) =>
      Number(r.supplierId) === supplierId &&
      r.shade === shade &&
      r.size === size
  );

  const onHand = Number(slot?.qty ?? 0);

  return {
    fromMma,
    toMma,
    supplierId,
    shade,
    size,
    onHand
  };
}

export const actions = {
  dispatch: async ({ request }) => {
    const form = await request.formData();
    const fromMma = form.get('fromMma')?.toString().trim();
    const toMma = form.get('toMma')?.toString().trim();
    const supplierId = Number(form.get('supplierId'));
    const shade = form.get('shade')?.toString().trim();
    const size = form.get('size')?.toString().trim();
    const qty = Number(form.get('qty'));
    const truckNo = form.get('truckNo')?.toString().trim() || '';
    const note = form.get('note')?.toString().trim() || '';

    // Basic validation
    if (!fromMma || !toMma || !shade || !size || !Number.isFinite(supplierId)) {
      return fail(400, { message: 'Missing required fields.' });
    }
    if (!Number.isFinite(qty) || qty <= 0) {
      return fail(400, { message: 'Weight (qty) must be a positive number.' });
    }

    // Engine call — v1 expects dispatch to accept these fields.
    // If your engine uses different names, adjust here.
    try {
      const meta = {};
      if (truckNo) meta.truckNo = truckNo;
      if (note) meta.note = note;

      const result = await mma4s.dispatch({
        fromMma,
        toMma,
        supplierId,
        shade,
        size,
        amount: qty,   // if your engine prefers "qty", swap to qty
        meta
      });

      // Return plain serializable object
      return {
        success: true,
        message: `Dispatched ${qty}t from ${fromMma} → ${toMma}`,
        dispatchId: result?.id ?? null
      };
    } catch (e) {
      // Surface a clean error for the form
      return fail(400, { message: e?.message || 'Dispatch failed.' });
    }
  }
};
