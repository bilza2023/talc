
// tests/sorted.stock.transport.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { prisma, resetAll, seedSupplier, sortedStock as sorted } from './testkit/index.js';

beforeEach(async () => {
  await resetAll();
});

describe.sequential('Stock(sorted) — transport dispatch/receive/cancel', () => {
  it('dispatch: DISPATCH + ledger -qty; shows in outbound/inbound', async () => {
    const sup = await seedSupplier('Sorted Transport Sup');
    await sorted.deposit({
      toMmaCode: 'PSS_SORTED', supplierId: sup.id, shade: 'WHITE', size: 'CHIPS', qty: 6,
    });

    const before = await sorted.onHand({
      mmaCode: 'PSS_SORTED', supplierId: sup.id, shade: 'WHITE', size: 'CHIPS',
    });

    const { transportId, dispatch, posting } = await sorted.dispatch({
      fromMmaCode: 'PSS_SORTED',
      toMmaCode: 'PSS_SORTED',
      supplierId: sup.id,
      shade: 'WHITE',
      size: 'CHIPS',
      qty: 3.5,
      amount: 70,
      fromStationCode: 'PSS-ST-S1',
      toStationCode: 'PSS-ST-S2',
      meta: { truck: 'TR-S-01' },
    });

    expect(dispatch.type).toBe('DISPATCH');
    expect(dispatch.transportId).toBe(transportId);
    expect(posting.reason).toBe('TRANSPORT');
    expect(Number(posting.qtyDelta)).toBeCloseTo(-3.5, 6);

    const mid = await sorted.onHand({
      mmaCode: 'PSS_SORTED', supplierId: sup.id, shade: 'WHITE', size: 'CHIPS',
    });
    expect(Number(mid)).toBeCloseTo(Number(before) - 3.5, 6);

    const outbound = await sorted.outbound({ mmaCode: 'PSS_SORTED' });
    const inbound  = await sorted.inbound({  mmaCode: 'PSS_SORTED' });
    expect(outbound.some(r => r.transportId === transportId)).toBe(true);
    expect(inbound.some(r => r.transportId === transportId)).toBe(true);
  });

  it('receive: RECEIVE + ledger +qty; idempotent; clears inbound', async () => {
    const sup = await seedSupplier();
    await sorted.deposit({
      toMmaCode: 'PSS_SORTED', supplierId: sup.id, shade: 'GREY', size: 'FINE', qty: 9,
    });

    const { transportId } = await sorted.dispatch({
      fromMmaCode: 'PSS_SORTED',
      toMmaCode: 'PSS_SORTED',
      supplierId: sup.id,
      shade: 'GREY',
      size: 'FINE',
      qty: 4.2,
      amount: 40,
    });

    const beforeDst = await sorted.onHand({
      mmaCode: 'PSS_SORTED', supplierId: sup.id, shade: 'LIGHTGREY', size: 'FINE',
    });

    const r1 = await sorted.receive({
      transportId,
      toMmaCode: 'PSS_SORTED',
      supplierId: sup.id,
      qty: 4.0,
      shade: 'LIGHTGREY',
      amount: 39,
      meta: { receivedBy: 'Ahsan' },
    });
    expect(r1.receive.type).toBe('RECEIVE');

    const r2 = await sorted.receive({ transportId, toMmaCode: 'PSS_SORTED', supplierId: sup.id });
    expect(r2.receive.transportId).toBe(transportId);

    const afterDst = await sorted.onHand({
      mmaCode: 'PSS_SORTED', supplierId: sup.id, shade: 'LIGHTGREY', size: 'FINE',
    });
    expect(Number(afterDst)).toBeGreaterThanOrEqual(Number(beforeDst) + 4.0);

    const stillInbound = await sorted.inbound({ mmaCode: 'PSS_SORTED' });
    expect(stillInbound.some(e => e.transportId === transportId)).toBe(false);
  });

  it('cancel: CANCEL + reversal; cannot cancel after receive', async () => {
    const sup = await seedSupplier();
    await sorted.deposit({
      toMmaCode: 'PSS_SORTED', supplierId: sup.id, shade: 'MIXED', size: 'LUMPS', qty: 5,
    });

    const { transportId } = await sorted.dispatch({
      fromMmaCode: 'PSS_SORTED', toMmaCode: 'PSS_SORTED',
      supplierId: sup.id, shade: 'MIXED', size: 'LUMPS', qty: 2,
    });

    const c1 = await sorted.cancel({ transportId, meta: { reason: 'reroute' } });
    expect(c1.cancel.type).toBe('CANCEL');

    const c2 = await sorted.cancel({ transportId }); // idempotent
    expect(c2.cancel.transportId).toBe(transportId);

    const { transportId: tid2 } = await sorted.dispatch({
      fromMmaCode: 'PSS_SORTED', toMmaCode: 'PSS_SORTED',
      supplierId: sup.id, shade: 'MIXED', size: 'LUMPS', qty: 1,
    });
    await sorted.receive({ transportId: tid2, toMmaCode: 'PSS_SORTED', supplierId: sup.id });

    await expect(sorted.cancel({ transportId: tid2 })).rejects.toThrow(/already received/i);
  });

  it('transportAmounts: outboundDispatched, inboundInTransit, inboundReceived', async () => {
    const sup = await seedSupplier('AmtSup Sorted');
    await sorted.deposit({
      toMmaCode: 'PSS_SORTED', supplierId: sup.id, shade: 'WHITE', size: 'LUMPS', qty: 12,
    });

    const base = await sorted.transportAmounts({ mmaCode: 'PSS_SORTED' });

    const { transportId } = await sorted.dispatch({
      fromMmaCode: 'PSS_SORTED', toMmaCode: 'PSS_SORTED',
      supplierId: sup.id, shade: 'WHITE', size: 'LUMPS', qty: 5, amount: 120,
    });

    {
      const t = await sorted.transportAmounts({ mmaCode: 'PSS_SORTED' });
      expect(t.outboundDispatched).toBe(base.outboundDispatched + 120);
      expect(t.inboundInTransit).toBe(base.inboundInTransit + 120);
      expect(t.inboundReceived).toBe(base.inboundReceived);
    }

    await sorted.receive({
      transportId, toMmaCode: 'PSS_SORTED', supplierId: sup.id, qty: 5, shade: 'WHITE', amount: 118,
    });

    {
      const t = await sorted.transportAmounts({ mmaCode: 'PSS_SORTED' });
      expect(t.outboundDispatched).toBe(base.outboundDispatched + 120);
      expect(t.inboundInTransit).toBe(base.inboundInTransit);
      expect(t.inboundReceived).toBe(base.inboundReceived + 118);
    }
  });
});
