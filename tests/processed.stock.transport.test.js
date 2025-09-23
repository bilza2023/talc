// tests/processed.stock.transport.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { prisma, resetAll, seedSupplier, processedStock as processed } from './testkit/index.js';

beforeEach(async () => {
  await resetAll();
});

describe.sequential('Stock(processed) — transport dispatch/receive/cancel', () => {
  it('dispatch: appends DISPATCH + ledger -qty; shows in outbound/inbound', async () => {
    const sup = await seedSupplier('Transport Supplier');

    await processed.deposit({
      toMmaCode: 'ABS_PROCESSED', supplierId: sup.id, shade: 'WHITE', size: 'CHIPS', qty: 7,
    });

    const before = await processed.onHand({
      mmaCode: 'ABS_PROCESSED', supplierId: sup.id, shade: 'WHITE', size: 'CHIPS',
    });

    const { transportId, dispatch, posting } = await processed.dispatch({
      fromMmaCode: 'ABS_PROCESSED',
      toMmaCode: 'PSS_PROCESSED',
      supplierId: sup.id,
      shade: 'WHITE',
      size: 'CHIPS',
      qty: 5,
      amount: 100,
      fromStationCode: 'ABS-ST-01',
      toStationCode: 'PSS-ST-02',
      meta: { truck: 'TR-001' },
    });

    expect(dispatch.type).toBe('DISPATCH');
    expect(dispatch.transportId).toBe(transportId);
    expect(posting.reason).toBe('TRANSPORT');
    expect(Number(posting.qtyDelta)).toBeCloseTo(-5, 6);

    const mid = await processed.onHand({
      mmaCode: 'ABS_PROCESSED', supplierId: sup.id, shade: 'WHITE', size: 'CHIPS',
    });
    expect(Number(mid)).toBeCloseTo(Number(before) - 5, 6);

    const outbound = await processed.outbound({ mmaCode: 'ABS_PROCESSED' });
    const inbound  = await processed.inbound({  mmaCode: 'PSS_PROCESSED' });
    expect(outbound.some(r => r.transportId === transportId)).toBe(true);
    expect(inbound.some(r => r.transportId === transportId)).toBe(true);
  });

  it('receive: appends RECEIVE + ledger +qty; idempotent; clears inbound', async () => {
    const sup = await seedSupplier();

    await processed.deposit({
      toMmaCode: 'ABS_PROCESSED', supplierId: sup.id, shade: 'GREY', size: 'FINE', qty: 6.2,
    });

    const { transportId } = await processed.dispatch({
      fromMmaCode: 'ABS_PROCESSED',
      toMmaCode: 'PSS_PROCESSED',
      supplierId: sup.id,
      shade: 'GREY',
      size: 'FINE',
      qty: 6,
      amount: 50,
    });

    const beforeDst = await processed.onHand({
      mmaCode: 'PSS_PROCESSED', supplierId: sup.id, shade: 'LIGHTGREY', size: 'FINE',
    });

    const r1 = await processed.receive({
      transportId,
      toMmaCode: 'PSS_PROCESSED',
      supplierId: sup.id,
      qty: 5.8,
      shade: 'LIGHTGREY',
      amount: 48,
      meta: { receivedBy: 'Sara' },
    });
    expect(r1.receive.type).toBe('RECEIVE');

    const r2 = await processed.receive({ transportId, toMmaCode: 'PSS_PROCESSED', supplierId: sup.id });
    expect(r2.receive.transportId).toBe(transportId);

    const afterDst = await processed.onHand({
      mmaCode: 'PSS_PROCESSED', supplierId: sup.id, shade: 'LIGHTGREY', size: 'FINE',
    });
    expect(Number(afterDst)).toBeGreaterThanOrEqual(Number(beforeDst) + 5.8);

    const stillInbound = await processed.inbound({ mmaCode: 'PSS_PROCESSED' });
    expect(stillInbound.some(e => e.transportId === transportId)).toBe(false);
  });

  it('cancel: appends CANCEL + ledger reversal; cannot cancel after receive', async () => {
    const sup = await seedSupplier();

    await processed.deposit({
      toMmaCode: 'ABS_PROCESSED', supplierId: sup.id, shade: 'MIXED', size: 'LUMPS', qty: 4,
    });

    const { transportId } = await processed.dispatch({
      fromMmaCode: 'ABS_PROCESSED', toMmaCode: 'PSS_PROCESSED',
      supplierId: sup.id, shade: 'MIXED', size: 'LUMPS', qty: 2.5,
    });

    const c1 = await processed.cancel({ transportId, meta: { reason: 'truck breakdown' } });
    expect(c1.cancel.type).toBe('CANCEL');

    const c2 = await processed.cancel({ transportId });
    expect(c2.cancel.transportId).toBe(transportId);

    const { transportId: tid2 } = await processed.dispatch({
      fromMmaCode: 'ABS_PROCESSED', toMmaCode: 'PSS_PROCESSED',
      supplierId: sup.id, shade: 'MIXED', size: 'LUMPS', qty: 1,
    });
    await processed.receive({ transportId: tid2, toMmaCode: 'PSS_PROCESSED', supplierId: sup.id });

    await expect(processed.cancel({ transportId: tid2 })).rejects.toThrow(/already received/i);
  });

  it('transportAmounts: outboundDispatched, inboundInTransit, inboundReceived', async () => {
    const sup = await seedSupplier('AmtSup');

    await processed.deposit({
      toMmaCode: 'ABS_PROCESSED', supplierId: sup.id, shade: 'WHITE', size: 'LUMPS', qty: 10,
    });

    const baseSrc = await processed.transportAmounts({ mmaCode: 'ABS_PROCESSED' });
    const baseDst = await processed.transportAmounts({ mmaCode: 'PSS_PROCESSED' });

    const { transportId } = await processed.dispatch({
      fromMmaCode: 'ABS_PROCESSED', toMmaCode: 'PSS_PROCESSED',
      supplierId: sup.id, shade: 'WHITE', size: 'LUMPS', qty: 5, amount: 100,
    });

    {
      const src = await processed.transportAmounts({ mmaCode: 'ABS_PROCESSED' });
      const dst = await processed.transportAmounts({ mmaCode: 'PSS_PROCESSED' });
      expect(src.outboundDispatched).toBe(baseSrc.outboundDispatched + 100);
      expect(dst.inboundInTransit).toBe(baseDst.inboundInTransit + 100);
      expect(dst.inboundReceived).toBe(baseDst.inboundReceived);
    }

    await processed.receive({
      transportId, toMmaCode: 'PSS_PROCESSED', supplierId: sup.id, qty: 5, shade: 'WHITE', amount: 95,
    });

    {
      const src = await processed.transportAmounts({ mmaCode: 'ABS_PROCESSED' });
      const dst = await processed.transportAmounts({ mmaCode: 'PSS_PROCESSED' });
      expect(src.outboundDispatched).toBe(baseSrc.outboundDispatched + 100);
      expect(dst.inboundInTransit).toBe(baseDst.inboundInTransit);
      expect(dst.inboundReceived).toBe(baseDst.inboundReceived + 95);
    }
  });
});
