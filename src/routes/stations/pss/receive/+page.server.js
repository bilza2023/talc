import { fail } from '@sveltejs/kit';
import { listInboundForMany, executeReceive, executeCancel } from '$lib/appServices/receiveService.js';

const FROM_MMA = 'ABS_SCREENED';
const TO_MMA   = 'PSS_SCREENED';

export const load = async () => {
  const lanes = [{ fromMmaCode: FROM_MMA, toMmaCode: TO_MMA }];
  const { rows } = await listInboundForMany({ lanes });
  return { lanes, rows };
};

// 🔴 SvelteKit rule: if you use named actions, do NOT use `default`.
// We expose two named actions: `receive` and `cancel`.
export const actions = {
  receive: async ({ request }) => {
    const form = await request.formData();

    const transportId = String(form.get('transportId') ?? '').trim();
    const toMmaCode   = String(form.get('toMmaCode') ?? '').trim();
    const supplierId  = Number(form.get('supplierId') ?? '');

    const qty    = form.get('qty');
    const amount = form.get('amount');
    const shade  = form.get('shade');
    const size   = form.get('size');

    if (!transportId)                    return fail(400, { message: 'Missing transportId' });
    if (toMmaCode !== TO_MMA)            return fail(400, { message: `Invalid toMmaCode for PSS Receive: ${toMmaCode}` });
    if (!Number.isFinite(supplierId) || supplierId <= 0) {
      return fail(400, { message: 'Invalid supplierId' });
    }

    try {
      await executeReceive({
        transportId,
        toMmaCode,
        supplierId,
        qty:    qty === ''    ? undefined : Number(qty),
        amount: amount === '' ? undefined : Number(amount),
        shade:  shade === ''  ? undefined : String(shade),
        size:   size === ''   ? undefined : String(size)
      });
      return { ok: true };
    } catch (err) {
      return fail(400, { message: err?.message || 'Receive failed', transportId, toMmaCode });
    }
  },

  cancel: async ({ request }) => {
    const form = await request.formData();
  
    const transportId = String(form.get('transportId') ?? '').trim();
    const toMmaCode   = String(form.get('toMmaCode') ?? '').trim(); // optional safety check
  
    if (!transportId) return fail(400, { message: 'Missing transportId' });
  
    // optional: keep your lane safety (harmless, helps catch wrong-page posts)
    const TO_MMA = 'PSS_SCREENED';
    if (toMmaCode && toMmaCode !== TO_MMA) {
      return fail(400, { message: `Invalid toMmaCode for PSS Cancel: ${toMmaCode}` });
    }
  
    try {
      await executeCancel({ transportId });
      return { ok: true };
    } catch (err) {
      console.error('[cancel]', transportId, err?.message);
      return fail(400, { message: err?.message || 'Cancel failed', transportId });
    }
  }
  
  
};
