// tests/stocks/00.deposit-withdraw.test.js — unified schema
import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '../../src/lib/stocks/stockEngine.js';
import Stock from '../../src/lib/stock/Stock.js';

const stock = new Stock({
  prisma,
  ledgerDelegate: 'stockLedger',
  transportDelegate: 'stockTransport',
  sizeDefault: 'ANY',
});

const MMA   = 'ABS_SCREENED';
const SHADE = 'WHITE';
const SIZE  = 'ANY';

async function seedSupplier(name = 'Deposit/Withdraw Sup') {
  return prisma.supplier.create({
    data: { name, code: `S-${Math.random().toString(36).slice(2, 8).toUpperCase()}` },
  });
}

beforeEach(async () => {
  // Clear tables in safe order for tests
  await prisma.stockTransport.deleteMany();
  await prisma.stockLedger.deleteMany();
  await prisma.supplier.deleteMany();
});

describe('Stock — deposit & withdraw (ABS_SCREENED)', () => {
  it('deposit increases on-hand; audit matches', async () => {
    const sup = await seedSupplier();

    await stock.deposit({
      toMmaCode: MMA,
      supplierId: sup.id,
      shade: SHADE,
      size: SIZE,
      qty: 10,
    });

    const onHand = await stock.onHand({ mmaCode: MMA, supplierId: sup.id, shade: SHADE, size: SIZE });
    expect(onHand).toBeCloseTo(10, 6);

    const sumLed = await prisma.stockLedger.aggregate({
      _sum: { qtyDelta: true },
      where: { mmaCode: MMA, supplierId: sup.id, shade: SHADE, size: SIZE },
    });
    expect(onHand).toBeCloseTo(Number(sumLed._sum.qtyDelta ?? 0), 6);
  });

  it('withdraw consumes stock and rejects insufficient', async () => {
    const sup = await seedSupplier();

    await stock.deposit({ toMmaCode: MMA, supplierId: sup.id, shade: SHADE, size: SIZE, qty: 2 });

    await stock.withdraw({
      fromMmaCode: MMA,
      supplierId: sup.id,
      shade: SHADE,
      size: SIZE,
      qty: 1,
      processId: 'proc-1',
    });

    const after = await stock.onHand({ mmaCode: MMA, supplierId: sup.id, shade: SHADE, size: SIZE });
    expect(after).toBeCloseTo(1, 6);

    await expect(
      stock.withdraw({ fromMmaCode: MMA, supplierId: sup.id, shade: SHADE, size: SIZE, qty: 2, processId: 'proc-2' })
    ).rejects.toThrow(/Insufficient/);
  });
});
