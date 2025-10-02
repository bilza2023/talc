// tests/setup.db.js
import { beforeEach, afterAll } from 'vitest';
import { prisma } from '../src/lib/stocks/stockEngine.js';

beforeEach(async () => {
  // wipe in safe order for FK-less sqlite
  await prisma.$transaction([
    prisma.stockTransport.deleteMany(),
    prisma.stockLedger.deleteMany(),
    prisma.supplier.deleteMany(),
  ]);
});

afterAll(async () => {
  await prisma.$disconnect();
});
