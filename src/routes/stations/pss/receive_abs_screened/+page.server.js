import { fail, redirect } from '@sveltejs/kit';
import { listInboundFor, executeReceive } from '$lib/appServices/receiveService.js';

const FROM_MMA = 'ABS_SCREENED';
const TO_MMA   = 'PSS_SCREENED';

// After a successful receive, go to PSS screened slots
const TARGET_AFTER_SUCCESS = '/stations/pss/pss_screened';

export async function load() {
  // Pull inbound rows directly from the domain via app-service
  const { rows } = await listInboundFor({
    fromMmaCode: FROM_MMA,
    toMmaCode: TO_MMA
  });

  return {
    stationCode: 'PSS',
    stationName: 'Peshawar (PSS)',
    lane: { from: FROM_MMA, to: TO_MMA },
    rows
  };
}

export const actions = {
  default: async ({ request }) => {
    const fd = await request.formData();

    // Tolerant extraction to handle any legacy field names
    const pick = (names, def = '') => {
      for (const n of names) {
        const v = fd.get(n);
        if (v != null && String(v).trim() !== '') return String(v).trim();
      }
      return def;
    };

    const transportId = pick(['transportId', 'tid']);
    const toMmaCode   = pick(['toMmaCode', 'to']);
    const supplierId  = pick(['supplierId', 'supplier']);
    const shade       = pick(['shade', 'color']);
    const size        = pick(['size', 'grade']);
    const qty         = pick(['qty', 'quantity']);
    const amount      = pick(['amount', 'price', 'amt'], '');

    try {
      await executeReceive({
        transportId,
        toMmaCode: toMmaCode || TO_MMA, // belt & suspenders
        supplierId,
        // qty/amount/shade optional — defaults to DISPATCH values if omitted
        qty: qty || undefined,
        amount: amount === '' ? undefined : amount,
        shade: shade || undefined,
        size: size || undefined
      });
    } catch (err) {
      return fail(400, {
        message: err?.message || 'Receive failed',
        transportId,
        supplierId,
        qty,
        amount,
        shade,
        size
      });
    }

    // Redirect OUTSIDE the try/catch so the navigation isn’t swallowed
    throw redirect(303, TARGET_AFTER_SUCCESS);
  }
};
