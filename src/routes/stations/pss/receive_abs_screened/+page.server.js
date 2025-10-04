// PSS — Receive inbound from ABS into PSS_SCREENED (uses /api/inbound)
import { fail } from '@sveltejs/kit';
import { stock } from '$lib/stocks/stockEngine.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ fetch }) {
  const mmaCode = 'PSS_SCREENED';

  // Use API for inbound list
  const res = await fetch(`/api/inbound?mmaCode=${encodeURIComponent(mmaCode)}`);
  const j = await res.json().catch(() => ({ ok: false, data: [] }));

  const inboundAll = j.ok ? j.data : [];

  // Keep only ABS → PSS_SCREENED lane
  const rows = inboundAll
    .filter(t => t.fromMmaCode === 'ABS_SCREENED' && t.toMmaCode === 'PSS_SCREENED')
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
    stationCode: 'PSS',
    lane: 'ABS → PSS_SCREENED',
    rows
  };
}

/** @type {import('./$types').Actions} */
export const actions = {
  receiveOne: async ({ request }) => {
    const fd = await request.formData();

    const transportId = fd.get('transportId');
    const supplierId  = Number(fd.get('supplierId'));
    const qty         = Number(fd.get('qty'));     // measured at gate/scale
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
      // Idempotent RECEIVE into PSS_SCREENED
      await stock.receive({
        transportId,
        toMmaCode: 'PSS_SCREENED',
        supplierId,
        qty,
        amount
      });

      return { success: true, received: { transportId } };
    } catch (err) {
      console.error('receiveOne failed:', err);
      return fail(500, { error: 'Receive failed', detail: String(err?.message || err) });
    }
  }
};
