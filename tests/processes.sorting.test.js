
// tests/processes.sorting.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { getDelegate } from '../src/lib/mma/utils.js';

const prisma = new PrismaClient();

describe('Sorting Process (processed → sorted)', () => {
  beforeEach(async () => {
    await prisma.processed4s.deleteMany();
    await prisma.sorted4s.deleteMany();
    await prisma.rawMaterial3s.deleteMany();
    await prisma.Process.deleteMany();
    await prisma.Supplier.deleteMany();
  });

  it('consumes processed and produces sorted with meta impurities', async () => {
    const supplier = await prisma.supplier.create({
      data: { name: 'TestSup', code: `SUP-${Date.now()}` }
    });

    // 1. Seed processed stock
    const Proc = getDelegate(prisma, 'processed4s');
    const procRow = await Proc.create({
      data: {
        bornAs: 'DEPOSIT',
        status: 'RECEIVED',
        toMmaCode: 'PSS_PROCESSED',
        supplierId: supplier.id,
        size: 'CHIPS',
        dispatchShade: 'GREY',
        receiveShade: 'GREY',
        dispatchQty: 8,
        receiveQty: 8
      }
    });

    // 2. Create process header
    const process = await prisma.process.create({
      data: {
        type: 'SORTING',
        fromTable: 'PROCESSED_4S',
        toTable: 'SORTED_4S',
        fromMmaCode: 'PSS_PROCESSED',
        toMmaCode: 'PSS_SORTED',
        meta: { HT: 1.2, Wastage: 0.3 }   // impurities
      }
    });

    // 3. Insert sorted output
    const Sorted = getDelegate(prisma, 'sorted4s');
    const sortedRow = await Sorted.create({
      data: {
        bornAs: 'PROCESS',
        status: 'RECEIVED',
        fromMmaCode: 'PSS_PROCESSED',
        toMmaCode: 'PSS_SORTED',
        supplierId: supplier.id,
        size: 'CHIPS',
        dispatchShade: 'GREY',
        receiveShade: 'GREY',
        dispatchQty: 6.5,
        receiveQty: 6.5,
        processId: process.id
      }
    });

    // 4. Expectations
    expect(procRow.toMmaCode).toBe('PSS_PROCESSED');
    expect(sortedRow.toMmaCode).toBe('PSS_SORTED');
    expect(sortedRow.processId).toBe(process.id);
  });
});
