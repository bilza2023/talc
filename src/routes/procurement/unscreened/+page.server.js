// Purchase Unscreened (RAW) — server action posts to /api/deposit via query params
import { fail, redirect } from '@sveltejs/kit';

const n = v => (v === null || v === undefined || v === '' ? null : Number(v));

export async function load({ fetch, url }) {
  const res = await fetch('/api/suppliers');
  const j = await res.json().catch(() => ({ ok: false, data: [] }));
  const suppliers = j.ok ? j.data : [];

  const SHADES = ['WHITE', 'LIGHTGREY', 'GREY', 'BLACK', 'BROWN'];
  const qsSupplier = Number(url.searchParams.get('supplierId') || 0);
  const qsShade = (url.searchParams.get('shade') || '').trim().toUpperCase();

  return {
    suppliers,
    defaults: {
      supplierId: qsSupplier || (suppliers[0]?.id ?? ''),
      shade: qsShade || SHADES[0]
    }
  };
}

export const actions = {
  async purchase({ request, fetch }) {
    const fd = await request.formData();

    const sidRaw = fd.get('supplierId');
    if (!sidRaw) return fail(400, { error: 'Please choose a supplier.' });
    const supplierId = Number(sidRaw);
    if (!Number.isFinite(supplierId) || supplierId <= 0) {
      return fail(400, { error: 'Invalid supplier.' });
    }

    const toMmaCode = String(fd.get('toMmaCode') || 'ABS_RAW');
    const shade = String(fd.get('shade') || 'WHITE').toUpperCase();
    const size = String(fd.get('size') || 'ANY').toUpperCase();

    // Build query string for API — use names the API reads: ratePerMt, freightPerMt, remarks
    const params = new URLSearchParams({
      toMmaCode,
      supplierId: String(supplierId),
      shade,
      size,
      reason: 'PURCHASE',
      date: fd.get('date') || new Date().toISOString().slice(0, 10),
      paymentMode: fd.get('paymentMode') || '',
      lumps: fd.get('lumps') || '0',
      chips: fd.get('chips') || '0',
      fines: fd.get('fines') || '0',
      ratePerMt: fd.get('ratePerMt') || '',        // CHANGED
      freightPerMt: fd.get('freightPerMt') || '',  // CHANGED
      supplierFreight: fd.get('supplierFreight') || '',
      roadExp: fd.get('roadExp') || '',
      cashPaid: fd.get('cashPaid') || '',
      remarks: fd.get('remarks') || ''             // NEW
    });

    const res = await fetch(`/api/deposit?${params.toString()}`, { method: 'POST' });
    const j = await res.json().catch(() => ({ ok: false }));
    if (!j.ok) {
      return fail(res.status || 500, { error: j.error || 'Failed to record purchase.' });
    }

    throw redirect(303, `/procurement/unscreened?ok=1&id=${j.data?.purchase?.id || ''}`);
  },

  async cancel() { throw redirect(303, '/'); }
};
