// tests/sorted.stock.deposit-withdraw.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { prisma, sortedStock as sorted } from '../src/lib/stocks/index.js';

function uniqCode(prefix = 'SUP') {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}
async function seedSupplier(name = 'Sorted Sup') {
  return prisma.supplier.create({
    data: { name: `${name} ${Date.now() % 100000}`, code: uniqCode('SOR') },
  });
}

beforeEach(async () => {
  await prisma.sortedTransport.deleteMany();
  await prisma.sortedLedger.deleteMany();
});

describe.sequential('Stock(sorted) — deposit/withdraw (4-slot)', () => {
  it('deposit (DIRECT): raises on-hand at PSS_SORTED', async () => {
    const sup = await seedSupplier();
    const where = { mmaCode: 'PSS_SORTED', supplierId: sup.id, shade: 'MIXED', size: 'LUMPS' };

    const before = await sorted.onHand(where);
    const { posting } = await sorted.deposit({
      toMmaCode: 'PSS_SORTED',
      supplierId: sup.id,
      shade: 'MIXED',
      size: 'LUMPS',
      qty: 6.6,
      reason: 'DIRECT',
      toStationCode: 'PSS-S1',
      meta: { note: 'seed sorted' },
    });

    expect(posting.mmaCode).toBe('PSS_SORTED');
    expect(Number(posting.qtyDelta)).toBeCloseTo(6.6, 6);

    const after = await sorted.onHand(where);
    expect(Number(after)).toBeCloseTo(Number(before) + 6.6, 6);
  });

  it('withdraw (PROCESS): consumes; rejects insufficient', async () => {
    const sup = await seedSupplier('Sorted 2');
    await sorted.deposit({
      toMmaCode: 'PSS_SORTED', supplierId: sup.id, shade: 'WHITE', size: 'CHIPS', qty: 5.5,
    });

    const before = await sorted.onHand({
      mmaCode: 'PSS_SORTED', supplierId: sup.id, shade: 'WHITE', size: 'CHIPS',
    });

    const { posting } = await sorted.withdraw({
      fromMmaCode: 'PSS_SORTED',
      supplierId: sup.id,
      shade: 'WHITE',
      size: 'CHIPS',
      qty: 2.25,
      processId: 'BLEND-301',
      fromStationCode: 'PSS-S1',
      meta: { step: 'blend-consume' },
    });

    expect(posting.reason).toBe('PROCESS');
    expect(Number(posting.qtyDelta)).toBeCloseTo(-2.25, 6);

    const after = await sorted.onHand({
      mmaCode: 'PSS_SORTED', supplierId: sup.id, shade: 'WHITE', size: 'CHIPS',
    });
    expect(Number(after)).toBeCloseTo(Number(before) - 2.25, 6);

    await expect(sorted.withdraw({
      fromMmaCode: 'PSS_SORTED',
      supplierId: sup.id,
      shade: 'WHITE',
      size: 'CHIPS',
      qty: 999,
      processId: 'BLEND-302',
    })).rejects.toThrow(/Insufficient/i);
  });
});
