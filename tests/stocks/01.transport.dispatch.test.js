// tests/stocks/01.transport.dispatch.test.js — unified schema
import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '../../src/lib/stocks/index.js';
import Stock from '../../src/lib/stock/Stock.js';

const stock = new Stock({
  prisma,
  ledgerDelegate: 'stockLedger',
  transportDelegate: 'stockTransport',
  sizeDefault: 'ANY',
});

const FROM    = 'ABS_SCREENED';
const TO      = 'PSS_SCREENED';
const T_SHADE = 'WHITE';
const T_SIZE  = 'ANY';

async function seedSupplier(name = 'Dispatch Sup') {
  return prisma.supplier.create({
    data: { name, code: `D-${Math.random().toString(36).slice(2, 8).toUpperCase()}` },
  });
}

beforeEach(async () => {
  await prisma.stockTransport.deleteMany();
  await prisma.stockLedger.deleteMany();
});

describe('Stock — transport: DISPATCH', () => {
  it('creates DISPATCH and deducts source; destination unchanged until RECEIVE', async () => {
    const sup = await seedSupplier();

    // Seed 5t at source
    await stock.deposit({ toMmaCode: FROM, supplierId: sup.id, shade: T_SHADE, size: T_SIZE, qty: 5 });

    // Dispatch 3t FROM -> TO
    const { transportId } = await stock.dispatch({
      fromMmaCode: FROM,
      toMmaCode: TO,
      supplierId: sup.id,
      shade: T_SHADE,
      size: T_SIZE,
      qty: 3,
    });

    // Source reduced immediately
    const src = await stock.onHand({ mmaCode: FROM, supplierId: sup.id, shade: T_SHADE, size: T_SIZE });
    expect(src).toBeCloseTo(2, 6);

    // Destination stays 0 until receive
    const dst = await stock.onHand({ mmaCode: TO, supplierId: sup.id, shade: T_SHADE, size: T_SIZE });
    expect(dst).toBeCloseTo(0, 6);

    // Transport is in transit
    const tr = await stock.auditTransport({ transportId });
    expect(tr.status).toBe('IN_TRANSIT');
  });
});
