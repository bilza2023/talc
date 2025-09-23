// tests/processed.stock.transport.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { prisma, processedStock as processed } from '../src/lib/stocks/index.js';

function uniqCode(prefix = 'SUP') {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}
async function seedSupplier(name = 'Processed Transport Sup') {
  return prisma.supplier.create({
    data: { name: `${name} ${Date.now() % 100000}`, code: uniqCode('PRO') },
  });
}

beforeEach(async () => {
  await prisma.processedTransport.deleteMany();
  await prisma.processedLedger.deleteMany();
});

describe.sequential('Stock(processed) — transport dispatch/receive/cancel', () => {
  it('dispatch → inbound/outbound + source deduction', async () => {
    const sup = await seedSupplier();
    await processed.deposit({
      toMmaCode: 'ABS_PROCESSED', supplierId: sup.id, shade: 'WHITE', size: 'LUMPS', qty: 11,
    });

    const before = await processed.onHand({
      mmaCode: 'ABS_PROCESSED', supplierId: sup.id, shade: 'WHITE', size: 'LUMPS',
    });

    const { transportId, dispatch, posting } = await processed.dispatch({
      fromMmaCode: 'ABS_PROCESSED',
      toMmaCode: 'ABS_PROCESSED',
      supplierId: sup.id,
      shade: 'WHITE',
      size: 'LUMPS',
      qty: 4.2,
      amount: 84,
      fromStationCode: 'ABS-P1',
      toStationCode: 'ABS-P2',
      meta: { truck: 'PRO-01' },
    });

    expect(dispatch.type).toBe('DISPATCH');
    expect(Number(posting.qtyDelta)).toBeCloseTo(-4.2, 6);

    const mid = await processed.onHand({
      mmaCode: 'ABS_PROCESSED', supplierId: sup.id, shade: 'WHITE', size: 'LUMPS',
    });
    expect(Number(mid)).toBeCloseTo(Number(before) - 4.2, 6);

    const out = await processed.outbound({ mmaCode: 'ABS_PROCESSED' });
    const inn = await processed.inbound({ mmaCode: 'ABS_PROCESSED' });
    expect(out.some(r => r.transportId === transportId)).toBe(true);
    expect(inn.some(r => r.transportId === transportId)).toBe(true);
  });

  it('receive is idempotent and clears inbound', async () => {
    const sup = await seedSupplier('Processed Rx');
    await processed.deposit({
      toMmaCode: 'ABS_PROCESSED', supplierId: sup.id, shade: 'GREY', size: 'CHIPS', qty: 10,
    });

    const { transportId } = await processed.dispatch({
      fromMmaCode: 'ABS_PROCESSED', toMmaCode: 'ABS_PROCESSED',
      supplierId: sup.id, shade: 'GREY', size: 'CHIPS', qty: 5, amount: 50,
    });

    const r1 = await processed.receive({
      transportId, toMmaCode: 'ABS_PROCESSED', supplierId: sup.id, shade: 'GREY', amount: 49,
    });
    expect(r1.receive.type).toBe('RECEIVE');

    const r2 = await processed.receive({ transportId, toMmaCode: 'ABS_PROCESSED', supplierId: sup.id });
    expect(r2.receive.transportId).toBe(transportId);

    const inn = await processed.inbound({ mmaCode: 'ABS_PROCESSED' });
    expect(inn.some(r => r.transportId === transportId)).toBe(false);
  });

  it('cancel is idempotent and forbidden after receive', async () => {
    const sup = await seedSupplier('Processed Cancel');
    await processed.deposit({
      toMmaCode: 'ABS_PROCESSED', supplierId: sup.id, shade: 'LIGHTGREY', size: 'FINE', qty: 8,
    });

    const { transportId } = await processed.dispatch({
      fromMmaCode: 'ABS_PROCESSED', toMmaCode: 'ABS_PROCESSED',
      supplierId: sup.id, shade: 'LIGHTGREY', size: 'FINE', qty: 2.4,
    });

    const c1 = await processed.cancel({ transportId, meta: { reason: 'reroute' } });
    expect(c1.cancel.type).toBe('CANCEL');

    const c2 = await processed.cancel({ transportId });
    expect(c2.cancel.transportId).toBe(transportId);

    const { transportId: tid2 } = await processed.dispatch({
      fromMmaCode: 'ABS_PROCESSED', toMmaCode: 'ABS_PROCESSED',
      supplierId: sup.id, shade: 'LIGHTGREY', size: 'FINE', qty: 1.1,
    });
    await processed.receive({ transportId: tid2, toMmaCode: 'ABS_PROCESSED', supplierId: sup.id, shade: 'LIGHTGREY' });

    await expect(processed.cancel({ transportId: tid2 })).rejects.toThrow(/already received/i);
  });

  it('transportAmounts aggregates move correctly', async () => {
    const sup = await seedSupplier('Processed Amt');
    await processed.deposit({
      toMmaCode: 'ABS_PROCESSED', supplierId: sup.id, shade: 'WHITE', size: 'LUMPS', qty: 20,
    });

    const base = await processed.transportAmounts({ mmaCode: 'ABS_PROCESSED' });

    const { transportId } = await processed.dispatch({
      fromMmaCode: 'ABS_PROCESSED', toMmaCode: 'ABS_PROCESSED',
      supplierId: sup.id, shade: 'WHITE', size: 'LUMPS', qty: 6, amount: 120,
    });

    const mid = await processed.transportAmounts({ mmaCode: 'ABS_PROCESSED' });
    expect(mid.outboundDispatched).toBe(base.outboundDispatched + 120);
    expect(mid.inboundInTransit).toBe(base.inboundInTransit + 120);
    expect(mid.inboundReceived).toBe(base.inboundReceived);

    await processed.receive({
      transportId, toMmaCode: 'ABS_PROCESSED', supplierId: sup.id, shade: 'WHITE', qty: 6, amount: 118,
    });

    const fin = await processed.transportAmounts({ mmaCode: 'ABS_PROCESSED' });
    expect(fin.outboundDispatched).toBe(base.outboundDispatched + 120);
    expect(fin.inboundInTransit).toBe(base.inboundInTransit);
    expect(fin.inboundReceived).toBe(base.inboundReceived + 118);
  });
});
