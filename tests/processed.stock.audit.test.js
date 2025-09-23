// tests/processed.stock.audit.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { prisma, processedStock as processed } from '../src/lib/stocks/index.js';

function uniqCode(prefix = 'SUP') {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}
async function seedSupplier(name = 'Processed Audit Sup') {
  return prisma.supplier.create({
    data: { name: `${name} ${Date.now() % 100000}`, code: uniqCode('PRO') },
  });
}

beforeEach(async () => {
  await prisma.processedTransport.deleteMany();
  await prisma.processedLedger.deleteMany();
});

describe.sequential('Stock(processed) — audit (math & lists)', () => {
  it('onHand equals Σ(qtyDelta) in processedLedger for same key', async () => {
    const sup = await seedSupplier();
    const where = {
      mmaCode: 'ABS_PROCESSED',
      supplierId: sup.id,
      shade: 'GREY',
      size: 'CHIPS',
    };

    await processed.deposit({
      toMmaCode: 'ABS_PROCESSED', supplierId: sup.id, shade: 'GREY', size: 'CHIPS', qty: 8.5,
    });
    const { transportId } = await processed.dispatch({
      fromMmaCode: 'ABS_PROCESSED', toMmaCode: 'ABS_PROCESSED',
      supplierId: sup.id, shade: 'GREY', size: 'CHIPS', qty: 2.2, amount: 22,
    });
    await processed.receive({
      transportId, toMmaCode: 'ABS_PROCESSED', supplierId: sup.id, shade: 'GREY', qty: 2.1, amount: 21,
    });

    const onHand = Number(await processed.onHand(where));
    const sumLed = await prisma.processedLedger.aggregate({
      _sum: { qtyDelta: true },
      where,
    });

    expect(onHand).toBeCloseTo(Number(sumLed._sum.qtyDelta ?? 0), 6);
  });

  it('lists: inbound cleared by receive; cancel removes from both lists', async () => {
    const sup = await seedSupplier('Processed Audit Flow');
    await processed.deposit({
      toMmaCode: 'ABS_PROCESSED', supplierId: sup.id, shade: 'WHITE', size: 'LUMPS', qty: 7,
    });

    const { transportId } = await processed.dispatch({
      fromMmaCode: 'ABS_PROCESSED', toMmaCode: 'ABS_PROCESSED',
      supplierId: sup.id, shade: 'WHITE', size: 'LUMPS', qty: 3,
    });

    await processed.receive({ transportId, toMmaCode: 'ABS_PROCESSED', supplierId: sup.id, shade: 'WHITE' });
    {
      const inn = await processed.inbound({ mmaCode: 'ABS_PROCESSED' });
      expect(inn.some(r => r.transportId === transportId)).toBe(false);
    }

    const { transportId: tid2 } = await processed.dispatch({
      fromMmaCode: 'ABS_PROCESSED', toMmaCode: 'ABS_PROCESSED',
      supplierId: sup.id, shade: 'WHITE', size: 'LUMPS', qty: 1.5,
    });
    await processed.cancel({ transportId: tid2 });

    const out2 = await processed.outbound({ mmaCode: 'ABS_PROCESSED' });
    const inn2 = await processed.inbound({ mmaCode: 'ABS_PROCESSED' });
    expect(out2.some(r => r.transportId === tid2)).toBe(false);
    expect(inn2.some(r => r.transportId === tid2)).toBe(false);
  });
});
