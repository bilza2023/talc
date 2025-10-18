import { fail, redirect } from '@sveltejs/kit';
import { stock } from '$lib/stocks/stockEngine.js';

const num = (v) => (v === '' || v == null ? null : Number(v));

export async function load({ fetch }) {
  const res = await fetch('/api/suppliers');
  const j = await res.json().catch(() => ({ ok: false, data: [] }));
  const suppliers =
    Array.isArray(j) ? j : (j?.data ?? (j?.ok ? j.data : []));

  const SHADES = ['WHITE', 'GREY', 'LIGHTGREY', 'GREEN', 'MIXED'];
  const SIZES  = ['ANY', 'LUMPS', 'CHIPS', 'FINE'];

  return {
    suppliers,
    shades: SHADES,
    sizes: SIZES,
    defaults: {
      supplierId: suppliers[0]?.id ?? '',
      shade: SHADES[0],
      size: 'ANY'
    }
  };
}

export const actions = {
  async purchase({ request }) {
    const fd = await request.formData();

    const raw = Object.fromEntries(fd);
    // console.log('[purchase] raw formData →', raw);

    const supplierId = num(fd.get('supplierId')); // allow 0
    const shade      = String(fd.get('shade') || '').trim().toUpperCase();
    const size       = String(fd.get('size')  || 'ANY').toUpperCase();
    const qty        = num(fd.get('qty'));

    // precise validation (0 is valid; null means missing)
    const missing = [];
    if (supplierId === null || Number.isNaN(supplierId)) missing.push('supplierId');
    if (!shade) missing.push('shade');
    if (!(qty > 0)) missing.push('qty');

    if (missing.length) {
      return fail(400, { error: `Missing/invalid: ${missing.join(', ')}`, values: raw });
    }

    const toMmaCode = size === 'ANY' ? 'ABS_RAW' : 'ABS_SCREENED';

    const ratePerMt       = num(fd.get('ratePerMt'));
    const freightPerMt    = num(fd.get('freightPerMt'));
    const supplierFreight = num(fd.get('supplierFreight'));
    const roadExp         = num(fd.get('roadExp'));
    const cashPaid        = num(fd.get('cashPaid'));

    const paymentMode = (fd.get('paymentMode') ?? '').toString().trim() || null;
    const remarks     = (fd.get('remarks') ?? '').toString().trim() || null;
    const date        = (fd.get('date') || new Date().toISOString().slice(0, 10)).toString();

    const depositArgs = {
      toMmaCode,
      supplierId,
      shade,
      size,
      qty,
      reason: 'PURCHASE',
      purchase: {
        docDate: date,
        paymentMode,
        lumps: 0,
        chips: 0,
        fines: 0,
        ratePerMt,
        freightPerMt,
        supplierFreight,
        roadExp,
        cashPaid,
        remarks
      }
    };
    // console.log('[purchase] normalized deposit args →', depositArgs);

    try {
      await stock.deposit(depositArgs);
    } catch (err) {
      console.error('[purchase] deposit failed:', err);
      return fail(400, { error: err?.message || 'Deposit failed', values: raw });
    }

    // leave this OUTSIDE the try/catch
    throw redirect(303, '/procurement?ok=1');
  }
};
