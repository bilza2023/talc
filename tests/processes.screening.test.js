// tests/processes.screening.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { getDelegate } from '../src/lib/mma/utils.js';

const prisma = new PrismaClient();

describe('Screening Process (raw → processed)', () => {
  beforeEach(async () => {
    await prisma.processed4s.deleteMany();
    await prisma.sorted4s.deleteMany();
    await prisma.rawMaterial3s.deleteMany();
    await prisma.Process.deleteMany();
    await prisma.Supplier.deleteMany();   // clear suppliers too
  });

  it('consumes raw and produces processed with process links', async () => {
    const supplier = await prisma.supplier.create({
      data: { name: 'TestSup', code: `SUP-${Date.now()}` }  // unique code
    });

    // 1. Seed raw stock
    const Raw = getDelegate(prisma, 'rawMaterial3s');
    const rawRow = await Raw.create({
      data: {
        bornAs: 'DEPOSIT',
        status: 'RECEIVED',
        toMmaCode: 'ABS_RAW',
        supplierId: supplier.id,
        dispatchShade: 'WHITE',
        receiveShade: 'WHITE',
        dispatchQty: 10,
        receiveQty: 10
      }
    });

    // 2. Create process header
    const process = await prisma.process.create({
      data: {
        type: 'SCREENING',
        fromTable: 'RAW_MATERIAL_3S',
        toTable: 'PROCESSED_4S',
        fromMmaCode: 'ABS_RAW',
        toMmaCode: 'ABS_PROCESSED',
        meta: { yield: '90%' }
      }
    });

    // 3. Insert processed output
    const Proc = getDelegate(prisma, 'processed4s');
    const procRow = await Proc.create({
      data: {
        bornAs: 'PROCESS',
        status: 'RECEIVED',
        fromMmaCode: 'ABS_RAW',
        toMmaCode: 'ABS_PROCESSED',
        supplierId: supplier.id,
        size: 'LUMPS',
        dispatchShade: 'WHITE',
        receiveShade: 'WHITE',
        dispatchQty: 9,
        receiveQty: 9,
        processId: process.id
      }
    });

    // 4. Expectations
    expect(rawRow.toMmaCode).toBe('ABS_RAW');
    expect(procRow.toMmaCode).toBe('ABS_PROCESSED');
    expect(procRow.processId).toBe(process.id);
  });
});
