// tests/stocks/01.transport.dispatch.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '../../src/lib/stocks/index.js';
import Stock from '../../src/lib/stock/Stock.js';

const stock = new Stock({
  prisma,
  ledgerModel: 'processedLedger',
  transportModel: 'processedTransport',
  sizeDefault: 'ANY',
});

const FROM  = 'ABS_SCREENED';
const TO    = 'PSS_SCREENED';
const SHADE = 'WHITE';
const SIZE  = 'ANY';

async function seedSupplier(name = 'Dispatch Sup') {
  return prisma.supplier.create({
    data: { name, code: `D-${Math.random().toString(36).slice(2, 8).toUpperCase()}` },
  });
}

beforeEach(async () => {
  // Reset only the stage-specific tables used by this test
  await prisma.processedTransport.deleteMany();
  await prisma.processedLedger.deleteMany();
});

describe('Stock — transport: DISPATCH', () => {
  it('creates a DISPATCH and deducts source; destination unchanged until RECEIVE', async () => {
    const sup = await seedSupplier();

    // Seed 5t to source
    await stock.deposit({
      toMmaCode: FROM,
      supplierId: sup.id,
      shade: SHADE,
      size: SIZE,
      qty: 5,
    });

    // Dispatch 3t FROM -> TO
    const { transportId } = await stock.dispatch({
      fromMmaCode: FROM,
      toMmaCode: TO,
      supplierId: sup.id,
      shade: SHADE,
      size: SIZE,
      qty: 3,
    });

    // Source reduced immediately
    const src = await stock.onHand({
      mmaCode: FROM, supplierId: sup.id, shade: SHADE, size: SIZE,
    });
    expect(src).toBeCloseTo(2, 6);

    // Destination stays 0 until receive
    const dst = await stock.onHand({
      mmaCode: TO, supplierId: sup.id, shade: SHADE, size: SIZE,
    });
    expect(dst).toBeCloseTo(0, 6);

    // Public audit call: should indicate "in transit"
    const tr = await stock.auditTransport({ transportId });
    expect(tr.status).toBe('IN_TRANSIT');

    // NOTE: We intentionally don't assert DB row shape here.
    // Different engines may not persist a DISPATCH row yet,
    // or may store it with a different 'type' field. The
    // public contract we rely on is onHand math + audit status.
  });
});
