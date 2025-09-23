// tests/sorted.stock.transport.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { prisma, sortedStock as sorted } from '../src/lib/stocks/index.js';

function uniqCode(prefix = 'SUP') {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}
async function seedSupplier(name = 'Sorted Transport Sup') {
  return prisma.supplier.create({
    data: { name: `${name} ${Date.now() % 100000}`, code: uniqCode('SOR') },
  });
}

beforeEach(async () => {
  await prisma.sortedTransport.deleteMany();
  await prisma.sortedLedger.deleteMany();
});

describe.sequential('Stock(sorted) — transport dispatch/receive/cancel', () => {
  it('dispatch records and deducts source on-hand', async () => {
    const sup = await seedSupplier();
    await sorted.deposit({
      toMmaCode: 'PSS_SORTED', supplierId: sup.id, shade: 'WHITE', size: 'FINE', qty: 9,
    });

    const before = await sorted.onHand({
      mmaCode: 'PSS_SORTED', supplierId: sup.id, shade: 'WHITE', size: 'FINE',
    });

    const { transportId, dispatch, posting } = await sorted.dispatch({
      fromMmaCode: 'PSS_SORTED',
      toMmaCode: 'PSS_SORTED',
      supplierId: sup.id,
      shade: 'WHITE',
      size: 'FINE',
      qty: 3.6,
      amount: 72,
      fromStationCode: 'PSS-S1',
      toStationCode: 'PSS-S2',
      meta: { truck: 'SOR-01' },
    });

    expect(dispatch.type).toBe('DISPATCH');
    expect(Number(posting.qtyDelta)).toBeCloseTo(-3.6, 6);

    const mid = await sorted.onHand({
      mmaCode: 'PSS_SORTED', supplierId: sup.id, shade: 'WHITE', size: 'FINE',
    });
    expect(Number(mid)).toBeCloseTo(Number(before) - 3.6, 6);

    const out = await sorted.outbound({ mmaCode: 'PSS_SORTED' });
    const inn = await sorted.inbound({ mmaCode: 'PSS_SORTED' });
    expect(out.some(r => r.transportId === transportId)).toBe(true);
    expect(inn.some(r => r.transportId === transportId)).toBe(true);
  });

  it('receive clears inbound; idempotent', async () => {
    const sup = await seedSupplier('Sorted Rx');
    await sorted.deposit({
      toMmaCode: 'PSS_SORTED', supplierId: sup.id, shade: 'GREY', size: 'CHIPS', qty: 7,
    });

    const { transportId } = await sorted.dispatch({
      fromMmaCode: 'PSS_SORTED', toMmaCode: 'PSS_SORTED',
      supplierId: sup.id, shade: 'GREY', size: 'CHIPS', qty: 2.8, amount: 28,
    });

    const r1 = await sorted.receive({
      transportId, toMmaCode: 'PSS_SORTED', supplierId: sup.id, shade: 'GREY', amount: 27,
    });
    expect(r1.receive.type).toBe('RECEIVE');

    const r2 = await sorted.receive({ transportId, toMmaCode: 'PSS_SORTED', supplierId: sup.id });
    expect(r2.receive.transportId).toBe(transportId);

    const inn = await sorted.inbound({ mmaCode: 'PSS_SORTED' });
    expect(inn.some(r => r.transportId === transportId)).toBe(false);
  });

  it('cancel is idempotent and blocked after receive', async () => {
    const sup = await seedSupplier('Sorted Cancel');
    await sorted.deposit({
      toMmaCode: 'PSS_SORTED', supplierId: sup.id, shade: 'MIXED', size: 'LUMPS', qty: 6,
    });

    const { transportId } = await sorted.dispatch({
      fromMmaCode: 'PSS_SORTED', toMmaCode: 'PSS_SORTED',
      supplierId: sup.id, shade: 'MIXED', size: 'LUMPS', qty: 1.5,
    });

    const c1 = await sorted.cancel({ transportId, meta: { reason: 'route-change' } });
    expect(c1.cancel.type).toBe('CANCEL');

    const c2 = await sorted.cancel({ transportId });
    expect(c2.cancel.transportId).toBe(transportId);

    const { transportId: tid2 } = await sorted.dispatch({
      fromMmaCode: 'PSS_SORTED', toMmaCode: 'PSS_SORTED',
      supplierId: sup.id, shade: 'MIXED', size: 'LUMPS', qty: 1.1,
    });
    await sorted.receive({ transportId: tid2, toMmaCode: 'PSS_SORTED', supplierId: sup.id, shade: 'MIXED' });

    await expect(sorted.cancel({ transportId: tid2 })).rejects.toThrow(/already received/i);
  });

  it('transportAmounts aggregates for sorted', async () => {
    const sup = await seedSupplier('Sorted Amt');
    await sorted.deposit({
      toMmaCode: 'PSS_SORTED', supplierId: sup.id, shade: 'WHITE', size: 'LUMPS', qty: 12,
    });

    const base = await sorted.transportAmounts({ mmaCode: 'PSS_SORTED' });

    const { transportId } = await sorted.dispatch({
      fromMmaCode: 'PSS_SORTED', toMmaCode: 'PSS_SORTED',
      supplierId: sup.id, shade: 'WHITE', size: 'LUMPS', qty: 4, amount: 60,
    });

    const mid = await sorted.transportAmounts({ mmaCode: 'PSS_SORTED' });
    expect(mid.outboundDispatched).toBe(base.outboundDispatched + 60);
    expect(mid.inboundInTransit).toBe(base.inboundInTransit + 60);
    expect(mid.inboundReceived).toBe(base.inboundReceived);

    await sorted.receive({
      transportId, toMmaCode: 'PSS_SORTED', supplierId: sup.id, shade: 'WHITE', qty: 4, amount: 59,
    });

    const fin = await sorted.transportAmounts({ mmaCode: 'PSS_SORTED' });
    expect(fin.outboundDispatched).toBe(base.outboundDispatched + 60);
    expect(fin.inboundInTransit).toBe(base.inboundInTransit);
    expect(fin.inboundReceived).toBe(base.inboundReceived + 59);
  });
});
