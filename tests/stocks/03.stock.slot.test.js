// tests/stocks/03.stock.slot.test.js
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { prisma, stock } from '../../src/lib/stocks/stockEngine.js';

// FK-safe reset using the SAME prisma as the engine
async function resetDb() {
  await prisma.stockTransport.deleteMany({});
  await prisma.stockLedger.deleteMany({});
  await prisma.purchase_tbl?.deleteMany?.().catch(() => {});
  await prisma.screening_tbl?.deleteMany?.().catch(() => {});
  await prisma.sorting_tbl?.deleteMany?.().catch(() => {});
  await prisma.supplier.deleteMany({});
}

async function mkSupplier(code = 'SUP', name = 'Supplier') {
  const s = await prisma.supplier.create({ data: { code, name } });
  return s.id;
}

describe('Stock.slot (exact bucket balance)', () => {
  beforeEach(async () => { await resetDb(); });
  afterAll(async () => { await prisma.$disconnect(); });

  it('returns qty=0 when no rows exist for the exact tuple', async () => {
    const supId = await mkSupplier('S0', 'Zero');
    const s = await stock.slot({
      mmaCode: 'ABS_RAW',
      supplierId: supId,
      shade: 'WHITE',
      size: 'ANY'
    });
    expect(s).toEqual({
      mmaCode: 'ABS_RAW',
      supplierId: supId,
      shade: 'WHITE',
      size: 'ANY',
      qty: 0
    });
  });

  it('sums multiple posts for the same exact tuple (deposit → withdraw)', async () => {
    const supId = await mkSupplier('S1', 'One');

    await stock.deposit({
      toMmaCode: 'ABS_RAW',
      supplierId: supId,
      shade: 'WHITE',
      size: 'ANY',
      reason: 'PURCHASE',
      purchase: { docDate: new Date(), quantity: 120 }
    });
    await stock.deposit({
      toMmaCode: 'ABS_RAW',
      supplierId: supId,
      shade: 'WHITE',
      size: 'ANY',
      reason: 'PURCHASE',
      purchase: { docDate: new Date(), quantity: 80 }
    });

    await stock.withdraw({
      fromMmaCode: 'ABS_RAW',
      supplierId: supId,
      shade: 'WHITE',
      size: 'ANY',
      qty: 51,
      processId: 'proc-1'
    });

    const s = await stock.slot({
      mmaCode: 'ABS_RAW',
      supplierId: supId,
      shade: 'WHITE',
      size: 'ANY'
    });

    expect(s.qty).toBeCloseTo(149, 6); // 120 + 80 - 51
  });

  it('returns 0 for any key mismatch (supplier/shade/size)', async () => {
    const supA = await mkSupplier('SA', 'A');
    const supB = await mkSupplier('SB', 'B');

    await stock.deposit({
      toMmaCode: 'ABS_RAW',
      supplierId: supA,
      shade: 'WHITE',
      size: 'ANY',
      reason: 'PURCHASE',
      purchase: { docDate: new Date(), quantity: 75 }
    });

    const mismatchSupplier = await stock.slot({
      mmaCode: 'ABS_RAW',
      supplierId: supB,
      shade: 'WHITE',
      size: 'ANY'
    });
    const mismatchShade = await stock.slot({
      mmaCode: 'ABS_RAW',
      supplierId: supA,
      shade: 'LIGHTGREY',
      size: 'ANY'
    });
    const mismatchSize = await stock.slot({
      mmaCode: 'ABS_RAW',
      supplierId: supA,
      shade: 'WHITE',
      size: 'LUMPS'
    });

    expect(mismatchSupplier.qty).toBe(0);
    expect(mismatchShade.qty).toBe(0);
    expect(mismatchSize.qty).toBe(0);
  });

  it('RAW requires size="ANY": "LUMPS" does not see ANY-stock', async () => {
    const supId = await mkSupplier('S2', 'Two');

    await stock.deposit({
      toMmaCode: 'ABS_RAW',
      supplierId: supId,
      shade: 'GREY',
      size: 'ANY',
      reason: 'PURCHASE',
      purchase: { docDate: new Date(), quantity: 33 }
    });

    const wrong = await stock.slot({
      mmaCode: 'ABS_RAW',
      supplierId: supId,
      shade: 'GREY',
      size: 'LUMPS'
    });
    const correct = await stock.slot({
      mmaCode: 'ABS_RAW',
      supplierId: supId,
      shade: 'GREY',
      size: 'ANY'
    });

    expect(wrong.qty).toBe(0);
    expect(correct.qty).toBeCloseTo(33, 6);
  });

  it('matches onHand() for the same exact filter', async () => {
    const supId = await mkSupplier('S3', 'Three');

    await stock.deposit({
      toMmaCode: 'PSS_SCREENED',
      supplierId: supId,
      shade: 'WHITE',
      size: 'CHIPS',
      reason: 'PURCHASE',
      purchase: { docDate: new Date(), quantity: 10.5 }
    });

    const s = await stock.slot({
      mmaCode: 'PSS_SCREENED',
      supplierId: supId,
      shade: 'WHITE',
      size: 'CHIPS'
    });
    const oh = await stock.onHand({
      mmaCode: 'PSS_SCREENED',
      supplierId: supId,
      shade: 'WHITE',
      size: 'CHIPS'
    });

    expect(s.qty).toBeCloseTo(oh, 6);
  });
});
