
import { fail, redirect } from '@sveltejs/kit';
import { rawStock } from '$lib/stocks/index.js';

const FROM_MMA = 'ABS_UNSCREENED_RAW';
// "screened" label for KEF maps to actual MMA:
const TO_MMA = 'KEF_SORTED';

export async function load({ url }) {
  const supplierId = Number(url.searchParams.get('supplierId') || '');
  const shade = url.searchParams.get('shade') || '';
  const size = url.searchParams.get('size') || '';

  if (!supplierId || !shade || !size) {
    return {
      error: 'Missing supplierId, shade, or size in URL. Open from the slots page.',
      fromMmaCode: FROM_MMA,
      toMmaCode: TO_MMA
    };
  }

  // Find available qty for this exact slot key
  const slots = await rawStock.slots({ mmaCode: FROM_MMA, positiveOnly: true });
  const match = slots.find(
    s => s.supplierId === supplierId && s.shade === shade && s.size === size
  );
  const availableQty = match?.qty ?? 0;

  return {
    fromMmaCode: FROM_MMA,
    toMmaCode: TO_MMA,
    supplierId,
    shade,
    size,
    availableQty
  };
}

export const actions = {
  default: async ({ request }) => {
    const data = Object.fromEntries(await request.formData());
    const fromMmaCode = String(data.fromMmaCode || '');
    const toMmaCode = String(data.toMmaCode || '');
    const supplierId = Number(data.supplierId || 0);
    const shade = String(data.shade || '');
    const size = String(data.size || '');
    const qty = Number(data.qty || 0);

    // Hard guards for this endpoint
    if (fromMmaCode !== FROM_MMA || toMmaCode !== TO_MMA) {
      return fail(400, { error: 'Wrong MMA endpoint.', posted: data });
    }
    if (!supplierId || !shade || !size || !(qty > 0)) {
      return fail(400, { error: 'supplierId, shade, size, qty are required', posted: data });
    }

    // Optional pre-check against current availability
    const slots = await rawStock.slots({ mmaCode: FROM_MMA, positiveOnly: true });
    const match = slots.find(
      s => s.supplierId === supplierId && s.shade === shade && s.size === size
    );
    const available = match?.qty ?? 0;
    if (qty > available) {
      return fail(400, { error: `Insufficient on-hand: ${available}t available`, posted: data });
    }

    await rawStock.dispatch({
      fromMmaCode: FROM_MMA,
      toMmaCode: TO_MMA,
      supplierId,
      shade,
      size,
      qty,
      fromStationCode: 'ABS',
      toStationCode: 'KEF'
    });

    // Back to ABS unscreened slots
    throw redirect(303, '/stations/abs/abs_unscreened_raw');
  }
};
