// tests/stocks/03.stock.slot.test.js
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import Stock from '../../src/lib/stock/Stock.js';

const prisma = new PrismaClient();
const stock  = new Stock({ prisma });

async function resetDb() {
  // wipe in FK-safe order
  await prisma.stockTransport.deleteMany({});
  await prisma.stockLedger.deleteMany({});
  await prisma.screening_tbl?.deleteMany?.().catch(() => {}); // ignore if not present
  await prisma.sorting_tbl?.deleteMany?.().catch(() => {});   // ignore if not present
  await prisma.supplier.deleteMany({});
}

async function mkSupplier(code = 'SUP', name = 'Supplier') {
  const s = await prisma.supplier.create({
    data: { code, name }
  });
  return s.id;
}

describe('Stock.slot (exact bucket balance)', () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

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

  it('sums multiple ledger posts for the same exact tuple', async () => {
    const supId = await mkSupplier('S1', 'One');

    await stock.deposit({
      toMmaCode: 'ABS_RAW',
      supplierId: supId,
      shade: 'WHITE',
      size: 'ANY',
      qty: 200,
      reason: 'DIRECT'
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

    expect(s.qty).toBe(149);
  });

  it('returns 0 for any key mismatch (supplier/shade/size)', async () => {
    const supA = await mkSupplier('SA', 'A');
    const supB = await mkSupplier('SB', 'B');

    await stock.deposit({
      toMmaCode: 'ABS_RAW',
      supplierId: supA,
      shade: 'WHITE',
      size: 'ANY',
      qty: 75,
      reason: 'DIRECT'
    });

    // Mismatch supplierId
    const s1 = await stock.slot({
      mmaCode: 'ABS_RAW',
      supplierId: supB,
      shade: 'WHITE',
      size: 'ANY'
    });
    expect(s1.qty).toBe(0);

    // Mismatch shade
      // Mismatch shade (must still be a valid enum)
      const s2 = await stock.slot({
        mmaCode: 'ABS_RAW',
        supplierId: supA,
        shade: 'LIGHTGREY',
        size: 'ANY'
      });
    expect(s2.qty).toBe(0);

    // Mismatch size
    const s3 = await stock.slot({
      mmaCode: 'ABS_RAW',
      supplierId: supA,
      shade: 'WHITE',
      size: 'LUMPS'
    });
    expect(s3.qty).toBe(0);
  });

  it('RAW requires size="ANY": querying with "LUMPS" does not see ANY-stock', async () => {
    const supId = await mkSupplier('S2', 'Two');

    await stock.deposit({
      toMmaCode: 'ABS_RAW',
      supplierId: supId,
      shade: 'GREY',
      size: 'ANY',
      qty: 33,
      reason: 'DIRECT'
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
    expect(correct.qty).toBe(33);
  });

  it('matches onHand() for the same exact filter', async () => {
    const supId = await mkSupplier('S3', 'Three');

    await stock.deposit({
      toMmaCode: 'PSS_SCREENED',
      supplierId: supId,
      shade: 'WHITE',
      size: 'CHIPS',
      qty: 10.5,
      reason: 'DIRECT'
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

    expect(s.qty).toBeCloseTo(oh, 10);
  });
});
