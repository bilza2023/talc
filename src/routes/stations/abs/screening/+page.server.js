// ABS — Screening (RAW → SCREENED)
// Page: /stations/abs/screening?supplierId=1&fromShade=WHITE
import { fail, redirect } from '@sveltejs/kit';
import screening from '$lib/processes/screening.js';
import Stock from '$lib/stock/Stock.js';

const SIZES = ['LUMPS', 'CHIPS', 'FINE'];
const stock = new Stock();

/** authoritative available for the EXACT RAW slot (size MUST be 'ANY') */
async function fetchAvailableSlot({ supplierId, shade }) {
  if (!supplierId || !shade) return 0;
  const s = await stock.slot({
    mmaCode: 'ABS_RAW',
    supplierId: Number(supplierId),
    shade: String(shade),
    size: 'ANY'
  });
  return Number(s.qty || 0);
}

export async function load({ url }) {
  const supplierId = Number(url.searchParams.get('supplierId') || 0);
  const fromShade  = (url.searchParams.get('fromShade') || '').trim();

  const availableDb = await fetchAvailableSlot({ supplierId, shade: fromShade });

  return {
    stationCode: 'ABS',
    lane: 'ABS_RAW → ABS_SCREENED',
    sizes: SIZES,
    from: {
      supplierId: supplierId || '',
      shade: fromShade,
      availableDb // single source of truth for Available
    }
  };
}

async function handleScreen({ request }) {
  const fd = await request.formData();
  const supplierId = Number(fd.get('supplierId') || 0);
  const fromShade  = String(fd.get('fromShade') || '').trim();

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

  // Authoritative availability (exact RAW/ANY slot only)
  const availableDb = await fetchAvailableSlot({ supplierId, shade: fromShade });
  if (allocated > availableDb) {
    return fail(400, {
      error: `Allocated (${allocated}) exceeds available (${availableDb}).`
    });
  }

  try {
    // Contract: from.qtyT MUST equal sum(targets)
    const res = await screening({
      supplierId,
      from: { shade: fromShade, qtyT: allocated },
      targets,
      meta: { ui: 'abs/screening', fixedRows: true, allocated, availableDb }
    });

    if (res?.status === 'SUCCESS') {
      return { success: true, screeningId: res.id, allocated, availableDb };
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
  screen: handleScreen,
  async cancel() {
    throw redirect(303, '/stations/abs');
  }
};
