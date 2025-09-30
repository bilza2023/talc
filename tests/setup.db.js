// tests/setup.db.js
import { beforeEach, afterAll } from 'vitest';
import { prisma } from '../src/lib/stocks/index.js';

beforeEach(async () => {
  await prisma.$transaction([
    prisma.rawTransport.deleteMany(),
    prisma.rawLedger.deleteMany(),
    prisma.processedTransport.deleteMany(),
    prisma.processedLedger.deleteMany(),
    prisma.sortedTransport.deleteMany(),
    prisma.sortedLedger.deleteMany(),
  ]);
});

afterAll(async () => {
  await prisma.$disconnect();
});
