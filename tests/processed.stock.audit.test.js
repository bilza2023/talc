// tests/processed.stock.audit.test.js
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import Stock from '../src/lib/stock/Stock.js';

const prisma = new PrismaClient();
const processed = new Stock({
  prisma,
  ledgerModel: 'processedLedger',
  transportModel: 'processedTransport',
});

async function seedSupplier(name = 'Audit Supplier') {
  const code = `SUP-${Date.now()}-${Math.random().toString(36).slice(2,6)}`;
  return prisma.supplier.create({ data: { name, code } });
}

beforeEach(async () => {
  await prisma.processedTransport.deleteMany();
  await prisma.processedLedger.deleteMany();
  await prisma.supplier.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe.sequential('Stock(processed) — audit (transport/process)', () => {
  it('auditTransport returns status + deltas (qty/amount/shade)', async () => {
    const sup = await seedSupplier();
    await processed.deposit({
      toMmaCode: 'ABS_PROCESSED', supplierId: sup.id, shade: 'WHITE', size: 'CHIPS', qty: 6,
    });

    const { transportId } = await processed.dispatch({
      fromMmaCode: 'ABS_PROCESSED',
      toMmaCode: 'PSS_PROCESSED',
      supplierId: sup.id,
      shade: 'WHITE',
      size: 'CHIPS',
      qty: 5,
      amount: 120,
    });

    await processed.receive({
      transportId,
      toMmaCode: 'PSS_PROCESSED',
      supplierId: sup.id,
      qty: 4.8,
      shade: 'LIGHTGREY',
      amount: 115,
    });

    const audit = await processed.auditTransport({ transportId });
    expect(audit.status).toBe('RECEIVED');
    expect(audit.deltas.qtyDelta).toBeCloseTo(4.8 - 5.0, 6);
    expect(audit.deltas.amountDelta).toBe(115 - 120);
    expect(audit.deltas.shadeDelta.from).toBe('WHITE');
    expect(audit.deltas.shadeDelta.to).toBe('LIGHTGREY');
  });

  it('auditProcess aggregates withdrawals + deposits by processId', async () => {
    const sup = await seedSupplier('ProcAgg Sup');
    // seed source
    await processed.deposit({
      toMmaCode: 'ABS_PROCESSED', supplierId: sup.id, shade: 'GREY', size: 'LUMPS', qty: 10,
    });

    // consume 3, then add 2.5 (simulate yield elsewhere)
    await processed.withdraw({
      fromMmaCode: 'ABS_PROCESSED',
      supplierId: sup.id,
      shade: 'GREY',
      size: 'LUMPS',
      qty: 3,
      processId: 'P-123',
    });
    await processed.deposit({
      toMmaCode: 'ABS_PROCESSED',
      supplierId: sup.id,
      shade: 'GREY',
      size: 'LUMPS',
      qty: 2.5,
      processId: 'P-123',
    });

    const audit = await processed.auditProcess({ processId: 'P-123' });
    // total is net effect at this stage (could be negative, zero, or positive)
    expect(Number(audit.total)).toBeCloseTo(-0.5, 6);
    expect(audit.rows.length).toBe(2);
  });
});
