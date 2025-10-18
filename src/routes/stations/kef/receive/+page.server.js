import { fail } from '@sveltejs/kit';
import { listInboundForMany, executeReceive, executeCancel } from '$lib/appServices/receiveService.js';

const FROM_MMA = 'PSS_SORTED';
const TO_MMA   = 'KEF_SORTED';

export const load = async () => {
  // Single lane for KEF Receive
  const lanes = [{ fromMmaCode: FROM_MMA, toMmaCode: TO_MMA }];
  const { rows } = await listInboundForMany({ lanes });
  return { lanes, rows };
};

// Mirror PSS pattern: two named actions (receive, cancel) — no default
export const actions = {
  receive: async ({ request }) => {
    const form = await request.formData();

    const transportId = String(form.get('transportId') ?? '').trim();
    const toMmaCode   = String(form.get('toMmaCode') ?? '').trim();
    const supplierId  = Number(form.get('supplierId') ?? '');

    // Optional overrides (blank → inherit dispatch values)
    const qty    = form.get('qty');
    const amount = form.get('amount');
    const shade  = form.get('shade');
    const size   = form.get('size');

    if (!transportId) return fail(400, { message: 'Missing transportId' });
    if (toMmaCode !== TO_MMA) {
      return fail(400, { message: `Invalid toMmaCode for KEF Receive: ${toMmaCode}` });
    }
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
      // No redirect; non-enhanced POST reloads and removes the row
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

    // Optional lane safety (helps catch wrong-page posts)
    if (toMmaCode && toMmaCode !== TO_MMA) {
      return fail(400, { message: `Invalid toMmaCode for KEF Cancel: ${toMmaCode}` });
    }

    try {
      await executeCancel({ transportId });
      return { ok: true };
    } catch (err) {
      console.error('[kef/cancel]', transportId, err?.message);
      return fail(400, { message: err?.message || 'Cancel failed', transportId });
    }
  }
};
