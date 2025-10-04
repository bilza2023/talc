// KEF — Receive inbound from PSS into KEF_SORTED (via /api/inbound)
import { fail } from '@sveltejs/kit';
import { stock } from '$lib/stocks/stockEngine.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ fetch }) {
  const mmaCode = 'KEF_SORTED';

  // Ask API for all inbound headed to KEF_SORTED
  const res = await fetch(`/api/inbound?mmaCode=${encodeURIComponent(mmaCode)}`);
  const j = await res.json().catch(() => ({ ok: false, data: [] }));

  const inboundAll = j.ok ? j.data : [];

  // Only show the lane PSS_SORTED → KEF_SORTED
  const rows = inboundAll
    .filter(t => t.fromMmaCode === 'PSS_SORTED' && t.toMmaCode === 'KEF_SORTED')
    .map(t => ({
      id: t.id,
      transportId: t.transportId,
      createdAt: t.createdAt,
      supplierId: t.supplierId,
      shade: t.shade,
      size: t.size,
      dispatchedQty: Number(t.qty)
    }));

  return {
    stationCode: 'KEF',
    lane: 'PSS_SORTED → KEF_SORTED',
    rows
  };
}

/** @type {import('./$types').Actions} */
export const actions = {
  receiveOne: async ({ request }) => {
    const fd = await request.formData();

    const transportId = fd.get('transportId');
    const supplierId  = Number(fd.get('supplierId'));
    const qty         = Number(fd.get('qty'));     // measured at KEF gate/scale
    const amountRaw   = fd.get('amount');          // optional
    const amount      = amountRaw == null || String(amountRaw).trim() === '' ? null : Number(amountRaw);

    if (!transportId || typeof transportId !== 'string') {
      return fail(400, { error: 'Missing transportId' });
    }
    if (!supplierId || Number.isNaN(supplierId)) {
      return fail(400, { error: 'Invalid supplierId' });
    }
    if (!qty || Number.isNaN(qty) || qty <= 0) {
      return fail(400, { error: 'Enter a valid incoming qty (tons) > 0' });
    }
    if (amount !== null && Number.isNaN(amount)) {
      return fail(400, { error: 'Amount must be a number' });
    }

    try {
      // Idempotent RECEIVE into KEF_SORTED
      await stock.receive({
        transportId,
        toMmaCode: 'KEF_SORTED',
        supplierId,
        qty,
        amount
      });

      return { success: true, received: { transportId } };
    } catch (err) {
      console.error('KEF receiveOne failed:', err);
      return fail(500, { error: 'Receive failed', detail: String(err?.message || err) });
    }
  }
};
