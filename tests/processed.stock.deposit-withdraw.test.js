// tests/processed.stock.deposit-withdraw.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { prisma, processedStock as processed } from '../src/lib/stocks/index.js';

function uniqCode(prefix = 'SUP') {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}
async function seedSupplier(name = 'Processed Sup') {
  return prisma.supplier.create({
    data: { name: `${name} ${Date.now() % 100000}`, code: uniqCode('PRO') },
  });
}

beforeEach(async () => {
  await prisma.processedTransport.deleteMany();
  await prisma.processedLedger.deleteMany();
});

describe.sequential('Stock(processed) — deposit/withdraw (4-slot)', () => {
  it('deposit (DIRECT): raises on-hand at ABS_PROCESSED', async () => {
    const sup = await seedSupplier();
    const where = {
      mmaCode: 'ABS_PROCESSED',
      supplierId: sup.id,
      shade: 'WHITE',
      size: 'LUMPS',
    };

    const before = await processed.onHand(where);
    const { posting } = await processed.deposit({
      toMmaCode: 'ABS_PROCESSED',
      supplierId: sup.id,
      shade: 'WHITE',
      size: 'LUMPS',
      qty: 12.5,
      reason: 'DIRECT',
      toStationCode: 'ABS-P1',
      meta: { note: 'seed processed' },
    });

    expect(posting.mmaCode).toBe('ABS_PROCESSED');
    expect(Number(posting.qtyDelta)).toBeCloseTo(12.5, 6);

    const after = await processed.onHand(where);
    expect(Number(after)).toBeCloseTo(Number(before) + 12.5, 6);
  });

  it('withdraw (PROCESS): consumes stock; rejects insufficient', async () => {
    const sup = await seedSupplier('Processed Sup 2');
    await processed.deposit({
      toMmaCode: 'ABS_PROCESSED', supplierId: sup.id, shade: 'GREY', size: 'CHIPS', qty: 9,
    });

    const before = await processed.onHand({
      mmaCode: 'ABS_PROCESSED', supplierId: sup.id, shade: 'GREY', size: 'CHIPS',
    });

    const { posting } = await processed.withdraw({
      fromMmaCode: 'ABS_PROCESSED',
      supplierId: sup.id,
      shade: 'GREY',
      size: 'CHIPS',
      qty: 3.3,
      processId: 'SORT-200',
      fromStationCode: 'ABS-P1',
      meta: { step: 'sort-consume' },
    });

    expect(Number(posting.qtyDelta)).toBeCloseTo(-3.3, 6);
    expect(posting.reason).toBe('PROCESS');

    const after = await processed.onHand({
      mmaCode: 'ABS_PROCESSED', supplierId: sup.id, shade: 'GREY', size: 'CHIPS',
    });
    expect(Number(after)).toBeCloseTo(Number(before) - 3.3, 6);

    await expect(processed.withdraw({
      fromMmaCode: 'ABS_PROCESSED',
      supplierId: sup.id,
      shade: 'GREY',
      size: 'CHIPS',
      qty: 999,
      processId: 'SORT-201',
    })).rejects.toThrow(/Insufficient/i);
  });
});
