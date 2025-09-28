import { fail, redirect } from '@sveltejs/kit';
import { processedStock } from '$lib/stocks/index.js';

const FROM_MMA = 'ABS_SCREENED';
const TO_MMA   = 'KEF_SCREENED';

export async function load({ url }) {
  const supplierId = Number(url.searchParams.get('supplierId') || '');
  const shade      = url.searchParams.get('shade') || '';
  const size       = url.searchParams.get('size') || '';
  const qty        = Number(url.searchParams.get('qty') || 0); // optional prefill

  if (!supplierId || !shade || !size) {
    return {
      error: 'Missing supplierId, shade, or size in URL. Open from the ABS Screened Slots page.',
      fromMmaCode: FROM_MMA,
      toMmaCode: TO_MMA
    };
  }

  return {
    fromMmaCode: FROM_MMA,
    toMmaCode: TO_MMA,
    supplierId,
    shade,
    size,
    qty
  };
}

export const actions = {
  default: async ({ request }) => {
    const data = Object.fromEntries(await request.formData());
    const fromMmaCode = String(data.fromMmaCode || '');
    const toMmaCode   = String(data.toMmaCode || '');
    const supplierId  = Number(data.supplierId || 0);
    const shade       = String(data.shade || '');
    const size        = String(data.size || '');
    const qty         = Number(data.qty || 0);

    if (fromMmaCode !== FROM_MMA || toMmaCode !== TO_MMA) {
      return fail(400, { error: 'Wrong MMA endpoint.', posted: data });
    }
    if (!supplierId || !shade || !size || !(qty > 0)) {
      return fail(400, { error: 'supplierId, shade, size, qty are required', posted: data });
    }

    await processedStock.dispatch({
      fromMmaCode: FROM_MMA,
      toMmaCode: TO_MMA,
      supplierId,
      shade,
      size,
      qty,
      fromStationCode: 'ABS',
      toStationCode: 'KEF'
    });

    throw redirect(303, '/stations/abs/abs_screened');
  }
};
