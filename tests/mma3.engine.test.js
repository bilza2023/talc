
// Vitest E2E for the MMA3S (SSS) ledger engine (no DB destroy).
// Each test seeds unique rows (timestamp-based supplier codes) and asserts locally.

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient, BornAs, EdgeStatus } from '@prisma/client';
import { createMMA3S } from '../src/lib/mma/mma3s.js';

describe.sequential('MMA3S Engine (single-ledger SSS)', () => {
  let db;
  let mma3;

  // Keep 3S codes distinct so it's obvious these are pre-screen piles.
  const REGISTRY_3S = ['JSS.RAW', 'PSS.RAW', 'YRD.RAW'];

  async function seedSupplier(name = 'Test Supplier 3S') {
    const code = `SUP3S-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    return await db.supplier.create({ data: { code, name } });
  }

  beforeAll(async () => {
    db = new PrismaClient();
    mma3 = createMMA3S({ prisma: db, registry: REGISTRY_3S });
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  it('deposit: creates a RECEIVED row and raises onHand at destination', async () => {
    const sup = await seedSupplier();
    const before = await mma3.onHand({
      mmaCode: 'JSS.RAW',
      supplierId: sup.id,
      shade: 'white',
    });

    const row = await mma3.deposit({
      mmaCode: 'JSS.RAW',
      supplierId: sup.id,
      shade: 'white',
      qty: 12.5,
      meta: { note: 'seed deposit 3s' },
    });

    expect(row.bornAs).toBe(BornAs.DEPOSIT);
    expect(row.status).toBe(EdgeStatus.RECEIVED);
    expect(row.toMmaCode).toBe('JSS.RAW');
    expect(Number(row.receiveQty)).toBeCloseTo(12.5, 6);
    expect(row.receiveShade).toBe('white');

    const after = await mma3.onHand({
      mmaCode: 'JSS.RAW',
      supplierId: sup.id,
      shade: 'white',
    });
    expect(Number(after)).toBeCloseTo(Number(before) + 12.5, 6);
  });

  it('dispatch: creates IN_TRANSIT row, lowers onHand at source; appears in outbound & inbound', async () => {
    const sup = await seedSupplier();

    // Ensure source has enough stock
    await mma3.deposit({
      mmaCode: 'JSS.RAW',
      supplierId: sup.id,
      shade: 'white',
      qty: 7.0,
    });

    const beforeSrc = await mma3.onHand({
      mmaCode: 'JSS.RAW',
      supplierId: sup.id,
      shade: 'white',
    });

    const edge = await mma3.dispatch({
      fromMmaCode: 'JSS.RAW',
      toMmaCode: 'PSS.RAW',
      supplierId: sup.id,
      shade: 'white',
      qty: 5.0,
      meta: { truck: 'TR-3S-001' },
    });

    expect(edge.bornAs).toBe(BornAs.TRANSFER);
    expect(edge.status).toBe(EdgeStatus.IN_TRANSIT);
    expect(edge.fromMmaCode).toBe('JSS.RAW');
    expect(edge.toMmaCode).toBe('PSS.RAW');
    expect(Number(edge.dispatchQty)).toBeCloseTo(5.0, 6);

    const afterSrc = await mma3.onHand({
      mmaCode: 'JSS.RAW',
      supplierId: sup.id,
      shade: 'white',
    });
    expect(Number(afterSrc)).toBeCloseTo(Number(beforeSrc) - 5.0, 6);

    // Lists
    const outbound = await mma3.outbound({ mmaCode: 'JSS.RAW' });
    expect(outbound.some(r => r.id === edge.id)).toBe(true);

    const inbound = await mma3.inbound({ mmaCode: 'PSS.RAW' });
    expect(inbound.some(r => r.id === edge.id)).toBe(true);
  });

  it('receive: completes same row, checks supplier & destination, raises onHand at destination', async () => {
    const sup = await seedSupplier();

    await mma3.deposit({
      mmaCode: 'JSS.RAW',
      supplierId: sup.id,
      shade: 'gray',
      qty: 9.0,
    });

    const edge = await mma3.dispatch({
      fromMmaCode: 'JSS.RAW',
      toMmaCode: 'PSS.RAW',
      supplierId: sup.id,
      shade: 'gray',
      qty: 6.2,
      meta: { truck: 'TR-3S-777' },
    });

    const beforeDst = await mma3.onHand({
      mmaCode: 'PSS.RAW',
      supplierId: sup.id,
      shade: 'gray',
    });

    // Receive with variance + new shade (allowed)
    const recv = await mma3.receive({
      id: edge.id,
      toMmaCode: 'PSS.RAW',
      supplierId: sup.id,
      receiveQty: 6.0,
      receiveShade: 'light-gray',
      meta: { receivedBy: 'Sara3S' },
    });

    expect(recv.id).toBe(edge.id);
    expect(recv.status).toBe(EdgeStatus.RECEIVED);
    expect(Number(recv.receiveQty)).toBeCloseTo(6.0, 6);
    expect(recv.receiveShade).toBe('light-gray');

    const afterDst = await mma3.onHand({
      mmaCode: 'PSS.RAW',
      supplierId: sup.id,
      shade: 'light-gray',
    });
    expect(Number(afterDst)).toBeGreaterThanOrEqual(6.0);

    const inboundOpen = await mma3.inbound({ mmaCode: 'PSS.RAW', status: EdgeStatus.IN_TRANSIT });
    expect(inboundOpen.some(r => r.id === edge.id)).toBe(false);
  });

  it('receive: rejects if supplier mismatch or destination MMA mismatch', async () => {
    const sup = await seedSupplier();
    const supOther = await seedSupplier('Another 3S');

    await mma3.deposit({
      mmaCode: 'JSS.RAW',
      supplierId: sup.id,
      shade: 'white',
      qty: 3.0,
    });

    const edge = await mma3.dispatch({
      fromMmaCode: 'JSS.RAW',
      toMmaCode: 'PSS.RAW',
      supplierId: sup.id,
      shade: 'white',
      qty: 2.5,
    });

    await expect(
      mma3.receive({ id: edge.id, toMmaCode: 'PSS.RAW', supplierId: supOther.id })
    ).rejects.toThrow(/Supplier mismatch/i);

    await expect(
      mma3.receive({ id: edge.id, toMmaCode: 'YRD.RAW', supplierId: sup.id })
    ).rejects.toThrow(/Destination MMA mismatch/i);
  });

  it('cancel: only while IN_TRANSIT; cancels restores deduction', async () => {
    const sup = await seedSupplier();
    await mma3.deposit({
      mmaCode: 'JSS.RAW',
      supplierId: sup.id,
      shade: 'w1',
      qty: 4.0,
    });

    const before = await mma3.onHand({
      mmaCode: 'JSS.RAW',
      supplierId: sup.id,
      shade: 'w1',
    });

    const edge = await mma3.dispatch({
      fromMmaCode: 'JSS.RAW',
      toMmaCode: 'YRD.RAW',
      supplierId: sup.id,
      shade: 'w1',
      qty: 3.0,
    });

    const mid = await mma3.onHand({
      mmaCode: 'JSS.RAW',
      supplierId: sup.id,
      shade: 'w1',
    });
    expect(Number(mid)).toBeCloseTo(Number(before) - 3.0, 6);

    const canceled = await mma3.cancel({ id: edge.id });
    expect(canceled.status).toBe(EdgeStatus.CANCELED);

    const after = await mma3.onHand({
      mmaCode: 'JSS.RAW',
      supplierId: sup.id,
      shade: 'w1',
    });
    expect(Number(after)).toBeCloseTo(Number(before), 6);

    await expect(mma3.cancel({ id: edge.id })).rejects.toThrow(/Only IN_TRANSIT transfers can be canceled/i);
  });

  it('stock(): summarizes per (supplierId, shade) with positiveOnly default', async () => {
    const sup = await seedSupplier();
    await mma3.deposit({ mmaCode: 'YRD.RAW', supplierId: sup.id, shade: 'sA', qty: 1.0 });
    await mma3.deposit({ mmaCode: 'YRD.RAW', supplierId: sup.id, shade: 'sB', qty: 2.0 });

    const rows = await mma3.stock({ mmaCode: 'YRD.RAW' });
    expect(Array.isArray(rows)).toBe(true);

    const keys = rows.map(r => `${r.supplierId}|${r.shade}`);
    expect(keys.some(k => k.endsWith('|sA'))).toBe(true);
    expect(keys.some(k => k.endsWith('|sB'))).toBe(true);
    expect(rows.every(r => r.qty > 0)).toBe(true);
  });
});
