// PSS → Sort page
import { fail, redirect } from '@sveltejs/kit';
import sorting from '$lib/processes/sorting.js';

export const load = async ({ url }) => {
  const supplierId = Number(url.searchParams.get('supplierId') ?? '');
  const shade      = String(url.searchParams.get('shade') ?? '');
  const size       = String(url.searchParams.get('size') ?? '');
  const qty        = Number(url.searchParams.get('qty') ?? '');

  return {
    defaults: {
      supplierId: Number.isFinite(supplierId) ? supplierId : null,
      shade: shade || '',
      size: size || '',
      qty: Number.isFinite(qty) && qty > 0 ? qty : null,
      ht: null,
      wastage: null
    }
  };
};

export const actions = {
  default: async ({ request }) => {
    const form = await request.formData();

    const supplierId = Number(form.get('supplierId'));
    const fromShade  = String(form.get('shade') ?? '').trim();
    const fromSize   = String(form.get('size') ?? '').trim();
    const qtyRaw     = form.get('qty');
    const htRaw      = form.get('ht');
    const wastageRaw = form.get('wastage');

    const qtyT    = qtyRaw == null || qtyRaw === '' ? NaN : Number(qtyRaw);
    const ht      = htRaw == null || htRaw === '' ? null : Number(htRaw);
    const wastage = wastageRaw == null || wastageRaw === '' ? null : Number(wastageRaw);

    // Early validation (mirrors tests)
    if (!supplierId) throw new Error('supplierId is required');
    if (!fromShade)  throw new Error('shade is required');
    if (!fromSize)   throw new Error('size is required');
    if (!(qtyT > 0)) throw new Error('qtyT must be > 0');

    try {
      const res = await sorting({
        supplierId,
        from: { shade: fromShade, size: fromSize, qtyT },
        ht,
        wastage,
        meta: { page: 'pss/sort' }
      });

      if (res.status !== 'SUCCESS') {
        return fail(400, {
          error: 'Sort failed',
          detail: res.error || 'Unknown error',
          posted: { supplierId, fromShade, fromSize, qtyT, ht, wastage }
        });
      }

      // ✅ redirect on success to PSS sorted page
      throw redirect(303, '/stations/pss/pss_sorted');
    } catch (e) {
      return fail(400, {
        error: 'Sort failed',
        detail: String(e?.message || e),
        posted: { supplierId, fromShade, fromSize, qtyT, ht, wastage }
      });
    }
  }
};
