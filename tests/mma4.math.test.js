// tests/mma4.math.test.js
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient, EdgeStatus } from '@prisma/client';
import MMA4S from '../src/lib/mma/mma4s.js';

describe.sequential('MMA4S Stock Math (authoritative formula)', () => {
  let db, mma;
  const REGISTRY = ['ABS.SLOTS', 'PSS.DUMP', 'PSS.SLOTS', 'KEF.SLOTS'];
  const seedSupplier = async (name='Math Supplier') => {
    const code = `SUP-${Date.now()}-${Math.random().toString(36).slice(2,6)}`;
    return db.supplier.create({ data: { code, name }});
  };

  beforeAll(async () => {
    db = new PrismaClient();
    mma = new MMA4S({ prisma: db, registry: REGISTRY });
  });

  afterAll(async () => { await db.$disconnect(); });

  it('deposit → dispatch → receive variance → cancel math holds', async () => {
    const sup = await seedSupplier();
    await mma.deposit({ mmaCode:'ABS.SLOTS', supplierId:sup.id, shade:'s1', size:'LUMPS', qty:100 });
    const edge = await mma.dispatch({ fromMmaCode:'ABS.SLOTS', toMmaCode:'PSS.DUMP', supplierId:sup.id, shade:'s1', size:'LUMPS', qty:60, amountDispatch: 6000 });
    await mma.receive({ id:edge.id, toMmaCode:'PSS.DUMP', supplierId:sup.id, receiveQty:58, receiveShade:'s2', amountReceive: 5800 });
    const afterABS = await mma.onHand({ mmaCode:'ABS.SLOTS', supplierId:sup.id, shade:'s1', size:'LUMPS' });
    const afterPSS = await mma.onHand({ mmaCode:'PSS.DUMP', supplierId:sup.id, shade:'s2', size:'LUMPS' });
    expect(Number(afterABS)).toBeCloseTo(40, 6);
    expect(Number(afterPSS)).toBeGreaterThanOrEqual(58);

    const edge2 = await mma.dispatch({ fromMmaCode:'ABS.SLOTS', toMmaCode:'KEF.SLOTS', supplierId:sup.id, shade:'s1', size:'LUMPS', qty:10 });
    const midABS = await mma.onHand({ mmaCode:'ABS.SLOTS', supplierId:sup.id, shade:'s1', size:'LUMPS' });
    expect(Number(midABS)).toBeCloseTo(30,6);
    await mma.cancel({ id: edge2.id });
    const finalABS = await mma.onHand({ mmaCode:'ABS.SLOTS', supplierId:sup.id, shade:'s1', size:'LUMPS' });
    expect(Number(finalABS)).toBeCloseTo(40,6);
  });

  it('lists inbound/outbound for live IN_TRANSIT rows', async () => {
    const sup = await seedSupplier();
    await mma.deposit({ mmaCode:'ABS.SLOTS', supplierId:sup.id, shade:'ix', size:'CHIPS', qty:3.5 });
    const edge = await mma.dispatch({ fromMmaCode:'ABS.SLOTS', toMmaCode:'PSS.DUMP', supplierId:sup.id, shade:'ix', size:'CHIPS', qty:2.0 });
    const inbound = await mma.inbound({ mmaCode:'PSS.DUMP' });
    const outbound = await mma.outbound({ mmaCode:'ABS.SLOTS' });
    expect(inbound.some(r => r.id === edge.id)).toBe(true);
    expect(outbound.some(r => r.id === edge.id)).toBe(true);
    await mma.receive({ id:edge.id, toMmaCode:'PSS.DUMP', supplierId:sup.id });
    const stillOpen = await mma.inbound({ mmaCode:'PSS.DUMP', status: EdgeStatus.IN_TRANSIT });
    expect(stillOpen.some(r => r.id === edge.id)).toBe(false);
  });
});
