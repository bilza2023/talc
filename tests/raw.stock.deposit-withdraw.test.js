// tests/raw.stock.deposit-withdraw.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { prisma, rawStock as raw } from '../src/lib/stocks/index.js';

function uniqCode(prefix = 'SUP') {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}
async function seedSupplier(name = 'Raw Supplier') {
  return prisma.supplier.create({
    data: {
      name: `${name} ${Date.now() % 100000}`,
      code: uniqCode('RAW'),
    },
  });
}

beforeEach(async () => {
  // Only clear what this suite uses to avoid cross-suite FK issues
  await prisma.rawTransport.deleteMany();
  await prisma.rawLedger.deleteMany();
});

describe.sequential('Stock(raw) — deposit/withdraw (single-slot)', () => {
  it('deposit (DIRECT): one ledger + onHand increases', async () => {
    const sup = await seedSupplier('Raw Supplier');

    const before = await raw.onHand({
      mmaCode: 'ABS_RAW', supplierId: sup.id, shade: 'WHITE', size: 'LUMPS',
    });

    const { posting } = await raw.deposit({
      toMmaCode: 'ABS_RAW',
      supplierId: sup.id,
      shade: 'WHITE',
      size: 'LUMPS',
      qty: 15.25,
      reason: 'DIRECT',
      toStationCode: 'ABS-ST-R1',
      meta: { note: 'seed raw' },
    });

    expect(posting.mmaCode).toBe('ABS_RAW');
    expect(Number(posting.qtyDelta)).toBeCloseTo(15.25, 6);
    expect(posting.reason).toBe('DIRECT');

    const after = await raw.onHand({
      mmaCode: 'ABS_RAW', supplierId: sup.id, shade: 'WHITE', size: 'LUMPS',
    });
    expect(Number(after)).toBeCloseTo(Number(before) + 15.25, 6);
  });

  it('withdraw (PROCESS): one ledger with linkId, onHand decreases; rejects insufficient', async () => {
    const sup = await seedSupplier('Raw Supplier 2');
    await raw.deposit({
      toMmaCode: 'ABS_RAW', supplierId: sup.id, shade: 'GREY', size: 'CHIPS', qty: 10.2,
    });

    const before = await raw.onHand({
      mmaCode: 'ABS_RAW', supplierId: sup.id, shade: 'GREY', size: 'CHIPS',
    });

    const { posting } = await raw.withdraw({
      fromMmaCode: 'ABS_RAW',
      supplierId: sup.id,
      shade: 'GREY',
      size: 'CHIPS',
      qty: 4.75,
      processId: 'SCREEN-101',
      fromStationCode: 'ABS-ST-R1',
      meta: { step: 'screen-consume' },
    });

    expect(posting.mmaCode).toBe('ABS_RAW');
    expect(Number(posting.qtyDelta)).toBeCloseTo(-4.75, 6);
    expect(posting.reason).toBe('PROCESS');
    expect(posting.linkId).toBe('SCREEN-101');

    const after = await raw.onHand({
      mmaCode: 'ABS_RAW', supplierId: sup.id, shade: 'GREY', size: 'CHIPS',
    });
    expect(Number(after)).toBeCloseTo(Number(before) - 4.75, 6);

    await expect(
      raw.withdraw({
        fromMmaCode: 'ABS_RAW',
        supplierId: sup.id,
        shade: 'GREY',
        size: 'CHIPS',
        qty: 999,
        processId: 'SCREEN-102',
      })
    ).rejects.toThrow(/Insufficient stock/);
  });
});
