import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '../../src/lib/stocks/index.js';
import Stock from '../../src/lib/stock/Stock.js';

const stock = new Stock({
  prisma,
  ledgerModel: 'processedLedger',
  transportModel: 'processedTransport',
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
  await prisma.processedTransport.deleteMany();
  await prisma.processedLedger.deleteMany();
});

describe('Stock — deposit & withdraw (screened via ABS_SCREENED)', () => {
  it('deposit increases on-hand; audit matches', async () => {
    const sup = await seedSupplier();

    await stock.deposit({
      toMmaCode: MMA,
      supplierId: sup.id,
      shade: SHADE,
      size: SIZE,
      qty: 10,
    });

    // Engine read
    const onHand = await stock.onHand({
      mmaCode: MMA,
      supplierId: sup.id,
      shade: SHADE,
      size: SIZE,
    });
    expect(onHand).toBeCloseTo(10, 6);

    // DB-level audit cross-check
    const sumLed = await prisma.processedLedger.aggregate({
      _sum: { qtyDelta: true },
      where: {
        mmaCode: MMA,
        supplierId: sup.id,
        shade: SHADE,
        size: SIZE,
      },
    });
    expect(onHand).toBeCloseTo(Number(sumLed._sum.qtyDelta ?? 0), 6);
  });

  it('withdraw consumes stock and rejects insufficient', async () => {
    const sup = await seedSupplier();

    // Seed 2t
    await stock.deposit({
      toMmaCode: MMA,
      supplierId: sup.id,
      shade: SHADE,
      size: SIZE,
      qty: 2,
    });

    // Withdraw 1t with a processId
    await stock.withdraw({
      fromMmaCode: MMA,
      supplierId: sup.id,
      shade: SHADE,
      size: SIZE,
      qty: 1,
      processId: 'proc-1',
    });

    const after = await stock.onHand({
      mmaCode: MMA,
      supplierId: sup.id,
      shade: SHADE,
      size: SIZE,
    });
    expect(after).toBeCloseTo(1, 6);

    // Now try to over-withdraw → should throw
    await expect(
      stock.withdraw({
        fromMmaCode: MMA,
        supplierId: sup.id,
        shade: SHADE,
        size: SIZE,
        qty: 2,
        processId: 'proc-2',
      })
    ).rejects.toThrow(/Insufficient/);
  });
});
