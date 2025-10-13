import { fail, redirect } from '@sveltejs/kit';

const n = (v) => (v === '' || v == null ? null : Number(v));

export async function load({ fetch, url }) {
  const res = await fetch('/api/suppliers');
  const j = await res.json().catch(() => ({ ok: false, data: [] }));
  const suppliers = j.ok ? j.data : [];

  const SHADES = ['WHITE', 'LIGHTGREY', 'GREY', 'BLACK', 'BROWN'];
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
  async purchase({ request, fetch }) {
    const fd = await request.formData();
    const supplierId = n(fd.get('supplierId'));
    const shade = String(fd.get('shade') || '').trim().toUpperCase();
    const size  = String(fd.get('size') || 'ANY').toUpperCase();
    const qty   = n(fd.get('qty'));

    if (!supplierId || !shade || !(qty > 0)) {
      return fail(400, {
        error: 'Supplier, shade, and quantity are required.',
        values: Object.fromEntries(fd)
      });
    }

    // pick MMA based on size
    const toMmaCode = size === 'ANY' ? 'PSS_UNSCREENED' : 'PSS_SCREENED';

    // optional numeric fields
    const ratePerMt       = n(fd.get('ratePerMt'));
    const freightPerMt    = n(fd.get('freightPerMt'));
    const supplierFreight = n(fd.get('supplierFreight'));
    const roadExp         = n(fd.get('roadExp'));
    const cashPaid        = n(fd.get('cashPaid'));

    // optional text fields
    const paymentMode = (fd.get('paymentMode') ?? '').toString().trim() || null;
    const remarks     = (fd.get('remarks') ?? '').toString().trim() || null;
    const date        = (fd.get('date') || new Date().toISOString().slice(0, 10)).toString();

    // build query
    const params = new URLSearchParams({
      toMmaCode,
      supplierId,
      shade,
      size,
      qty,
      reason: 'PURCHASE',
      date
    });

    const addNum = (k, v) => { if (v != null && Number.isFinite(v)) params.set(k, v); };
    addNum('ratePerMt', ratePerMt);
    addNum('freightPerMt', freightPerMt);
    addNum('supplierFreight', supplierFreight);
    addNum('roadExp', roadExp);
    addNum('cashPaid', cashPaid);

    if (paymentMode) params.set('paymentMode', paymentMode);
    if (remarks) params.set('remarks', remarks);

    const res = await fetch(`/api/deposit?${params.toString()}`, { method: 'POST' });
    const j = await res.json().catch(() => null);

    if (!res.ok || !j?.ok) {
      return fail(400, {
        error: j?.error || 'API error',
        values: Object.fromEntries(fd)
      });
    }

    throw redirect(303, `/procurement?ok=1`);
  }
};
