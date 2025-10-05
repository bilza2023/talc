// ABS — Screening (RAW → SCREENED)
// Open via: /stations/abs/screening?supplierId=1&fromShade=WHITE&fromQtyT=199
import { fail, redirect } from '@sveltejs/kit';
import screening from '$lib/processes/screening.js';

const SIZES = ['LUMPS', 'CHIPS', 'FINE'];

export async function load({ url }) {
  const supplierId = Number(url.searchParams.get('supplierId') || 0);
  const fromShade  = (url.searchParams.get('fromShade') || '').trim();
  const fromQtyT   = Number(url.searchParams.get('fromQtyT') || 0);

  return {
    stationCode: 'ABS',
    lane: 'ABS_RAW → ABS_SCREENED',
    sizes: SIZES,
    fromUrl: {
      supplierId: supplierId || '',
      fromShade,
      fromQtyT: (fromQtyT > 0 ? fromQtyT : 0)
    }
  };
}

// Shared handler for the 'screen' action
async function handleScreen({ request }) {
  const fd = await request.formData();

  const supplierId = Number(fd.get('supplierId') || 0);
  const fromShade  = String(fd.get('fromShade') || '').trim();
  const fromQtyT   = Number(fd.get('fromQtyT') || 0); // UI "available" hint

  if (!supplierId || !fromShade) {
    return fail(400, {
      error: 'Supplier and shade are required.',
      detail: `supplierId=${supplierId}, fromShade='${fromShade}'`
    });
  }

  // Build targets from the three size inputs
  const targets = [];
  for (const size of SIZES) {
    const qty = Number(fd.get(`qty_${size}`) || 0);
    if (qty > 0) targets.push({ shade: fromShade, size, qtyT: qty });
  }
  if (targets.length === 0) {
    return fail(400, { error: 'Enter at least one positive quantity into LUMPS/CHIPS/FINE.' });
  }

  const allocated = targets.reduce((s, t) => s + Number(t.qtyT || 0), 0);
  if (!(allocated > 0)) {
    return fail(400, { error: 'Allocated total must be > 0.' });
  }
  if (fromQtyT > 0 && allocated > fromQtyT) {
    return fail(400, {
      error: `Allocated (${allocated}) exceeds available (${fromQtyT}).`,
      detail: 'Reduce allocated amounts to be within Available.'
    });
  }

  try {
    // Contract: from.qtyT MUST equal sum(targets)
    const res = await screening({
      supplierId,
      from: { shade: fromShade, qtyT: allocated },
      targets,
      meta: { ui: 'abs/screening', fixedRows: true, allocated, availableFromUrl: fromQtyT }
    });

    if (res?.status === 'SUCCESS') {
      return { success: true, screeningId: res.id, allocated };
    }
    if (res?.status === 'FAILED') {
      return fail(400, { error: res.error });
    }

    return fail(500, { error: 'Unknown screening result.' });
  } catch (err) {
    return fail(500, { error: 'Screening failed', detail: String(err?.message ?? err) });
  }
}

export const actions = {
  // Named actions ONLY (no default action allowed when using named)
  screen: handleScreen,

  async cancel() {
    throw redirect(303, '/stations/abs');
  }
};
