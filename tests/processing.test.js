// tests/processing.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { prisma, rawStock as raw, processedStock as processed } from '../src/lib/stocks/index.js';
import processing from '../src/lib/processes/processing.js';

// helpers (same style as your stock tests)
function uniqCode(prefix = 'SUP') {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}
async function seedSupplier(name = 'Proc Supplier') {
  return prisma.supplier.create({
    data: { name: `${name} ${Date.now() % 100000}`, code: uniqCode('PROC') },
  });
}

beforeEach(async () => {
  // keep this suite isolated
  await prisma.process_tbl.deleteMany();
  await prisma.processedTransport.deleteMany();
  await prisma.processedLedger.deleteMany();
  await prisma.rawTransport.deleteMany();
  await prisma.rawLedger.deleteMany();
});

describe.sequential('Process — processing (RAW → PROCESSED one→many)', () => {
  it('splits 30t RAW WHITE/LUMPS into 10t each of PROCESSED WHITE LUMPS/CHIPS/FINE', async () => {
    const sup = await seedSupplier('Proc Test Sup');

    // seed RAW: +30t WHITE/LUMPS at ABS_RAW
    await raw.deposit({
      toMmaCode: 'ABS_RAW',
      supplierId: sup.id,
      shade: 'WHITE',
      size: 'LUMPS',
      qty: 30, // tons
      reason: 'DIRECT',
      toStationCode: 'ABS-ST-R1',
      meta: { note: 'seed raw 30t' },
    });

    // onHand (before)
    const rawBefore = await raw.onHand({
      mmaCode: 'ABS_RAW', supplierId: sup.id, shade: 'WHITE', size: 'LUMPS',
    });
    const pBeforeLumps = await processed.onHand({
      mmaCode: 'ABS_PROCESSED', supplierId: sup.id, shade: 'WHITE', size: 'LUMPS',
    });
    const pBeforeChips = await processed.onHand({
      mmaCode: 'ABS_PROCESSED', supplierId: sup.id, shade: 'WHITE', size: 'CHIPS',
    });
    const pBeforeFine = await processed.onHand({
      mmaCode: 'ABS_PROCESSED', supplierId: sup.id, shade: 'WHITE', size: 'FINE',
    });

    // run the bridge: RAW → PROCESSED (1 → 3)
    const res = await processing({
      processId: 'PROC-T-001',
      fromMmaCode: 'ABS_RAW',
      toMmaCode: 'ABS_PROCESSED',
      supplierId: sup.id,
      from: { shade: 'WHITE', size: 'LUMPS', qtyT: 30, stationCode: 'ABS-ST-R1' },
      targets: [
        { shade: 'WHITE', size: 'LUMPS', qtyT: 10, stationCode: 'ABS-P1' },
        { shade: 'WHITE', size: 'CHIPS', qtyT: 10, stationCode: 'ABS-P1' },
        { shade: 'WHITE', size: 'FINE',  qtyT: 10, stationCode: 'ABS-P1' },
      ],
      meta: { note: 'processing split 30 → 10+10+10' },
    });

    expect(res.status).toBe('SUCCESS');
    expect(res.processId).toBe('PROC-T-001');

    // onHand (after): RAW down by 30t
    const rawAfter = await raw.onHand({
      mmaCode: 'ABS_RAW', supplierId: sup.id, shade: 'WHITE', size: 'LUMPS',
    });
    expect(Number(rawAfter)).toBeCloseTo(Number(rawBefore) - 30, 6);

    // onHand (after): PROCESSED up by 10t each slot
    const pAfterLumps = await processed.onHand({
      mmaCode: 'ABS_PROCESSED', supplierId: sup.id, shade: 'WHITE', size: 'LUMPS',
    });
    const pAfterChips = await processed.onHand({
      mmaCode: 'ABS_PROCESSED', supplierId: sup.id, shade: 'WHITE', size: 'CHIPS',
    });
    const pAfterFine = await processed.onHand({
      mmaCode: 'ABS_PROCESSED', supplierId: sup.id, shade: 'WHITE', size: 'FINE',
    });

    expect(Number(pAfterLumps)).toBeCloseTo(Number(pBeforeLumps) + 10, 6);
    expect(Number(pAfterChips)).toBeCloseTo(Number(pBeforeChips) + 10, 6);
    expect(Number(pAfterFine)).toBeCloseTo(Number(pBeforeFine) + 10, 6);

    // process log exists & totals match
    const log = await prisma.process_tbl.findUnique({ where: { processId: 'PROC-T-001' } });
    expect(log).toBeTruthy();
    expect(log.status).toBe('SUCCESS');
    expect(Number(log.sourceQtyT)).toBeCloseTo(30, 6);
    expect(Number(log.targetsQtyT)).toBeCloseTo(30, 6);
  });
});
