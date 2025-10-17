import { fail } from '@sveltejs/kit';
import { listInboundForMany, executeReceive } from '$lib/appServices/receiveService.js';

const FROM_MMA = 'ABS_SCREENED';
const TO_MMA   = 'PSS_SCREENED';

export const load = async () => {
  // Single lane for PSS Receive
  const lanes = [{ fromMmaCode: FROM_MMA, toMmaCode: TO_MMA }];

  // Pull inbound from stock_transport via domain
  const { rows } = await listInboundForMany({ lanes });

  // Component needs only lanes + rows
  return { lanes, rows };
};

export const actions = {
  default: async ({ request }) => {
    const form = await request.formData();

    const transportId = String(form.get('transportId') ?? '').trim();
    const toMmaCode   = String(form.get('toMmaCode') ?? '').trim();
    const supplierId  = Number(form.get('supplierId') ?? '');

    // Optional overrides (blank means "inherit dispatch defaults" in domain)
    const qty    = form.get('qty');    // may be ''
    const amount = form.get('amount'); // may be ''
    const shade  = form.get('shade');  // may be ''
    const size   = form.get('size');   // not present in UI; safe to ignore if ''

    // Guards (defense-in-depth)
    if (!transportId) {
      return fail(400, { message: 'Missing transportId' });
    }
    if (toMmaCode !== TO_MMA) {
      return fail(400, { message: `Invalid toMmaCode for PSS Receive: ${toMmaCode}` });
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

      // No redirect: a normal POST reloads the page and removes the received row.
      return { ok: true };
    } catch (err) {
      const message = err?.message || 'Receive failed';
      return fail(400, { message, transportId, toMmaCode });
    }
  }
};
