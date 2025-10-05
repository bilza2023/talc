// tests/processes/01.sorting.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { prisma, stock } from '../../src/lib/stocks/stockEngine.js';
import sorting from '../../src/lib/processes/sorting.js';

const FROM_MMA = 'PSS_SCREENED';
const TO_MMA   = 'PSS_SORTED';
const SIZE     = 'LUMPS';
const SHADE    = 'WHITE';
const SEED_RSN = 'ADJUST';

async function seedSupplier(name = 'Sorting Supplier') {
  return prisma.supplier.create({
    data: { name, code: `SRT-${Math.random().toString(36).slice(2, 8).toUpperCase()}` }
  });
}

beforeEach(async () => {
  await prisma.stockTransport.deleteMany();
  await prisma.stockLedger.deleteMany();
  await prisma.sorting_tbl?.deleteMany?.().catch(() => null);
  await prisma.supplier.deleteMany();
});

describe('Sorting (minimal header)', () => {
  it('happy path: move 10t from PSS_SCREENED → PSS_SORTED; header committed; ht & wastage stored; ledger linked', async () => {
    const sup = await seedSupplier();
    const QTY = 10;

    await stock.deposit({
      toMmaCode: FROM_MMA, supplierId: sup.id, shade: SHADE, size: SIZE, qty: QTY, reason: SEED_RSN
    });

    const res = await sorting({
      supplierId: sup.id,
      from: { shade: SHADE, size: SIZE, qtyT: QTY },  // <-- key fix
      ht: 6,
      wastage: 0.25,
      meta: { test: 'happy' }
    });

    expect(res.status).toBe('SUCCESS');

    const headers = await prisma.sorting_tbl.findMany();
    expect(headers.length).toBe(1);
    const header = headers[0];
    expect(header.committedAt).not.toBeNull();
    expect(Number(header.ht)).toBeCloseTo(6, 6);
    expect(Number(header.wastage)).toBeCloseTo(0.25, 6);

    const fromAfter = await stock.onHand({ mmaCode: FROM_MMA, supplierId: sup.id, shade: SHADE, size: SIZE });
    const toAfter   = await stock.onHand({ mmaCode: TO_MMA,   supplierId: sup.id, shade: SHADE, size: SIZE });
    expect(fromAfter).toBeCloseTo(0, 6);
    expect(toAfter).toBeCloseTo(QTY, 6);

    const linkId = String(header.id);
    const rows = await prisma.stockLedger.findMany({ where: { linkId } });
    expect(rows.length).toBe(2);
    const w = rows.filter(r => r.mmaCode === FROM_MMA && Number(r.qtyDelta) < 0);
    const d = rows.filter(r => r.mmaCode === TO_MMA   && Number(r.qtyDelta) > 0);
    expect(w.length).toBe(1);
    expect(d.length).toBe(1);
    expect(Math.abs(Number(d[0].qtyDelta))).toBeCloseTo(Math.abs(Number(w[0].qtyDelta)), 6);
  });

  it('insufficient stock: returns FAILED and makes no header, no ledger mutations', async () => {
    const sup = await seedSupplier();
    const QTY = 10;

    const res = await sorting({
      supplierId: sup.id,
      from: { shade: SHADE, size: SIZE, qtyT: QTY },  // <-- key fix
      ht: 6,
      wastage: 0.25,
      meta: { test: 'insufficient' }
    });

    expect(res.status).toBe('FAILED');
    expect(await prisma.sorting_tbl.count()).toBe(0);

    const from = await stock.onHand({ mmaCode: FROM_MMA, supplierId: sup.id, shade: SHADE, size: SIZE });
    const to   = await stock.onHand({ mmaCode: TO_MMA,   supplierId: sup.id, shade: SHADE, size: SIZE });
    expect(from).toBeCloseTo(0, 6);
    expect(to).toBeCloseTo(0, 6);
  });

  it('bad qty: throws early; source stays seeded; no header', async () => {
    const sup = await seedSupplier();

    await stock.deposit({
      toMmaCode: FROM_MMA, supplierId: sup.id, shade: SHADE, size: SIZE, qty: 5, reason: SEED_RSN
    });

    await expect(
      sorting({
        supplierId: sup.id,
        from: { shade: SHADE, size: SIZE, qtyT: 0 },   // <-- key fix
        ht: 6,
        wastage: 0.1,
        meta: { test: 'bad-qty' }
      })
    ).rejects.toThrow(/qtyT.*> *0/i);

    expect(await prisma.sorting_tbl.count()).toBe(0);
    const fromAfter = await stock.onHand({ mmaCode: FROM_MMA, supplierId: sup.id, shade: SHADE, size: SIZE });
    const toAfter   = await stock.onHand({ mmaCode: TO_MMA,   supplierId: sup.id, shade: SHADE, size: SIZE });
    expect(fromAfter).toBeCloseTo(5, 6);
    expect(toAfter).toBeCloseTo(0, 6);
  });
});
