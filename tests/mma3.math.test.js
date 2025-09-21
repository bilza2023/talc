// Vitest: authoritative stock math for MMA3S (no DB reset).
// Focus: onHand() across deposit → dispatch → receive (variance) → cancel.

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient, EdgeStatus } from '@prisma/client';
import { createMMA3S } from '../src/lib/mma/mma3s.js';

describe.sequential('MMA3S Stock Math (authoritative formula)', () => {
  let db, mma3;
  const REGISTRY_3S = ['JSS.RAW', 'PSS.RAW', 'YRD.RAW'];

  const seedSupplier = async (name='Math Supplier 3S') => {
    const code = `SUP3S-${Date.now()}-${Math.random().toString(36).slice(2,6)}`;
    return db.supplier.create({ data: { code, name }});
  };

  beforeAll(async () => {
    db = new PrismaClient();
    mma3 = createMMA3S({ prisma: db, registry: REGISTRY_3S });
  });

  afterAll(async () => { await db.$disconnect(); });

  it('deposit → dispatch → receive variance → cancel math holds (3S)', async () => {
    const sup = await seedSupplier();

    // Baselines
    const baseJSS = await mma3.onHand({ mmaCode:'JSS.RAW', supplierId:sup.id, shade:'s1' });
    const basePSS = await mma3.onHand({ mmaCode:'PSS.RAW', supplierId:sup.id, shade:'s2' });

    // 1) Deposit 100 s1 to JSS.RAW
    await mma3.deposit({ mmaCode:'JSS.RAW', supplierId:sup.id, shade:'s1', qty:100, meta:{ note:'3s-deposit-100' }});
    const afterDepositJSS = await mma3.onHand({ mmaCode:'JSS.RAW', supplierId:sup.id, shade:'s1' });
    expect(Number(afterDepositJSS)).toBeCloseTo(Number(baseJSS) + 100, 6);

    // 2) Dispatch 60 JSS.RAW → PSS.RAW
    const edge = await mma3.dispatch({
      fromMmaCode:'JSS.RAW',
      toMmaCode:'PSS.RAW',
      supplierId:sup.id,
      shade:'s1',
      qty:60,
      meta:{ truck:'TR-3S-060' },
    });
    const afterDispatchJSS = await mma3.onHand({ mmaCode:'JSS.RAW', supplierId:sup.id, shade:'s1' });
    expect(Number(afterDispatchJSS)).toBeCloseTo(Number(afterDepositJSS) - 60, 6);

    // 3) Receive with variance 58 and shade change to s2
    const recv = await mma3.receive({
      id:edge.id,
      toMmaCode:'PSS.RAW',
      supplierId:sup.id,
      receiveQty:58,
      receiveShade:'s2',
      meta:{ receivedBy:'Ops-3S-1' },
    });
    expect(recv.id).toBe(edge.id);
    expect(recv.status).toBe(EdgeStatus.RECEIVED);
    expect(Number(recv.dispatchQty)).toBeCloseTo(60, 6);
    expect(Number(recv.receiveQty)).toBeCloseTo(58, 6);
    expect(recv.receiveShade).toBe('s2');

    const afterReceivePSS = await mma3.onHand({ mmaCode:'PSS.RAW', supplierId:sup.id, shade:'s2' });
    expect(Number(afterReceivePSS)).toBeCloseTo(Number(basePSS) + 58, 6);

    const finalJSS = await mma3.onHand({ mmaCode:'JSS.RAW', supplierId:sup.id, shade:'s1' });
    expect(Number(finalJSS)).toBeCloseTo(Number(baseJSS) + 40, 6);

    // 4) Extra: dispatch then cancel restores deduction
    const beforeCancelJSS = await mma3.onHand({ mmaCode:'JSS.RAW', supplierId:sup.id, shade:'s1' });
    const edge2 = await mma3.dispatch({
      fromMmaCode:'JSS.RAW',
      toMmaCode:'YRD.RAW',
      supplierId:sup.id,
      shade:'s1',
      qty:10,
      meta:{ truck:'TR-3S-010' },
    });
    const afterEdge2JSS = await mma3.onHand({ mmaCode:'JSS.RAW', supplierId:sup.id, shade:'s1' });
    expect(Number(afterEdge2JSS)).toBeCloseTo(Number(beforeCancelJSS) - 10, 6);

    const canceled = await mma3.cancel({ id: edge2.id });
    expect(canceled.status).toBe(EdgeStatus.CANCELED);

    const afterCancelJSS = await mma3.onHand({ mmaCode:'JSS.RAW', supplierId:sup.id, shade:'s1' });
    expect(Number(afterCancelJSS)).toBeCloseTo(Number(beforeCancelJSS), 6);
  });

  it('lists inbound/outbound correctly for live IN_TRANSIT rows (3S)', async () => {
    const sup = await seedSupplier();

    await mma3.deposit({
      mmaCode:'JSS.RAW',
      supplierId:sup.id,
      shade:'ix',
      qty:3.5,
    });

    const edge = await mma3.dispatch({
      fromMmaCode:'JSS.RAW',
      toMmaCode:'PSS.RAW',
      supplierId:sup.id,
      shade:'ix',
      qty:2.0,
      meta:{ truck:'TR-3S-200' },
    });

    const inbound = await mma3.inbound({ mmaCode:'PSS.RAW' });
    const outbound = await mma3.outbound({ mmaCode:'JSS.RAW' });

    expect(inbound.some(r => r.id === edge.id)).toBe(true);
    expect(outbound.some(r => r.id === edge.id)).toBe(true);

    await mma3.receive({ id: edge.id, toMmaCode:'PSS.RAW', supplierId:sup.id });

    const inboundAfter = await mma3.inbound({ mmaCode:'PSS.RAW', status: EdgeStatus.IN_TRANSIT });
    expect(inboundAfter.some(r => r.id === edge.id)).toBe(false);
  });
});
