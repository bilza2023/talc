// tests/processed.stock.deposit-withdraw.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { prisma, processedStock as processed } from '../src/lib/stocks/index.js';

async function seedSupplier(name = 'Proc Supplier') {
  const code = `SUP-${Date.now()}-${Math.random().toString(36).slice(2,6)}`;
  return prisma.supplier.create({ data: { name, code } });
}

beforeEach(async () => {
  await prisma.processedTransport.deleteMany();
  await prisma.processedLedger.deleteMany();
  await prisma.supplier.deleteMany();
});

describe.sequential('Stock(processed) — deposit/withdraw (single-slot)', () => {
  it('deposit (DIRECT): one ledger + onHand increases', async () => {
    const sup = await seedSupplier();

    const before = await processed.onHand({
      mmaCode: 'ABS_PROCESSED', supplierId: sup.id, shade: 'WHITE', size: 'LUMPS',
    });

    const { posting } = await processed.deposit({
      toMmaCode: 'ABS_PROCESSED',
      supplierId: sup.id,
      shade: 'WHITE',
      size: 'LUMPS',
      qty: 12.5,
      reason: 'DIRECT',
      toStationCode: 'ABS-ST-01',
      meta: { note: 'seed' },
    });

    expect(posting.mmaCode).toBe('ABS_PROCESSED');
    expect(Number(posting.qtyDelta)).toBeCloseTo(12.5, 6);
    expect(posting.reason).toBe('DIRECT');

    const after = await processed.onHand({
      mmaCode: 'ABS_PROCESSED', supplierId: sup.id, shade: 'WHITE', size: 'LUMPS',
    });
    expect(Number(after)).toBeCloseTo(Number(before) + 12.5, 6);
  });

  it('withdraw (PROCESS): one ledger with linkId, onHand decreases; rejects insufficient', async () => {
    const sup = await seedSupplier();
    // seed
    await processed.deposit({
      toMmaCode: 'PSS_PROCESSED', supplierId: sup.id, shade: 'GREY', size: 'CHIPS', qty: 9,
    });

    const before = await processed.onHand({
      mmaCode: 'PSS_PROCESSED', supplierId: sup.id, shade: 'GREY', size: 'CHIPS',
    });

    const { posting } = await processed.withdraw({
      fromMmaCode: 'PSS_PROCESSED',
      supplierId: sup.id,
      shade: 'GREY',
      size: 'CHIPS',
      qty: 6.4,
      processId: 'PROC-1',
      fromStationCode: 'PSS-ST-01',
      meta: { step: 'consume' },
    });

    expect(posting.mmaCode).toBe('PSS_PROCESSED');
    expect(Number(posting.qtyDelta)).toBeCloseTo(-6.4, 6);
    expect(posting.reason).toBe('PROCESS');
    expect(posting.linkId).toBe('PROC-1');

    const after = await processed.onHand({
      mmaCode: 'PSS_PROCESSED', supplierId: sup.id, shade: 'GREY', size: 'CHIPS',
    });
    expect(Number(after)).toBeCloseTo(Number(before) - 6.4, 6);

    // insufficient check
    await expect(
      processed.withdraw({
        fromMmaCode: 'PSS_PROCESSED',
        supplierId: sup.id,
        shade: 'GREY',
        size: 'CHIPS',
        qty: 999,
        processId: 'PROC-2',
      })
    ).rejects.toThrow(/Insufficient stock/);
  });
});
