// Sorted-4s transport suite (PSS sorted, Karachi sorted)
// Uses the prebuilt engine from $lib/mma/index.js

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient, BornAs, EdgeStatus } from '@prisma/client';
import { sorted4s as mma } from '../src/lib/mma/index.js';

describe.sequential('sorted4s Engine (MMA4S, logistics within sorted4s)', () => {
  let db;

  async function seedSupplier(name='Sorted4s Supplier') {
    const code = `SUP-${Date.now()}-${Math.random().toString(36).slice(2,6)}`;
    return await db.supplier.create({ data: { code, name } });
  }

  beforeAll(async () => { db = new PrismaClient(); });
  afterAll(async () => { await db.$disconnect(); });

  it('deposit → raises on-hand', async () => {
    const sup = await seedSupplier();
    const before = await mma.onHand({ mmaCode:'PSS_SORTED', supplierId:sup.id, shade:'WHITE', size:'LUMPS' });

    const row = await mma.deposit({ mmaCode:'PSS_SORTED', supplierId:sup.id, shade:'WHITE', size:'LUMPS', qty:2.25 });

    expect(row.bornAs).toBe(BornAs.DEPOSIT);
    expect(row.status).toBe(EdgeStatus.RECEIVED);
    expect(row.toMmaCode).toBe('PSS_SORTED');
    expect(Number(row.receiveQty)).toBeCloseTo(2.25,6);

    const after = await mma.onHand({ mmaCode:'PSS_SORTED', supplierId:sup.id, shade:'WHITE', size:'LUMPS' });
    expect(Number(after)).toBeCloseTo(Number(before)+2.25,6);
  });

  it('dispatch → receive within sorted4s; inbound/outbound lists behave', async () => {
    const sup = await seedSupplier();
    await mma.deposit({ mmaCode:'PSS_SORTED', supplierId:sup.id, shade:'GREY', size:'CHIPS', qty:3.0 });

    const before = await mma.onHand({ mmaCode:'PSS_SORTED', supplierId:sup.id, shade:'GREY', size:'CHIPS' });

    const edge = await mma.dispatch({
      fromMmaCode:'PSS_SORTED', toMmaCode:'PSS_SORTED',
      supplierId:sup.id, shade:'GREY', size:'CHIPS', qty:1.5
    });

    expect(edge.bornAs).toBe(BornAs.TRANSFER);
    expect(edge.status).toBe(EdgeStatus.IN_TRANSIT);

    const mid = await mma.onHand({ mmaCode:'PSS_SORTED', supplierId:sup.id, shade:'GREY', size:'CHIPS' });
    expect(Number(mid)).toBeCloseTo(Number(before)-1.5,6);

    const inbound = await mma.inbound({ mmaCode:'PSS_SORTED' });
    expect(inbound.some(r=>r.id===edge.id)).toBe(true);
    const outbound = await mma.outbound({ mmaCode:'PSS_SORTED' });
    expect(outbound.some(r=>r.id===edge.id)).toBe(true);

    await mma.receive({ id:edge.id, toMmaCode:'PSS_SORTED', supplierId:sup.id, receiveQty:1.4, receiveShade:'GREY' });

    const stillOpen = await mma.inbound({ mmaCode:'PSS_SORTED', status:EdgeStatus.IN_TRANSIT });
    expect(stillOpen.some(r=>r.id===edge.id)).toBe(false);
  });

  it('cancel allowed only while IN_TRANSIT', async () => {
    const sup = await seedSupplier();
    await mma.deposit({ mmaCode:'PSS_SORTED', supplierId:sup.id, shade:'MIXED', size:'FINE', qty:4.0 });

    const before = await mma.onHand({ mmaCode:'PSS_SORTED', supplierId:sup.id, shade:'MIXED', size:'FINE' });

    const edge = await mma.dispatch({
      fromMmaCode:'PSS_SORTED', toMmaCode:'PSS_SORTED',
      supplierId:sup.id, shade:'MIXED', size:'FINE', qty:2.0
    });

    const mid = await mma.onHand({ mmaCode:'PSS_SORTED', supplierId:sup.id, shade:'MIXED', size:'FINE' });
    expect(Number(mid)).toBeCloseTo(Number(before)-2.0,6);

    const canceled = await mma.cancel({ id:edge.id });
    expect(canceled.status).toBe(EdgeStatus.CANCELED);

    const after = await mma.onHand({ mmaCode:'PSS_SORTED', supplierId:sup.id, shade:'MIXED', size:'FINE' });
    expect(Number(after)).toBeCloseTo(Number(before),6);
  });
});
