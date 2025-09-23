// tests/raw.stock.transport.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { prisma, rawStock as raw } from '../src/lib/stocks/index.js';

function uniqCode(prefix = 'SUP') {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}
async function seedSupplier(name = 'Raw Transport Sup') {
  return prisma.supplier.create({
    data: {
      name: `${name} ${Date.now() % 100000}`,
      code: uniqCode('RAW'),
    },
  });
}

beforeEach(async () => {
  await prisma.rawTransport.deleteMany();
  await prisma.rawLedger.deleteMany();
});

describe.sequential('Stock(raw) — transport dispatch/receive/cancel', () => {
  it('dispatch: DISPATCH + ledger -qty; shows in outbound/inbound', async () => {
    const sup = await seedSupplier('Raw Transport Sup');
    await raw.deposit({
      toMmaCode: 'ABS_RAW', supplierId: sup.id, shade: 'WHITE', size: 'CHIPS', qty: 8,
    });

    const before = await raw.onHand({
      mmaCode: 'ABS_RAW', supplierId: sup.id, shade: 'WHITE', size: 'CHIPS',
    });

    const { transportId, dispatch, posting } = await raw.dispatch({
      fromMmaCode: 'ABS_RAW',
      toMmaCode: 'ABS_RAW',
      supplierId: sup.id,
      shade: 'WHITE',
      size: 'CHIPS',
      qty: 3.2,
      amount: 64,
      fromStationCode: 'ABS-ST-R1',
      toStationCode: 'ABS-ST-R2',
      meta: { truck: 'RAW-TR-01' },
    });

    expect(dispatch.type).toBe('DISPATCH');
    expect(dispatch.transportId).toBe(transportId);
    expect(posting.reason).toBe('TRANSPORT');
    expect(Number(posting.qtyDelta)).toBeCloseTo(-3.2, 6);

    const mid = await raw.onHand({
      mmaCode: 'ABS_RAW', supplierId: sup.id, shade: 'WHITE', size: 'CHIPS',
    });
    expect(Number(mid)).toBeCloseTo(Number(before) - 3.2, 6);

    const outbound = await raw.outbound({ mmaCode: 'ABS_RAW' });
    const inbound  = await raw.inbound({  mmaCode: 'ABS_RAW' });
    expect(outbound.some(r => r.transportId === transportId)).toBe(true);
    expect(inbound.some(r => r.transportId === transportId)).toBe(true);
  });

  it('receive: RECEIVE + ledger +qty; idempotent; clears inbound', async () => {
    const sup = await seedSupplier('Raw Receive Sup');
    await raw.deposit({
      toMmaCode: 'ABS_RAW', supplierId: sup.id, shade: 'GREY', size: 'FINE', qty: 10,
    });

    const { transportId } = await raw.dispatch({
      fromMmaCode: 'ABS_RAW',
      toMmaCode: 'ABS_RAW',
      supplierId: sup.id,
      shade: 'GREY',
      size: 'FINE',
      qty: 5.5,
      amount: 50,
    });

    const beforeDst = await raw.onHand({
      mmaCode: 'ABS_RAW', supplierId: sup.id, shade: 'LIGHTGREY', size: 'FINE',
    });

    const r1 = await raw.receive({
      transportId,
      toMmaCode: 'ABS_RAW',
      supplierId: sup.id,
      qty: 5.3,
      shade: 'LIGHTGREY',
      amount: 49,
      meta: { receivedBy: 'Bilal' },
    });
    expect(r1.receive.type).toBe('RECEIVE');

    const r2 = await raw.receive({ transportId, toMmaCode: 'ABS_RAW', supplierId: sup.id });
    expect(r2.receive.transportId).toBe(transportId);

    const afterDst = await raw.onHand({
      mmaCode: 'ABS_RAW', supplierId: sup.id, shade: 'LIGHTGREY', size: 'FINE',
    });
    expect(Number(afterDst)).toBeGreaterThanOrEqual(Number(beforeDst) + 5.3);

    const stillInbound = await raw.inbound({ mmaCode: 'ABS_RAW' });
    expect(stillInbound.some(e => e.transportId === transportId)).toBe(false);
  });

  it('cancel: CANCEL + reversal; cannot cancel after receive', async () => {
    const sup = await seedSupplier('Raw Cancel Sup');
    await raw.deposit({
      toMmaCode: 'ABS_RAW', supplierId: sup.id, shade: 'MIXED', size: 'LUMPS', qty: 7,
    });

    const { transportId } = await raw.dispatch({
      fromMmaCode: 'ABS_RAW', toMmaCode: 'ABS_RAW',
      supplierId: sup.id, shade: 'MIXED', size: 'LUMPS', qty: 2,
    });

    const c1 = await raw.cancel({ transportId, meta: { reason: 'reroute' } });
    expect(c1.cancel.type).toBe('CANCEL');

    const c2 = await raw.cancel({ transportId }); // idempotent
    expect(c2.cancel.transportId).toBe(transportId);

    const { transportId: tid2 } = await raw.dispatch({
      fromMmaCode: 'ABS_RAW', toMmaCode: 'ABS_RAW',
      supplierId: sup.id, shade: 'MIXED', size: 'LUMPS', qty: 1.2,
    });
    await raw.receive({ transportId: tid2, toMmaCode: 'ABS_RAW', supplierId: sup.id });

    await expect(raw.cancel({ transportId: tid2 })).rejects.toThrow(/already received/i);
  });

  it('transportAmounts: outboundDispatched, inboundInTransit, inboundReceived', async () => {
    const sup = await seedSupplier('AmtSup Raw');
    await raw.deposit({
      toMmaCode: 'ABS_RAW', supplierId: sup.id, shade: 'WHITE', size: 'LUMPS', qty: 20,
    });

    const base = await raw.transportAmounts({ mmaCode: 'ABS_RAW' });

    const { transportId } = await raw.dispatch({
      fromMmaCode: 'ABS_RAW', toMmaCode: 'ABS_RAW',
      supplierId: sup.id, shade: 'WHITE', size: 'LUMPS', qty: 6, amount: 90,
    });

    {
      const t = await raw.transportAmounts({ mmaCode: 'ABS_RAW' });
      expect(t.outboundDispatched).toBe(base.outboundDispatched + 90);
      expect(t.inboundInTransit).toBe(base.inboundInTransit + 90);
      expect(t.inboundReceived).toBe(base.inboundReceived);
    }

    await raw.receive({
      transportId, toMmaCode: 'ABS_RAW', supplierId: sup.id, qty: 6, shade: 'WHITE', amount: 88,
    });

    {
      const t = await raw.transportAmounts({ mmaCode: 'ABS_RAW' });
      expect(t.outboundDispatched).toBe(base.outboundDispatched + 90);
      expect(t.inboundInTransit).toBe(base.inboundInTransit);
      expect(t.inboundReceived).toBe(base.inboundReceived + 88);
    }
  });
});
