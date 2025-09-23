// /tests/sorting.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { prisma, processedStock as processed, sortedStock as sorted } from '../src/lib/stocks/index.js';
import sorting from '../src/lib/processes/sorting.js';

async function seedSupplier(name = 'Sort Supplier') {
  return prisma.supplier.create({
    data: { name: `${name} ${Date.now() % 100000}`, code: `SS-${Math.random().toString(36).slice(2, 8).toUpperCase()}` },
  });
}

beforeEach(async () => {
  await prisma.sorting_tbl.deleteMany();
  await prisma.sortedTransport.deleteMany();
  await prisma.sortedLedger.deleteMany();
  await prisma.processedTransport.deleteMany();
  await prisma.processedLedger.deleteMany();
});

describe.sequential('Process — sorting (PROCESSED → SORTED 1→1)', () => {
  it('moves 12t WHITE/LUMPS from PSS_PROCESSED to PSS_SORTED; forwards meta {ht,wastage}; records sorting_tbl', async () => {
    const sup = await seedSupplier('Sort Test Sup');

    // Seed PROCESSED at PSS (not ABS) — 30t WHITE/LUMPS
    await processed.deposit({
      toMmaCode: 'PSS_PROCESSED',
      supplierId: sup.id,
      shade: 'WHITE',
      size: 'LUMPS',
      qty: 30, // tons
      reason: 'DIRECT',
      toStationCode: 'PSS-P1',
      meta: { note: 'seed processed 30t' },
    });

    // On-hand before
    const pBefore = await processed.onHand({
      mmaCode: 'PSS_PROCESSED', supplierId: sup.id, shade: 'WHITE', size: 'LUMPS',
    });
    const sBefore = await sorted.onHand({
      mmaCode: 'PSS_SORTED', supplierId: sup.id, shade: 'WHITE', size: 'LUMPS',
    });

    // Run sorting (12t) PSS_PROCESSED → PSS_SORTED
    const res = await sorting({
      processId: 'SORT-T-001',
      fromMmaCode: 'PSS_PROCESSED',
      toMmaCode: 'PSS_SORTED',
      supplierId: sup.id,
      from: { shade: 'WHITE', size: 'LUMPS', qtyT: 12, stationCode: 'PSS-P1' },
      to:   { shade: 'WHITE', size: 'LUMPS',           stationCode: 'PSS-S1' },
      meta: { ht: 55, wastage: 1, note: 'trial sort 12t' },
    });

    expect(res.status).toBe('SUCCESS');
    expect(res.processId).toBe('SORT-T-001');
    expect(Number(res.qtyT)).toBeCloseTo(12, 6);

    // On-hand after: PROCESSED down 12t; SORTED up 12t
    const pAfter = await processed.onHand({
      mmaCode: 'PSS_PROCESSED', supplierId: sup.id, shade: 'WHITE', size: 'LUMPS',
    });
    const sAfter = await sorted.onHand({
      mmaCode: 'PSS_SORTED', supplierId: sup.id, shade: 'WHITE', size: 'LUMPS',
    });

    expect(Number(pAfter)).toBeCloseTo(Number(pBefore) - 12, 6);
    expect(Number(sAfter)).toBeCloseTo(Number(sBefore) + 12, 6);

    // sorting_tbl row exists with top-level ht & wastage
    const row = await prisma.sorting_tbl.findUnique({ where: { processId: 'SORT-T-001' } });
    expect(row).toBeTruthy();
    expect(row.status).toBe('SUCCESS');
    expect(Number(row.qtyT)).toBeCloseTo(12, 6);
    expect(row.fromMmaCode).toBe('PSS_PROCESSED');
    expect(row.toMmaCode).toBe('PSS_SORTED');
    expect(row.fromShade).toBe('WHITE');
    expect(row.toShade).toBe('WHITE');
    expect(row.fromSize).toBe('LUMPS');
    expect(row.toSize).toBe('LUMPS');
    expect(row.withdrawLedgerId).toBeTruthy();
    expect(row.depositLedgerId).toBeTruthy();
    expect(row.ht).toBe(55);
    expect(Number(row.wastage)).toBeCloseTo(1, 6);
  });
});
