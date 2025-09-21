// tests/mma.math.test.js
// Vitest: authoritative stock math over the single-ledger (no DB reset).
// This file focuses on the computed onHand() math across deposit → dispatch → receive → cancel,
// including variance (receiveQty != dispatchQty) and shade change at destination.

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient, BornAs, EdgeStatus } from '@prisma/client';
import { createMMA } from '../src/lib/mma/mma.js';

describe.sequential('MMA Stock Math (authoritative formula)', () => {
  let db;
  let mma;

  const REGISTRY = ['ABS.SLOTS', 'PSS.DUMP', 'PSS.SLOTS', 'KEF.SLOTS'];

  async function seedSupplier(name = 'Math Supplier') {
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

  it('computes onHand correctly across deposit → dispatch → receive (with variance) → cancel', async () => {
    const sup = await seedSupplier();

    // --- Baselines (so we assert deltas, not absolutes)
    const baseAbsLumpsS1 = await mma.onHand({
      mmaCode: 'ABS.SLOTS',
      supplierId: sup.id,
      shade: 's1',
      size: 'LUMPS',
    });
    const basePssDumpLumpsS2 = await mma.onHand({
      mmaCode: 'PSS.DUMP',
      supplierId: sup.id,
      shade: 's2',
      size: 'LUMPS',
    });

    // --- 1) Deposit 100 LUMPS s1 to ABS.SLOTS
    await mma.deposit({
      mmaCode: 'ABS.SLOTS',
      supplierId: sup.id,
      shade: 's1',
      size: 'LUMPS',
      qty: 100,
      meta: { note: 'math-deposit-100' },
    });

    const afterDepositAbs = await mma.onHand({
      mmaCode: 'ABS.SLOTS',
      supplierId: sup.id,
      shade: 's1',
      size: 'LUMPS',
    });
    expect(Number(afterDepositAbs)).toBeCloseTo(Number(baseAbsLumpsS1) + 100, 6);

    // --- 2) Dispatch 60 from ABS.SLOTS → PSS.DUMP (still shade s1)
    const edge = await mma.dispatch({
      fromMmaCode: 'ABS.SLOTS',
      toMmaCode: 'PSS.DUMP',
      supplierId: sup.id,
      shade: 's1',
      size: 'LUMPS',
      qty: 60,
      meta: { truck: 'TR-ABS-060' },
    });

    // Source reduced immediately by planned (60)
    const afterDispatchAbs = await mma.onHand({
      mmaCode: 'ABS.SLOTS',
      supplierId: sup.id,
      shade: 's1',
      size: 'LUMPS',
    });
    expect(Number(afterDispatchAbs)).toBeCloseTo(Number(afterDepositAbs) - 60, 6);

    // --- 3) Receive same row with variance (58) and destination shade change (s2)
    const recv = await mma.receive({
      id: edge.id,
      toMmaCode: 'PSS.DUMP',
      supplierId: sup.id,
      receiveQty: 58,          // variance: 60 dispatched, 58 received
      receiveShade: 's2',      // shade changes at destination
      meta: { receivedBy: 'Ops-1' },
    });
    expect(recv.id).toBe(edge.id);
    expect(recv.status).toBe(EdgeStatus.RECEIVED);
    expect(Number(recv.dispatchQty)).toBeCloseTo(60, 6);
    expect(Number(recv.receiveQty)).toBeCloseTo(58, 6);
    expect(recv.receiveShade).toBe('s2');

    // Destination increased by 58 (under shade s2)
    const afterReceivePss = await mma.onHand({
      mmaCode: 'PSS.DUMP',
      supplierId: sup.id,
      shade: 's2',
      size: 'LUMPS',
    });
    expect(Number(afterReceivePss)).toBeCloseTo(Number(basePssDumpLumpsS2) + 58, 6);

    // Source remains deposit(100) - dispatch(60) = +40 from its pre-test baseline
    const finalAbs = await mma.onHand({
      mmaCode: 'ABS.SLOTS',
      supplierId: sup.id,
      shade: 's1',
      size: 'LUMPS',
    });
    expect(Number(finalAbs)).toBeCloseTo(Number(baseAbsLumpsS1) + 40, 6);

    // --- 4) Extra: dispatch & then cancel should restore deduction
    const beforeCancelAbs = await mma.onHand({
      mmaCode: 'ABS.SLOTS',
      supplierId: sup.id,
      shade: 's1',
      size: 'LUMPS',
    });

    const edge2 = await mma.dispatch({
      fromMmaCode: 'ABS.SLOTS',
      toMmaCode: 'KEF.SLOTS',
      supplierId: sup.id,
      shade: 's1',
      size: 'LUMPS',
      qty: 10,
      meta: { truck: 'TR-ABS-010' },
    });

    // After dispatch: reduced by 10
    const afterEdge2Abs = await mma.onHand({
      mmaCode: 'ABS.SLOTS',
      supplierId: sup.id,
      shade: 's1',
      size: 'LUMPS',
    });
    expect(Number(afterEdge2Abs)).toBeCloseTo(Number(beforeCancelAbs) - 10, 6);

    // Cancel it
    const canceled = await mma.cancel({ id: edge2.id });
    expect(canceled.status).toBe(EdgeStatus.CANCELED);

    // Stock restored
    const afterCancelAbs = await mma.onHand({
      mmaCode: 'ABS.SLOTS',
      supplierId: sup.id,
      shade: 's1',
      size: 'LUMPS',
    });
    expect(Number(afterCancelAbs)).toBeCloseTo(Number(beforeCancelAbs), 6);
  });

  it('lists inbound/outbound correctly for live IN_TRANSIT rows', async () => {
    const sup = await seedSupplier();

    // Ensure source has inventory
    await mma.deposit({
      mmaCode: 'ABS.SLOTS',
      supplierId: sup.id,
      shade: 'ix',
      size: 'CHIPS',
      qty: 3.5,
    });

    const edge = await mma.dispatch({
      fromMmaCode: 'ABS.SLOTS',
      toMmaCode: 'PSS.DUMP',
      supplierId: sup.id,
      shade: 'ix',
      size: 'CHIPS',
      qty: 2.0,
      meta: { truck: 'TR-INB-200' },
    });

    const inbound = await mma.inbound({ mmaCode: 'PSS.DUMP' });
    const outbound = await mma.outbound({ mmaCode: 'ABS.SLOTS' });

    expect(inbound.some(r => r.id === edge.id)).toBe(true);
    expect(outbound.some(r => r.id === edge.id)).toBe(true);

    // Receive it; should disappear from inbound(IN_TRANSIT)
    await mma.receive({ id: edge.id, toMmaCode: 'PSS.DUMP', supplierId: sup.id });

    const inboundAfter = await mma.inbound({ mmaCode: 'PSS.DUMP', status: EdgeStatus.IN_TRANSIT });
    expect(inboundAfter.some(r => r.id === edge.id)).toBe(false);
  });
});
