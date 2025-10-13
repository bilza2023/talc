// tests/stocks/00.deposit-withdraw.test.js
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

async function mkSupplier(code, name) {
  const s = await prisma.supplier.create({ data: { code, name } });
  return s.id;
}

describe('Deposit & Withdraw (engine-aligned)', () => {
  beforeEach(async () => { await resetDb(); });
  afterAll(async () => { await prisma.$disconnect(); });

  it('deposits to RAW (size ANY) then withdraws; onHand and slot agree', async () => {
    const supId = await mkSupplier('S-RAW', 'Supplier RAW');

    // Deposit via purchase.quantity
    await stock.deposit({
      toMmaCode: 'ABS_RAW',
      supplierId: supId,
      shade: 'WHITE',
      size: 'ANY',
      reason: 'PURCHASE',
      purchase: { docDate: new Date(), quantity: 200 }
    });

    // Sanity: onHand & slot after deposit
    const afterDepositOnHand = await stock.onHand({
      mmaCode: 'ABS_RAW', supplierId: supId, shade: 'WHITE', size: 'ANY'
    });
    const afterDepositSlot = await stock.slot({
      mmaCode: 'ABS_RAW', supplierId: supId, shade: 'WHITE', size: 'ANY'
    });
    expect(afterDepositOnHand).toBeCloseTo(200, 6);
    expect(afterDepositSlot.qty).toBeCloseTo(200, 6);

    // Withdraw some quantity (e.g., for a process)
    await stock.withdraw({
      fromMmaCode: 'ABS_RAW',
      supplierId: supId,
      shade: 'WHITE',
      size: 'ANY',
      qty: 47.5,
      processId: 'proc-raw-1'
    });

    const finalOnHand = await stock.onHand({
      mmaCode: 'ABS_RAW', supplierId: supId, shade: 'WHITE', size: 'ANY'
    });
    const finalSlot = await stock.slot({
      mmaCode: 'ABS_RAW', supplierId: supId, shade: 'WHITE', size: 'ANY'
    });

    expect(finalOnHand).toBeCloseTo(152.5, 6);
    expect(finalSlot.qty).toBeCloseTo(152.5, 6);
  });

  it('SCREENED uses real sizes (CHIPS); ANY should not see it', async () => {
    const supId = await mkSupplier('S-SCR', 'Supplier SCR');

    await stock.deposit({
      toMmaCode: 'PSS_SCREENED',
      supplierId: supId,
      shade: 'GREY',
      size: 'CHIPS',
      reason: 'PURCHASE',
      purchase: { docDate: new Date(), quantity: 18.25 }
    });

    const chips = await stock.slot({
      mmaCode: 'PSS_SCREENED', supplierId: supId, shade: 'GREY', size: 'CHIPS'
    });
    const any = await stock.slot({
      mmaCode: 'PSS_SCREENED', supplierId: supId, shade: 'GREY', size: 'ANY'
    });

    expect(chips.qty).toBeCloseTo(18.25, 6);
    expect(any.qty).toBe(0); // different bucket
  });
});
