// /procurement/screened/+page.server.js
import { fail, redirect } from '@sveltejs/kit';

// number coercion: '' | null | undefined -> null, else Number(v)
const n = (v) => (v === '' || v == null ? null : Number(v));

export async function load({ fetch, url }) {
  // Suppliers for the dropdown
  const res = await fetch('/api/suppliers');
  const j = await res.json().catch(() => ({ ok: false, data: [] }));
  const suppliers = j.ok ? j.data : [];

  // Defaults from query (optional)
  const SHADES = ['WHITE', 'LIGHTGREY', 'GREY', 'BLACK', 'BROWN'];
  const qsSupplier = Number(url.searchParams.get('supplierId') || 0);
  const qsShade = (url.searchParams.get('shade') || '').trim().toUpperCase();

  return {
    suppliers,
    defaults: {
      supplierId: qsSupplier || (suppliers[0]?.id ?? ''),
      shade: qsShade || SHADES[0],
      // Default screened MMA; change per station if needed via query
      toMmaCode: url.searchParams.get('toMmaCode') || 'ABS_SCREENED'
    }
  };
}

export const actions = {
  async purchase({ request, fetch }) {
    const fd = await request.formData();

    // Required inputs
    const toMmaCode = String(fd.get('toMmaCode') || '').trim();
    const supplierId = n(fd.get('supplierId'));
    const shade = String(fd.get('shade') || '').trim().toUpperCase();

    if (!toMmaCode || supplierId == null || !Number.isFinite(supplierId) || supplierId <= 0 || !shade) {
      return fail(400, {
        error: 'Please select supplier & shade (and ensure the screened MMA is set).',
        values: Object.fromEntries(fd)
      });
    }

    // Breakdown (must sum > 0)
    const lumps = n(fd.get('lumps')) ?? 0;
    const chips = n(fd.get('chips')) ?? 0;
    const fines = n(fd.get('fines')) ?? 0;
    const total = (lumps || 0) + (chips || 0) + (fines || 0);

    if (!(total > 0)) {
      return fail(400, {
        error: 'Enter a positive breakdown: at least one of Lumps/Chips/Fines must be > 0.',
        values: Object.fromEntries(fd)
      });
    }

    // Build query (no qty; we’re using breakdown)
    const params = new URLSearchParams({
      toMmaCode,
      supplierId: String(supplierId),
      shade,
      reason: 'PURCHASE',
      date: (fd.get('date') || new Date().toISOString().slice(0, 10)).toString(),
      lumps: String(lumps || 0),
      chips: String(chips || 0),
      fines: String(fines || 0)
    });

    // Optional numeric costs
    const addNum = (key) => {
      const v = n(fd.get(key));
      if (v !== null && Number.isFinite(v)) params.set(key, String(v));
    };
    addNum('ratePerMt');
    addNum('freightPerMt');
    addNum('supplierFreight');
    addNum('roadExp');
    addNum('cashPaid');

    // Optional text fields
    const addStr = (key) => {
      const v = (fd.get(key) ?? '').toString().trim();
      if (v) params.set(key, v);
    };
    addStr('paymentMode');
    addStr('remarks');

    // Call API
    const res = await fetch(`/api/deposit?${params.toString()}`, { method: 'POST' });
    let j;
    try {
      j = await res.json();
    } catch (e) {
      console.error('Failed to parse /api/deposit response:', e);
      return fail(500, { error: 'Could not parse server response.', values: Object.fromEntries(fd) });
    }

    if (!j.ok) {
      console.error('Deposit API returned error:', {
        status: res.status,
        statusText: res.statusText,
        body: j
      });
      return fail(res.status || 500, {
        error: `API error (${res.status}): ${j.error || JSON.stringify(j)}`,
        values: Object.fromEntries(fd)
      });
    }

    const id = j?.data?.purchase?.id ?? '';
    throw redirect(303, `/procurement/screened?ok=1${id ? `&id=${id}` : ''}`);
  },

  async cancel() {
    throw redirect(303, '/');
  }
};
