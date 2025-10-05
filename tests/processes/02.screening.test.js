// tests/processes/02.screening.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { prisma, stock } from '../../src/lib/stocks/stockEngine.js';
import screening from '../../src/lib/processes/screening.js';

const FROM_MMA = 'ABS_RAW';
const TO_MMA   = 'ABS_SCREENED';
const RAW_SIZE = 'ANY';
const SHADE    = 'WHITE';
const REASON_SEED = 'ADJUST';

async function seedSupplier(name = 'Screening Supplier') {
  return prisma.supplier.create({
    data: { name, code: `SCR-${Math.random().toString(36).slice(2, 8).toUpperCase()}` },
  });
}

beforeEach(async () => {
  await prisma.stockTransport.deleteMany();
  await prisma.stockLedger.deleteMany();
  await prisma.screening_tbl.deleteMany();
  await prisma.supplier.deleteMany();          // <-- removed process_tbl line
});

describe('Screening (minimal header)', () => {
  it('happy path: RAW -10 → SCREENED +2/+5/+3; header committed; ledger linked by header.id', async () => {
    const sup = await seedSupplier();

    const PLAN  = { LUMPS: 2, CHIPS: 5, FINE: 3 };
    const TOTAL = Object.values(PLAN).reduce((a, b) => a + b, 0);

    await stock.deposit({
      toMmaCode: FROM_MMA, supplierId: sup.id, shade: SHADE, size: RAW_SIZE, qty: TOTAL, reason: REASON_SEED,
    });

    const res = await screening({
      supplierId: sup.id,
      from: { shade: SHADE, qtyT: TOTAL },
      targets: Object.entries(PLAN).map(([size, qtyT]) => ({ shade: SHADE, size, qtyT })),
      meta: { test: 'happy' },
    });

    expect(res.status).toBe('SUCCESS');

    const headers = await prisma.screening_tbl.findMany();
    expect(headers.length).toBe(1);
    const header = headers[0];
    expect(Number(header.qtyT)).toBe(TOTAL);
    expect(header.committedAt).not.toBeNull();

    const rawAfter = await stock.onHand({ mmaCode: FROM_MMA, supplierId: sup.id, shade: SHADE, size: RAW_SIZE });
    expect(rawAfter).toBeCloseTo(0, 6);
    for (const [size, qty] of Object.entries(PLAN)) {
      const v = await stock.onHand({ mmaCode: TO_MMA, supplierId: sup.id, shade: SHADE, size });
      expect(v).toBeCloseTo(qty, 6);
    }

    const rows = await prisma.stockLedger.findMany({ where: { linkId: String(header.id) } });
    expect(rows.length).toBe(4);
    const w = rows.filter(r => r.mmaCode === FROM_MMA && Number(r.qtyDelta) < 0);
    const d = rows.filter(r => r.mmaCode === TO_MMA   && Number(r.qtyDelta) > 0);
    expect(w.length).toBe(1);
    expect(d.length).toBe(3);
  });

  it('insufficient stock: fails with no header and no ledger mutations', async () => {
    const sup = await seedSupplier();

    const PLAN  = { LUMPS: 2, CHIPS: 5, FINE: 3 };
    const TOTAL = Object.values(PLAN).reduce((a, b) => a + b, 0);

    const res = await screening({
      supplierId: sup.id,
      from: { shade: SHADE, qtyT: TOTAL },
      targets: Object.entries(PLAN).map(([size, qtyT]) => ({ shade: SHADE, size, qtyT })),
      meta: { test: 'insufficient' },
    });

    expect(res.status).toBe('FAILED');
    expect(await prisma.screening_tbl.count()).toBe(0);

    const raw = await stock.onHand({ mmaCode: FROM_MMA, supplierId: sup.id, shade: SHADE, size: RAW_SIZE });
    const l  = await stock.onHand({ mmaCode: TO_MMA, supplierId: sup.id, shade: SHADE, size: 'LUMPS' });
    const c  = await stock.onHand({ mmaCode: TO_MMA, supplierId: sup.id, shade: SHADE, size: 'CHIPS' });
    const f  = await stock.onHand({ mmaCode: TO_MMA, supplierId: sup.id, shade: SHADE, size: 'FINE' });
    expect(raw).toBeCloseTo(0, 6);
    expect(l).toBeCloseTo(0, 6);
    expect(c).toBeCloseTo(0, 6);
    expect(f).toBeCloseTo(0, 6);
  });

  it('split mismatch: throws early; RAW stays seeded; no header', async () => {
    const sup = await seedSupplier();
    const TOTAL = 10;
    const BAD   = { LUMPS: 2, CHIPS: 5, FINE: 2 }; // sums to 9

    await stock.deposit({
      toMmaCode: FROM_MMA, supplierId: sup.id, shade: SHADE, size: RAW_SIZE, qty: TOTAL, reason: REASON_SEED,
    });

    await expect(
      screening({
        supplierId: sup.id,
        from: { shade: SHADE, qtyT: TOTAL },
        targets: Object.entries(BAD).map(([size, qtyT]) => ({ shade: SHADE, size, qtyT })),
        meta: { test: 'mismatch' },
      })
    ).rejects.toThrow(/targets sum/i);

    const raw = await stock.onHand({ mmaCode: FROM_MMA, supplierId: sup.id, shade: SHADE, size: RAW_SIZE });
    const l  = await stock.onHand({ mmaCode: TO_MMA, supplierId: sup.id, shade: SHADE, size: 'LUMPS' });
    const c  = await stock.onHand({ mmaCode: TO_MMA, supplierId: sup.id, shade: SHADE, size: 'CHIPS' });
    const f  = await stock.onHand({ mmaCode: TO_MMA, supplierId: sup.id, shade: SHADE, size: 'FINE' });
    expect(raw).toBeCloseTo(TOTAL, 6);
    expect(l).toBeCloseTo(0, 6);
    expect(c).toBeCloseTo(0, 6);
    expect(f).toBeCloseTo(0, 6);
    expect(await prisma.screening_tbl.count()).toBe(0);
  });
});
