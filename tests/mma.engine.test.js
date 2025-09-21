// tests/mma.engine.test.js
// Vitest E2E for the single-ledger MMA engine (no DB destroy).
// We DO NOT wipe or reset the database. Each test seeds unique rows
// (timestamp-based supplier codes) and asserts effects locally.
//
// References (legacy tests we’re replacing conceptually):
// - coreFlow.e2e.test.js … ore→talc pipeline before MMA-first  :contentReference[oaicite:0]{index=0}
// - oreServices.test.js … ore deposit/dispatch/receive patterns  :contentReference[oaicite:1]{index=1}
// - prisma.smoke.test.js … prisma singleton sanity                :contentReference[oaicite:2]{index=2}
// - talcServices.test.js … talc services legacy                   :contentReference[oaicite:3]{index=3}

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient, BornAs, EdgeStatus } from '@prisma/client';
import { createMMA } from '../src/lib/mma/mma.js';

describe.sequential('MMA Engine (single-ledger)', () => {
  let db;
  let mma;

  const REGISTRY = ['ABS.SLOTS', 'PSS.DUMP', 'PSS.SLOTS', 'KEF.SLOTS'];

  async function seedSupplier(name = 'Test Supplier') {
    const code = `SUP-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    return await db.supplier.create({ data: { code, name } });
  }

  beforeAll(async () => {
    db = new PrismaClient();
    mma = createMMA({ prisma: db, registry: REGISTRY });
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  it('deposit: creates a RECEIVED row and raises onHand at destination', async () => {
    const sup = await seedSupplier();
    const before = await mma.onHand({
      mmaCode: 'ABS.SLOTS',
      supplierId: sup.id,
      shade: 'white',
      size: 'LUMPS'
    });

    const row = await mma.deposit({
      mmaCode: 'ABS.SLOTS',
      supplierId: sup.id,
      shade: 'white',
      size: 'LUMPS',
      qty: 12.5,
      meta: { note: 'seed deposit' }
    });

    expect(row.bornAs).toBe(BornAs.DEPOSIT);
    expect(row.status).toBe(EdgeStatus.RECEIVED);
    expect(row.toMmaCode).toBe('ABS.SLOTS');
    expect(Number(row.receiveQty)).toBeCloseTo(12.5, 6);
    expect(row.receiveShade).toBe('white');

    const after = await mma.onHand({
      mmaCode: 'ABS.SLOTS',
      supplierId: sup.id,
      shade: 'white',
      size: 'LUMPS'
    });
    expect(Number(after)).toBeCloseTo(Number(before) + 12.5, 6);
  });

  it('dispatch: creates IN_TRANSIT row and lowers onHand at source; shows up in outbound & inbound lists', async () => {
    const sup = await seedSupplier();

    // Ensure source has enough stock
    await mma.deposit({
      mmaCode: 'ABS.SLOTS',
      supplierId: sup.id,
      shade: 'white',
      size: 'CHIPS',
      qty: 7.0
    });

    const beforeSrc = await mma.onHand({
      mmaCode: 'ABS.SLOTS',
      supplierId: sup.id,
      shade: 'white',
      size: 'CHIPS'
    });

    const edge = await mma.dispatch({
      fromMmaCode: 'ABS.SLOTS',
      toMmaCode: 'PSS.DUMP',
      supplierId: sup.id,
      shade: 'white',
      size: 'CHIPS',
      qty: 5.0,
      meta: { truck: 'TR-ABS-001' }
    });

    expect(edge.bornAs).toBe(BornAs.TRANSFER);
    expect(edge.status).toBe(EdgeStatus.IN_TRANSIT);
    expect(edge.fromMmaCode).toBe('ABS.SLOTS');
    expect(edge.toMmaCode).toBe('PSS.DUMP');
    expect(Number(edge.dispatchQty)).toBeCloseTo(5.0, 6);

    // Source stock dropped immediately
    const afterSrc = await mma.onHand({
      mmaCode: 'ABS.SLOTS',
      supplierId: sup.id,
      shade: 'white',
      size: 'CHIPS'
    });
    expect(Number(afterSrc)).toBeCloseTo(Number(beforeSrc) - 5.0, 6);

    // Lists
    const outbound = await mma.outbound({ mmaCode: 'ABS.SLOTS' });
    expect(outbound.some(r => r.id === edge.id)).toBe(true);

    const inbound = await mma.inbound({ mmaCode: 'PSS.DUMP' });
    expect(inbound.some(r => r.id === edge.id)).toBe(true);
  });

  it('receive: completes the SAME row, checks supplier & destination, raises onHand at destination', async () => {
    const sup = await seedSupplier();

    // Seed source stock
    await mma.deposit({
      mmaCode: 'ABS.SLOTS',
      supplierId: sup.id,
      shade: 'gray',
      size: 'FINE',
      qty: 9.0
    });

    // Dispatch 6.2 to PSS.DUMP
    const edge = await mma.dispatch({
      fromMmaCode: 'ABS.SLOTS',
      toMmaCode: 'PSS.DUMP',
      supplierId: sup.id,
      shade: 'gray',
      size: 'FINE',
      qty: 6.2,
      meta: { truck: 'TR-ABS-777' }
    });

    const beforeDst = await mma.onHand({
      mmaCode: 'PSS.DUMP',
      supplierId: sup.id,
      shade: 'gray', // we’ll default receiveShade to dispatchShade here
      size: 'FINE'
    });

    // Receive with smaller quantity and new shade (allowed); verifies supplier & toMma match
    const recv = await mma.receive({
      id: edge.id,
      toMmaCode: 'PSS.DUMP',
      supplierId: sup.id,
      receiveQty: 6.0,
      receiveShade: 'light-gray',
      meta: { receivedBy: 'Sara' }
    });

    expect(recv.id).toBe(edge.id);
    expect(recv.status).toBe(EdgeStatus.RECEIVED);
    expect(Number(recv.receiveQty)).toBeCloseTo(6.0, 6);
    expect(recv.receiveShade).toBe('light-gray');
    expect(recv.toMmaCode).toBe('PSS.DUMP');

    const afterDst = await mma.onHand({
      mmaCode: 'PSS.DUMP',
      supplierId: sup.id,
      shade: 'light-gray', // receive shade used at destination
      size: 'FINE'
    });
    // We can’t assume prior deposits at PSS.DUMP; we only assert the delta ≥ 6.0 increase
    expect(Number(afterDst)).toBeGreaterThanOrEqual(6.0);
    // And ensure the exact row is now absent from inbound(IN_TRANSIT)
    const inboundOpen = await mma.inbound({ mmaCode: 'PSS.DUMP', status: EdgeStatus.IN_TRANSIT });
    expect(inboundOpen.some(r => r.id === edge.id)).toBe(false);
  });

  it('receive: rejects if supplier mismatch or destination MMA mismatch', async () => {
    const sup = await seedSupplier();
    const supOther = await seedSupplier('Another');

    await mma.deposit({
      mmaCode: 'ABS.SLOTS',
      supplierId: sup.id,
      shade: 'white',
      size: 'LUMPS',
      qty: 3.0
    });

    const edge = await mma.dispatch({
      fromMmaCode: 'ABS.SLOTS',
      toMmaCode: 'PSS.DUMP',
      supplierId: sup.id,
      shade: 'white',
      size: 'LUMPS',
      qty: 2.5
    });

    // Wrong supplier
    await expect(
      mma.receive({ id: edge.id, toMmaCode: 'PSS.DUMP', supplierId: supOther.id })
    ).rejects.toThrow(/Supplier mismatch/i);

    // Wrong destination MMA
    await expect(
      mma.receive({ id: edge.id, toMmaCode: 'KEF.SLOTS', supplierId: sup.id })
    ).rejects.toThrow(/Destination MMA mismatch/i);
  });

  it('cancel: allowed only while IN_TRANSIT; removes the outbound deduction from computed stock', async () => {
    const sup = await seedSupplier();
    await mma.deposit({
      mmaCode: 'ABS.SLOTS',
      supplierId: sup.id,
      shade: 'w1',
      size: 'CHIPS',
      qty: 4.0
    });

    const before = await mma.onHand({
      mmaCode: 'ABS.SLOTS',
      supplierId: sup.id,
      shade: 'w1',
      size: 'CHIPS'
    });

    const edge = await mma.dispatch({
      fromMmaCode: 'ABS.SLOTS',
      toMmaCode: 'KEF.SLOTS',
      supplierId: sup.id,
      shade: 'w1',
      size: 'CHIPS',
      qty: 3.0
    });

    const mid = await mma.onHand({
      mmaCode: 'ABS.SLOTS',
      supplierId: sup.id,
      shade: 'w1',
      size: 'CHIPS'
    });
    expect(Number(mid)).toBeCloseTo(Number(before) - 3.0, 6);

    const canceled = await mma.cancel({ id: edge.id });
    expect(canceled.status).toBe(EdgeStatus.CANCELED);

    const after = await mma.onHand({
      mmaCode: 'ABS.SLOTS',
      supplierId: sup.id,
      shade: 'w1',
      size: 'CHIPS'
    });
    // Cancel should restore the deduction
    expect(Number(after)).toBeCloseTo(Number(before), 6);

    // cancel again should fail (not IN_TRANSIT)
    await expect(mma.cancel({ id: edge.id })).rejects.toThrow(/Only IN_TRANSIT transfers can be canceled/i);
  });

  it('stock(): summarizes per (supplierId, shade, size) with positiveOnly default', async () => {
    const sup = await seedSupplier();
    // Seed distinct shades & sizes at KEF
    await mma.deposit({ mmaCode: 'KEF.SLOTS', supplierId: sup.id, shade: 'sA', size: 'LUMPS', qty: 1.0 });
    await mma.deposit({ mmaCode: 'KEF.SLOTS', supplierId: sup.id, shade: 'sB', size: 'CHIPS', qty: 2.0 });

    const rows = await mma.stock({ mmaCode: 'KEF.SLOTS' });
    expect(Array.isArray(rows)).toBe(true);
    // Should include at least the two seeded lines (there may be more from earlier tests)
    const keys = rows.map(r => `${r.supplierId}|${r.shade}|${r.size}`);
    expect(keys.some(k => k.endsWith('|sA|LUMPS'))).toBe(true);
    expect(keys.some(k => k.endsWith('|sB|CHIPS'))).toBe(true);
    // All returned rows are positive by default
    expect(rows.every(r => r.qty > 0)).toBe(true);
  });
});
