import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';

import Kef from '../src/lib/core/kef/kef.js';
import { sortedStock } from '../src/lib/stocks'; // to simulate PSS → KEF dispatch

const prisma = new PrismaClient();

async function seedSupplier() {
  const code = 'TST_KEF_SUP';
  let s = await prisma.supplier.findFirst({ where: { code } });
  if (!s) {
    s = await prisma.supplier.create({
      data: { name: 'Test Supplier (KEF)', code }
    });
  }
  return s;
}

async function resetSortedTables() {
  await prisma.sortedTransport.deleteMany({});
  await prisma.sortedLedger.deleteMany({});
}

const shade = 'WHITE';
const size  = 'LUMPS';
const runTag = `kef-test-${Date.now()}`;

describe('KEF Station — receive from PSS (sorted only)', () => {
  let supplierId;

  beforeAll(async () => {
    const s = await seedSupplier();
    supplierId = s.id;
  });

  beforeEach(async () => {
    await resetSortedTables();
  });

  it('receiveSorted: PSS_SORTED → KEF_SORTED completes', async () => {
    // Simulate PSS → KEF dispatch (sorted)
    const dispatch = await sortedStock.dispatch({
      fromStationCode: 'PSS',
      fromMmaCode: 'PSS_SORTED',
      toStationCode: 'KEF',
      toMmaCode: Kef.mma.SORTED,
      supplierId, shade, size, qty: 1.1,
      meta: { testRunId: runTag, where: 'pss→kef simulate (sorted)' }
    });

    const transportId = dispatch?.transportId;
    expect(transportId).toBeTruthy();

    const rx = await Kef.receiveSorted({
      transportId,
      supplierId, // explicit; Kef can also derive if omitted
      meta: { testRunId: runTag, where: 'receiveSorted' }
    });

    expect(rx).toBeDefined();
  });
});
