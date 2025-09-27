import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';

import Pss from '../src/lib/core/pss/pss.js';
import { processedStock } from '../src/lib/stocks'; // simulate ABS → PSS (processed)

const prisma = new PrismaClient();

async function seedSupplier() {
  const code = 'TST_PSS_SUP';
  let s = await prisma.supplier.findFirst({ where: { code } });
  if (!s) {
    s = await prisma.supplier.create({
      data: { name: 'Test Supplier (PSS)', code }
    });
  }
  return s;
}

async function resetStageTables() {
  await prisma.processedTransport.deleteMany({});
  await prisma.processedLedger.deleteMany({});
  await prisma.sortedTransport.deleteMany({});
  await prisma.sortedLedger.deleteMany({});
}

const shade = 'WHITE';
const size  = 'LUMPS';
const runTag = `pss-test-${Date.now()}`;

describe('PSS Facade — processed & sorted flow (focused)', () => {
  let supplierId;

  beforeAll(async () => {
    const s = await seedSupplier();
    supplierId = s.id;
  });

  beforeEach(async () => {
    await resetStageTables();
  });

  it('dispatchProcessedToKef: PSS_PROCESSED → KEF_SORTED', async () => {
    await Pss.purchaseProcessed({
      supplierId, shade, size, qty: 2.5,
      meta: { testRunId: runTag, where: 'prefill-processed' }
    });

    const out = await Pss.dispatchProcessedToKef({
      supplierId, shade, size, qty: 1.0,
      meta: { testRunId: runTag, where: 'dispatchProcessedToKef' }
    });

    expect(out?.transportId).toBeTruthy();
  });

  it('receive processed from ABS lands at PSS_PROCESSED', async () => {
    // simulate ABS → PSS (processed)
    const dispatch = await processedStock.dispatch({
      fromStationCode: 'ABS',
      fromMmaCode: 'ABS_PROCESSED',
      toStationCode: 'PSS',
      toMmaCode: Pss.mma.PROCESSED,
      supplierId, shade, size, qty: 0.7,
      meta: { testRunId: runTag, where: 'abs→pss simulate (processed)' }
    });

    const transportId = dispatch?.transportId;
    expect(transportId).toBeTruthy();

    const rx = await Pss.receiveProcessed({
      transportId,
      supplierId, // explicit (helper can also auto-derive)
      meta: { testRunId: runTag, where: 'receiveProcessed' }
    });

    expect(rx).toBeDefined();
  });

  it('dispatchSortedToKef: PSS_SORTED → KEF_SORTED', async () => {
    await Pss.purchaseSorted({
      supplierId, shade, size, qty: 1.4,
      meta: { testRunId: runTag, where: 'prefill-sorted' }
    });

    const tr = await Pss.dispatchSortedToKef({
      supplierId, shade, size, qty: 1.0,
      meta: { testRunId: runTag, where: 'dispatchSortedToKef' }
    });

    expect(tr?.transportId).toBeTruthy();
  });
});
