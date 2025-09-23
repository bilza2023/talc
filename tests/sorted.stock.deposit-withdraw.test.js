
// tests/sorted.stock.deposit-withdraw.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { prisma, resetAll, seedSupplier, sortedStock as sorted } from './testkit/index.js';

beforeEach(async () => {
  await resetAll();
});

describe.sequential('Stock(sorted) — deposit/withdraw (single-slot)', () => {
  it('deposit (DIRECT): one ledger + onHand increases', async () => {
    const sup = await seedSupplier('Sorted Supplier');

    const before = await sorted.onHand({
      mmaCode: 'PSS_SORTED', supplierId: sup.id, shade: 'WHITE', size: 'LUMPS',
    });

    const { posting } = await sorted.deposit({
      toMmaCode: 'PSS_SORTED',
      supplierId: sup.id,
      shade: 'WHITE',
      size: 'LUMPS',
      qty: 8.75,
      reason: 'DIRECT',
      toStationCode: 'PSS-ST-S1',
      meta: { note: 'seed sorted' },
    });

    expect(posting.mmaCode).toBe('PSS_SORTED');
    expect(Number(posting.qtyDelta)).toBeCloseTo(8.75, 6);
    expect(posting.reason).toBe('DIRECT');

    const after = await sorted.onHand({
      mmaCode: 'PSS_SORTED', supplierId: sup.id, shade: 'WHITE', size: 'LUMPS',
    });
    expect(Number(after)).toBeCloseTo(Number(before) + 8.75, 6);
  });

  it('withdraw (PROCESS): one ledger with linkId, onHand decreases; rejects insufficient', async () => {
    const sup = await seedSupplier();
    await sorted.deposit({
      toMmaCode: 'PSS_SORTED', supplierId: sup.id, shade: 'GREY', size: 'CHIPS', qty: 7.2,
    });

    const before = await sorted.onHand({
      mmaCode: 'PSS_SORTED', supplierId: sup.id, shade: 'GREY', size: 'CHIPS',
    });

    const { posting } = await sorted.withdraw({
      fromMmaCode: 'PSS_SORTED',
      supplierId: sup.id,
      shade: 'GREY',
      size: 'CHIPS',
      qty: 4.1,
      processId: 'BLEND-42',
      fromStationCode: 'PSS-ST-S1',
      meta: { step: 'blend-consume' },
    });

    expect(posting.mmaCode).toBe('PSS_SORTED');
    expect(Number(posting.qtyDelta)).toBeCloseTo(-4.1, 6);
    expect(posting.reason).toBe('PROCESS');
    expect(posting.linkId).toBe('BLEND-42');

    const after = await sorted.onHand({
      mmaCode: 'PSS_SORTED', supplierId: sup.id, shade: 'GREY', size: 'CHIPS',
    });
    expect(Number(after)).toBeCloseTo(Number(before) - 4.1, 6);

    await expect(
      sorted.withdraw({
        fromMmaCode: 'PSS_SORTED',
        supplierId: sup.id,
        shade: 'GREY',
        size: 'CHIPS',
        qty: 999,
        processId: 'BLEND-43',
      })
    ).rejects.toThrow(/Insufficient stock/);
  });
});
