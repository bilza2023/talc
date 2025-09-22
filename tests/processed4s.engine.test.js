// Processed-4s transport suite (ABS processed, PSS processed)
// Uses the prebuilt engine from src/lib/mma/index.js

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient, BornAs, EdgeStatus } from '@prisma/client';
import { processed4s as mma } from '../src/lib/mma/index.js';

describe.sequential('processed4s Engine (MMA4S, logistics within processed4s)', () => {
  let db;

  async function seedSupplier(name = 'Proc4s Supplier') {
    const code = `SUP-${Date.now()}-${Math.random().toString(36).slice(2,6)}`;
    return await db.supplier.create({ data: { code, name } });
  }

  beforeAll(async () => { db = new PrismaClient(); });
  afterAll(async () => { await db.$disconnect(); });

  it('deposit: RECEIVED row raises on-hand at destination', async () => {
    const sup = await seedSupplier();
    const before = await mma.onHand({
      mmaCode:'ABS_PROCESSED', supplierId:sup.id, shade:'WHITE', size:'LUMPS'
    });

    const row = await mma.deposit({
      mmaCode:'ABS_PROCESSED', supplierId:sup.id, shade:'WHITE', size:'LUMPS', qty:12.5
    });

    expect(row.bornAs).toBe(BornAs.DEPOSIT);
    expect(row.status).toBe(EdgeStatus.RECEIVED);
    expect(row.toMmaCode).toBe('ABS_PROCESSED');
    expect(Number(row.receiveQty)).toBeCloseTo(12.5,6);

    const after = await mma.onHand({
      mmaCode:'ABS_PROCESSED', supplierId:sup.id, shade:'WHITE', size:'LUMPS'
    });
    expect(Number(after)).toBeCloseTo(Number(before)+12.5,6);
  });

  it('dispatch: creates IN_TRANSIT, lowers source; appears in outbound & inbound', async () => {
    const sup = await seedSupplier();
    await mma.deposit({ mmaCode:'ABS_PROCESSED', supplierId:sup.id, shade:'WHITE', size:'CHIPS', qty:7.0 });

    const beforeSrc = await mma.onHand({ mmaCode:'ABS_PROCESSED', supplierId:sup.id, shade:'WHITE', size:'CHIPS' });

    const edge = await mma.dispatch({
      fromMmaCode:'ABS_PROCESSED', toMmaCode:'PSS_PROCESSED',
      supplierId:sup.id, shade:'WHITE', size:'CHIPS', qty:5.0, meta:{ truck:'TR-ABS-001' }
    });

    expect(edge.bornAs).toBe(BornAs.TRANSFER);
    expect(edge.status).toBe(EdgeStatus.IN_TRANSIT);

    const afterSrc = await mma.onHand({ mmaCode:'ABS_PROCESSED', supplierId:sup.id, shade:'WHITE', size:'CHIPS' });
    expect(Number(afterSrc)).toBeCloseTo(Number(beforeSrc)-5.0,6);

    const outbound = await mma.outbound({ mmaCode:'ABS_PROCESSED' });
    expect(outbound.some(r=>r.id===edge.id)).toBe(true);

    const inbound = await mma.inbound({ mmaCode:'PSS_PROCESSED' });
    expect(inbound.some(r=>r.id===edge.id)).toBe(true);
  });

  it('receive: completes same row, verifies supplier & dest, raises dest on-hand', async () => {
    const sup = await seedSupplier();
    await mma.deposit({ mmaCode:'ABS_PROCESSED', supplierId:sup.id, shade:'GREY', size:'FINE', qty:9.0 });

    const edge = await mma.dispatch({
      fromMmaCode:'ABS_PROCESSED', toMmaCode:'PSS_PROCESSED',
      supplierId:sup.id, shade:'GREY', size:'FINE', qty:6.2
    });

    const beforeDst = await mma.onHand({ mmaCode:'PSS_PROCESSED', supplierId:sup.id, shade:'GREY', size:'FINE' });

    const recv = await mma.receive({
      id:edge.id, toMmaCode:'PSS_PROCESSED', supplierId:sup.id,
      receiveQty:6.0, receiveShade:'LIGHTGREY', meta:{ receivedBy:'Sara' }
    });

    expect(recv.status).toBe(EdgeStatus.RECEIVED);
    expect(recv.toMmaCode).toBe('PSS_PROCESSED');
    expect(Number(recv.receiveQty)).toBeCloseTo(6.0,6);

    const afterDst = await mma.onHand({ mmaCode:'PSS_PROCESSED', supplierId:sup.id, shade:'LIGHTGREY', size:'FINE' });
    expect(Number(afterDst)).toBeGreaterThanOrEqual(6.0);
  });

  it('cancel: only while IN_TRANSIT; removing outbound restores on-hand', async () => {
    const sup = await seedSupplier();
    // was 'W1' (invalid for enum). Use WHITE.
    await mma.deposit({ mmaCode:'ABS_PROCESSED', supplierId:sup.id, shade:'WHITE', size:'CHIPS', qty:4.0 });

    const before = await mma.onHand({ mmaCode:'ABS_PROCESSED', supplierId:sup.id, shade:'WHITE', size:'CHIPS' });

    const edge = await mma.dispatch({
      fromMmaCode:'ABS_PROCESSED', toMmaCode:'PSS_PROCESSED',
      supplierId:sup.id, shade:'WHITE', size:'CHIPS', qty:3.0
    });

    const mid = await mma.onHand({ mmaCode:'ABS_PROCESSED', supplierId:sup.id, shade:'WHITE', size:'CHIPS' });
    expect(Number(mid)).toBeCloseTo(Number(before)-3.0,6);

    const canceled = await mma.cancel({ id:edge.id });
    expect(canceled.status).toBe(EdgeStatus.CANCELED);

    const after = await mma.onHand({ mmaCode:'ABS_PROCESSED', supplierId:sup.id, shade:'WHITE', size:'CHIPS' });
    expect(Number(after)).toBeCloseTo(Number(before),6);
  });

  it('stock(): summarizes per (supplierId, shade, size)', async () => {
    const sup = await seedSupplier();
    // was 'sA' / 'sB' (invalid). Use enum shades to get two distinct rows.
    await mma.deposit({ mmaCode:'PSS_PROCESSED', supplierId:sup.id, shade:'WHITE', size:'LUMPS', qty:1.0 });
    await mma.deposit({ mmaCode:'PSS_PROCESSED', supplierId:sup.id, shade:'GREY',  size:'CHIPS', qty:2.0 });

    const rows = await mma.stock({ mmaCode:'PSS_PROCESSED' });
    expect(rows.every(r=>r.qty>0)).toBe(true);
    const keys = rows.map(r=>`${r.supplierId}|${r.shade}|${r.size}`);
    expect(keys.some(k=>k.endsWith('|WHITE|LUMPS'))).toBe(true);
    expect(keys.some(k=>k.endsWith('|GREY|CHIPS'))).toBe(true);
  });

  // NEW: verify transport amount roll-ups
  it('transportAmounts(): source outbound, dest in-transit then received', async () => {
    const sup = await seedSupplier('Amt Supplier');
    // seed source
    await mma.deposit({ mmaCode:'ABS_PROCESSED', supplierId:sup.id, shade:'WHITE', size:'LUMPS', qty:10 });

    // baselines to avoid interference from prior tests
    const baseSrc = await mma.transportAmounts({ mmaCode:'ABS_PROCESSED' });
    const baseDst = await mma.transportAmounts({ mmaCode:'PSS_PROCESSED' });

    // dispatch with amount
    const edge = await mma.dispatch({
      fromMmaCode:'ABS_PROCESSED', toMmaCode:'PSS_PROCESSED',
      supplierId:sup.id, shade:'WHITE', size:'LUMPS', qty:5, amount:100
    });

    // after dispatch (still in-transit)
    {
      const src = await mma.transportAmounts({ mmaCode:'ABS_PROCESSED' });
      const dst = await mma.transportAmounts({ mmaCode:'PSS_PROCESSED' });
      expect(src.outboundDispatched).toBe(baseSrc.outboundDispatched + 100);
      expect(dst.inboundInTransit).toBe(baseDst.inboundInTransit + 100);
      expect(dst.inboundReceived).toBe(baseDst.inboundReceived);
    }

    // complete with receiveAmount 95
    await mma.receive({ id:edge.id, toMmaCode:'PSS_PROCESSED', supplierId:sup.id, receiveQty:5, receiveShade:'WHITE', amountReceive:95 });

    // after receive
    {
      const src = await mma.transportAmounts({ mmaCode:'ABS_PROCESSED' });
      const dst = await mma.transportAmounts({ mmaCode:'PSS_PROCESSED' });
      expect(src.outboundDispatched).toBe(baseSrc.outboundDispatched + 100); // unchanged
      expect(dst.inboundInTransit).toBe(baseDst.inboundInTransit);           // cleared
      expect(dst.inboundReceived).toBe(baseDst.inboundReceived + 95);        // increased
    }
  });
});
