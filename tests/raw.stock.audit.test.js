// tests/raw.stock.audit.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { prisma, rawStock as raw } from '../src/lib/stocks/index.js';

function uniqCode(prefix = 'SUP') {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}
async function seedSupplier(name = 'Raw Audit Sup') {
  return prisma.supplier.create({
    data: { name: `${name} ${Date.now() % 100000}`, code: uniqCode('RAW') },
  });
}

beforeEach(async () => {
  await prisma.rawTransport.deleteMany();
  await prisma.rawLedger.deleteMany();
});

describe.sequential('Stock(raw) — audit (math & lists)', () => {
  it('onHand equals Σ(qtyDelta) in rawLedger for same (mma, supplier, shade, size)', async () => {
    const sup = await seedSupplier();
    const where = {
      mmaCode: 'ABS_RAW',
      supplierId: sup.id,
      shade: 'WHITE',
      size: 'LUMPS',
    };

    await raw.deposit({
      toMmaCode: 'ABS_RAW', supplierId: sup.id, shade: 'WHITE', size: 'LUMPS', qty: 10,
    });
    const { transportId } = await raw.dispatch({
      fromMmaCode: 'ABS_RAW', toMmaCode: 'ABS_RAW',
      supplierId: sup.id, shade: 'WHITE', size: 'LUMPS', qty: 3,
      amount: 30,
      fromStationCode: 'ABS-R1', toStationCode: 'ABS-R2',
    });
    await raw.receive({
      transportId, toMmaCode: 'ABS_RAW', supplierId: sup.id, shade: 'WHITE', qty: 2.8, amount: 28,
    });

    const onHand = Number(await raw.onHand(where));
    const sumLed = await prisma.rawLedger.aggregate({
      _sum: { qtyDelta: true },
      where,
    });

    expect(onHand).toBeCloseTo(Number(sumLed._sum.qtyDelta ?? 0), 6);
  });

  it('transport audit invariants: inbound/outbound reflect state (cancel & receive)', async () => {
    const sup = await seedSupplier('Raw Audit Flow');
    await raw.deposit({
      toMmaCode: 'ABS_RAW', supplierId: sup.id, shade: 'GREY', size: 'CHIPS', qty: 9,
    });

    const { transportId } = await raw.dispatch({
      fromMmaCode: 'ABS_RAW', toMmaCode: 'ABS_RAW',
      supplierId: sup.id, shade: 'GREY', size: 'CHIPS', qty: 4, amount: 40,
    });

    // IN_TRANSIT → appears in both lists
    {
      const out = await raw.outbound({ mmaCode: 'ABS_RAW' });
      const inn = await raw.inbound({ mmaCode: 'ABS_RAW' });
      expect(out.some(r => r.transportId === transportId)).toBe(true);
      expect(inn.some(r => r.transportId === transportId)).toBe(true);
    }

    // Cancel removes from both lists
    await raw.cancel({ transportId, meta: { reason: 'reroute' } });
    {
      const out = await raw.outbound({ mmaCode: 'ABS_RAW' });
      const inn = await raw.inbound({ mmaCode: 'ABS_RAW' });
      expect(out.some(r => r.transportId === transportId)).toBe(false);
      expect(inn.some(r => r.transportId === transportId)).toBe(false);
    }

    // New dispatch then RECEIVE clears inbound
    const { transportId: tid2 } = await raw.dispatch({
      fromMmaCode: 'ABS_RAW', toMmaCode: 'ABS_RAW',
      supplierId: sup.id, shade: 'GREY', size: 'CHIPS', qty: 2, amount: 20,
    });
    await raw.receive({ transportId: tid2, toMmaCode: 'ABS_RAW', supplierId: sup.id, shade: 'GREY', amount: 19 });

    const inn2 = await raw.inbound({ mmaCode: 'ABS_RAW' });
    expect(inn2.some(r => r.transportId === tid2)).toBe(false);
  });
});
