// PSS → KEF (SORTED) — simple dispatch page (unified stock API)
import { fail, redirect } from '@sveltejs/kit';
import { stock } from '$lib/stocks/stockEngine.js';

const FROM_MMA = 'PSS_SORTED';
const TO_MMA   = 'KEF_SORTED';
const AFTER    = '/stations/pss/pss_sorted';

function toNum(v, d = undefined) {
  const n = v == null ? NaN : Number(v);
  return Number.isFinite(n) ? n : d;
}
function errText(e) {
  if (!e) return 'Unknown error';
  if (typeof e === 'string') return e;
  if (e.message) return e.message;
  try { return JSON.stringify(e); } catch { return String(e); }
}

/** @type {import('./$types').PageServerLoad} */
export async function load({ url, fetch }) {
  const supplierId = toNum(url.searchParams.get('supplierId'));
  const shade      = (url.searchParams.get('shade') || '').trim();
  const size       = (url.searchParams.get('size')  || '').trim();
  const urlQty     = toNum(url.searchParams.get('qty'));

  // Optional on-hand hint
  let onHand = null;
  try {
    const res = await fetch(`/api/slots?mmaCode=${encodeURIComponent(FROM_MMA)}&positiveOnly=1`);
    const j = await res.json().catch(() => ({ ok: false, data: [] }));
    const rows = j.ok ? j.data : [];
    const match = rows.find(
      (r) =>
        Number(r.supplierId) === Number(supplierId) &&
        String(r.shade) === shade &&
        String(r.size) === size
    );
    onHand = match ? Number(match.qty) : 0;
  } catch { onHand = null; }

  const missing = [];
  if (!supplierId) missing.push('supplierId');
  if (!shade)      missing.push('shade');
  if (!size)       missing.push('size');

  return {
    cfg: { fromMmaCode: FROM_MMA, toMmaCode: TO_MMA },
    supplierId: supplierId || '',
    shade,
    size,
    urlQty: urlQty || '',
    onHand,
    error: missing.length ? `Missing ${missing.join(', ')} in URL. Open this from the PSS_SORTED slots page.` : null
  };
}

/** @type {import('./$types').Actions} */
// /src/routes/stations/pss/dispatch_kef_sorted/+page.server.js
export const actions = {
  dispatchOne: async ({ request }) => {
    const fd = await request.formData();

    const fromMmaCode = String(fd.get('fromMmaCode') || '');
    const toMmaCode   = String(fd.get('toMmaCode')   || '');
    const supplierId  = toNum(fd.get('supplierId'));
    const shade       = String(fd.get('shade') || '');
    const size        = String(fd.get('size')  || '');
    const qty         = toNum(fd.get('qty'));
    const amountRaw   = fd.get('amount');
    const amount      = amountRaw == null || String(amountRaw).trim() === '' ? null : Number(amountRaw);

    if (fromMmaCode !== FROM_MMA || toMmaCode !== TO_MMA) {
      return fail(400, { error: 'Wrong MMA endpoint.', posted: { supplierId, shade, size, qty } });
    }
    if (!supplierId || !shade || !size || !(qty > 0)) {
      return fail(400, { error: 'supplierId, shade, size, qty are required', posted: { supplierId, shade, size, qty } });
    }
    if (amount !== null && Number.isNaN(amount)) {
      return fail(400, { error: 'Amount must be a number', posted: { supplierId, shade, size, qty } });
    }

    // Do work inside try/catch…
    try {
      await stock.dispatch({
        fromMmaCode: FROM_MMA,
        toMmaCode:   TO_MMA,
        supplierId,
        shade,
        size,
        qty,
        amount
      });
    } catch (e) {
      // …and only handle real failures here
      return fail(400, {
        error: 'Dispatch failed',
        detail: e?.message ?? String(e),
        posted: { supplierId, shade, size, qty }
      });
    }

    // 🚀 Success → now throw the redirect OUTSIDE the try/catch
    throw redirect(303, AFTER);
  }
};
