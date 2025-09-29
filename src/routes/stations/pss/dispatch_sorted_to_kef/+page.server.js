
// Generic Dispatch Page (v1) — drop-in template
// Copy this file into a lane's route folder and edit CONFIG only.

import { fail, redirect } from '@sveltejs/kit';
import { rawStock, processedStock, sortedStock } from '$lib/stocks/index.js';

// ── EDIT THESE FIELDS ONLY ───────────────────────────────────────────────
const CONFIG = {
  // Which Stock engine to use for this lane
  stock: processedStock, // rawStock | processedStock | sortedStock

  // Lane (station → station)
  fromStationCode: 'ABS',
  toStationCode:   'PSS',

  // Exact MMA codes for this lane
  fromMmaCode: 'ABS_SCREENED',
  toMmaCode:   'PSS_SCREENED',

  // Where to go after a successful dispatch (typically the source MMA page)
  afterRedirect: '/stations/abs/abs_screened'
};
// ─────────────────────────────────────────────────────────────────────────

export async function load({ url }) {
  // Standardized URL prefill contract: supplierId, shade, size, qty (qty optional)
  const supplierId = Number(url.searchParams.get('supplierId') || '');
  const shade      = url.searchParams.get('shade') || '';
  const size       = url.searchParams.get('size') || '';
  const qty        = Number(url.searchParams.get('qty') || 0); // optional prefill

  const missing = [];
  if (!supplierId) missing.push('supplierId');
  if (!shade)      missing.push('shade');
  if (!size)       missing.push('size');

  return {
    cfg: {
      fromStationCode: CONFIG.fromStationCode,
      toStationCode:   CONFIG.toStationCode,
      fromMmaCode:     CONFIG.fromMmaCode,
      toMmaCode:       CONFIG.toMmaCode
    },
    supplierId,
    shade,
    size,
    qty,
    error: missing.length
      ? `Missing ${missing.join(', ')} in URL. Open from the source Slots page.`
      : null
  };
}

export const actions = {
  default: async ({ request }) => {
    const form = Object.fromEntries(await request.formData());

    // Hidden fields (guard against wrong endpoint)
    const fromMmaCode = String(form.fromMmaCode || '');
    const toMmaCode   = String(form.toMmaCode || '');

    // User-entered/URL-prefilled fields
    const supplierId  = Number(form.supplierId || 0);
    const shade       = String(form.shade || '');
    const size        = String(form.size || '');
    const qty         = Number(form.qty || 0);

    // Endpoint guard
    if (fromMmaCode !== CONFIG.fromMmaCode || toMmaCode !== CONFIG.toMmaCode) {
      return fail(400, { error: 'Wrong MMA endpoint.', posted: form });
    }

    // Basic validation
    if (!supplierId || !shade || !size || !(qty > 0)) {
      return fail(400, { error: 'supplierId, shade, size, qty are required', posted: form });
    }

    // Single API call — stationkit lane via Stock engine
    await CONFIG.stock.dispatch({
      fromMmaCode: CONFIG.fromMmaCode,
      toMmaCode:   CONFIG.toMmaCode,
      fromStationCode: CONFIG.fromStationCode,
      toStationCode:   CONFIG.toStationCode,
      supplierId,
      shade,
      size,
      qty
    });

    throw redirect(303, CONFIG.afterRedirect);
  }
};
