// ABS — Screening (RAW → SCREENED, fixed rows: LUMPS/CHIPS/FINE)
// Open via: /stations/abs/screening?supplierId=1&fromShade=WHITE&fromQtyT=199
// UI shows `Available = fromQtyT` (from URL) and computes Remaining = Available - Allocated.

import { fail, redirect } from '@sveltejs/kit';
import screening from '$lib/processes/screening.js';

const STATION = {
  code: 'ABS',
  fromMmaCode: 'ABS_RAW',
  toMmaCode: 'ABS_SCREENED'
};

// Target sizes for SCREENED
const SIZES = ['LUMPS', 'CHIPS', 'FINE'];

export async function load({ url }) {
  const supplierId = Number(url.searchParams.get('supplierId') || 0);
  const fromShade  = (url.searchParams.get('fromShade') || '').trim();
  const fromQtyT   = Number(url.searchParams.get('fromQtyT') || 0); // treat as Available passed from slots page

  return {
    stationCode: STATION.code,
    lane: `${STATION.fromMmaCode} → ${STATION.toMmaCode}`,
    sizes: SIZES,
    fromUrl: {
      supplierId: supplierId || '',
      fromShade,
      fromQtyT: (fromQtyT > 0 ? fromQtyT : 0) // Available shown by UI
    }
  };
}

/**
 * Form fields:
 *  - supplierId (hidden), fromShade (hidden), fromQtyT (hidden Available from URL)
 *  - qty_LUMPS, qty_CHIPS, qty_FINE (numbers; may be zero)
 *
 * Rules:
 *  - Allocated = sum(qty_*) must be > 0
 *  - Allocated ≤ fromQtyT (slot "Available" from URL)
 *  - Withdraw exactly Allocated and deposit per target lines
 */
export const actions = {
  async screen({ request }) {
    const fd = await request.formData();

    const supplierId = Number(fd.get('supplierId') || 0);
    const fromShade  = String(fd.get('fromShade') || '').trim();
    const fromQtyT   = Number(fd.get('fromQtyT') || 0); // Available from URL (hidden input)

    if (!supplierId || !fromShade) {
      return fail(400, {
        error: 'Supplier and shade are required.',
        detail: `supplierId=${supplierId}, fromShade='${fromShade}'`
      });
    }

    // Build fixed-size targets (shade inherited; cannot change in screening)
    const targets = [];
    for (const size of SIZES) {
      const qty = Number(fd.get(`qty_${size}`) || 0);
      if (qty > 0) targets.push({ shade: fromShade, size, qtyT: qty });
    }

    if (targets.length === 0) {
      return fail(400, { error: 'Enter at least one positive quantity into LUMPS/CHIPS/FINE.' });
    }

    // Allocated total (what we actually withdraw)
    const allocated = targets.reduce((s, t) => s + Number(t.qtyT || 0), 0);
    if (!(allocated > 0)) {
      return fail(400, { error: 'Allocated total must be > 0.' });
    }

    // Validate against the "Available from URL"
    if (fromQtyT > 0 && allocated > fromQtyT) {
      return fail(400, {
        error: `Allocated (${allocated}) exceeds available (${fromQtyT}).`,
        detail: 'Reduce allocated amounts to be within Available.'
      });
    }

    try {
      const res = await screening({
        fromMmaCode: STATION.fromMmaCode,
        toMmaCode:   STATION.toMmaCode,
        supplierId,
        // Withdraw exactly what was allocated
        from: { shade: fromShade, size: null, qtyT: allocated }, // RAW size = ANY internally
        targets,
        meta: { ui: 'abs/screening', fixedRows: true, allocated, availableFromUrl: fromQtyT }
      });

      if (res?.status === 'SUCCESS') {
        return { success: true, screenId: res.screenId, posted: res.posted };
      }

      return fail(500, {
        error: `Screening ${res?.status || 'FAILED'}`,
        detail: res?.error || 'See server logs.',
        screenId: res?.screenId
      });
    } catch (err) {
      return fail(500, { error: 'Screening failed', detail: String(err?.message ?? err) });
    }
  },

  async cancel() {
    throw redirect(303, '/stations/abs');
  }
};
