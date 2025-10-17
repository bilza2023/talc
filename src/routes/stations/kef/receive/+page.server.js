
import { fail } from '@sveltejs/kit';
import { listInboundForMany, executeReceive } from '$lib/appServices/receiveService.js';

const FROM_MMA = 'PSS_SORTED';
const TO_MMA   = 'KEF_SORTED';

export const load = async () => {
  // Single lane for KEF Receive
  const lanes = [{ fromMmaCode: FROM_MMA, toMmaCode: TO_MMA }];

  // Pull inbound from stock_transport via domain
  const { rows } = await listInboundForMany({ lanes });

  // No station metadata needed by the component; keep props minimal
  return { lanes, rows };
};

export const actions = {
  default: async ({ request }) => {
    const form = await request.formData();

    const transportId = String(form.get('transportId') ?? '').trim();
    const toMmaCode   = String(form.get('toMmaCode') ?? '').trim();
    const supplierId  = Number(form.get('supplierId') ?? '');

    // Optional overrides (blank means inherit dispatch defaults in domain)
    const qty    = form.get('qty');    // can be '' (treated as undefined)
    const amount = form.get('amount'); // can be ''
    const shade  = form.get('shade');
    const size   = form.get('size');

    // Basic guards (defense-in-depth)
    if (!transportId) {
      return fail(400, { message: 'Missing transportId' });
    }
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

      // No redirect: a normal (non-enhanced) POST triggers a reload,
      // which re-runs load() and removes the received row.
      return { ok: true };
    } catch (err) {
      const message = err?.message || 'Receive failed';
      return fail(400, { message, transportId, toMmaCode });
    }
  }
};
