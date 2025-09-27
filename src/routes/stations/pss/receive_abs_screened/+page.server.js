// /src/routes/stations/pss/receive_abs_screened/+page.server.js
import { fail } from '@sveltejs/kit';
import { processedStock } from '$lib/stocks/index.js';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
  // Inbound for exact MMA (PSS_SCREENED), then restrict to ABS → PSS
  const inbound = await processedStock.inbound({ mmaCode: 'PSS_SCREENED' });

  const rows = inbound
    .filter((t) => t.fromStationCode === 'ABS') // lane
    .map((t) => ({
      // minimal fields for display + form
      id: t.id,
      transportId: t.transportId,
      createdAt: t.createdAt,
      supplierId: t.supplierId,
      shade: t.shade,
      size: t.size,
      // This is DISPATCH qty; user can override with measured "incoming qty"
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
    const supplierId  = fd.get('supplierId');
    const qtyStr      = fd.get('qty');     // incoming/measured weight (tons)
    const amountStr   = fd.get('amount');  // optional money amount

    if (!transportId || typeof transportId !== 'string') {
      return fail(400, { error: 'Missing transportId' });
    }
    const supIdNum = Number(supplierId);
    if (!supIdNum || Number.isNaN(supIdNum)) {
      return fail(400, { error: 'Invalid supplierId' });
    }

    // qty is required: we explicitly *measure* on receive
    const qtyNum = Number(qtyStr);
    if (!qtyStr || Number.isNaN(qtyNum) || qtyNum <= 0) {
      return fail(400, { error: 'Enter a valid incoming qty (tons) > 0' });
    }

    // amount is optional
    let amountNum = null;
    if (amountStr !== null && amountStr !== undefined && String(amountStr).trim() !== '') {
      const a = Number(amountStr);
      if (Number.isNaN(a)) {
        return fail(400, { error: 'Amount must be a number' });
      }
      amountNum = a;
    }

    try {
      // Record RECEIVE with measured qty/amount.
      await processedStock.receive({
        transportId,
        toMmaCode: 'PSS_SCREENED',
        toStationCode: 'PSS',
        supplierId: supIdNum,
        qty: qtyNum,
        amount: amountNum
      });

      return { success: true, received: { transportId } };
    } catch (err) {
      console.error('receiveOne failed:', err);
      return fail(500, { error: 'Receive failed', detail: String(err?.message || err) });
    }
  }
};
