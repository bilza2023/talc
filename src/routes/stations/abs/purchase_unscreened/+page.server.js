// ABS — Purchase Unscreened (RAW → deposit ANY)
import { fail, redirect } from '@sveltejs/kit';
import Stock from '$lib/stock/Stock.js';

const stock = new Stock();
// If you have a canonical enum list on the server, swap this with that.
const SHADES = ['WHITE', 'LIGHTGREY', 'GREY', 'BLACK', 'BROWN'];

export async function load({ fetch, url }) {
  // Suppliers for the dropdown
  const res = await fetch('/api/suppliers');
  const j = await res.json().catch(() => ({ ok: false, data: [] }));
  const suppliers = j.ok ? j.data : [];

  // Optional preselects from URL
  const qsSupplier = Number(url.searchParams.get('supplierId') || 0);
  const qsShade    = (url.searchParams.get('shade') || '').trim().toUpperCase();

  const defaultSupplierId = qsSupplier || (suppliers[0]?.id ?? '');
  const defaultShade      = qsShade || SHADES[0];

  return {
    mmaCode: 'ABS_RAW',
    suppliers,
    shades: SHADES,
    defaults: {
      supplierId: defaultSupplierId,
      shade: defaultShade
    }
  };
}

export const actions = {
  async purchase({ request }) {
    const fd = await request.formData();
    const supplierId = Number(fd.get('supplierId') || 0);
    const shade = String(fd.get('shade') || '').trim().toUpperCase();
    const qty = Number(fd.get('qty') || 0);

    if (!supplierId || !shade) {
      return fail(400, { error: 'Supplier and shade are required.' });
    }
    if (!(qty > 0)) {
      return fail(400, { error: 'Quantity must be > 0.' });
    }

    // Force ANY for RAW (server-side guard)
    await stock.deposit({
      toMmaCode: 'ABS_RAW',
      supplierId,
      shade,
      qty,
      size: 'ANY' // reason omitted → Stock.deposit defaults to 'DIRECT'
    });

    return { success: true, posted: { supplierId, shade, qty } };
  },

  async cancel() {
    throw redirect(303, '/stations/abs');
  }
};
