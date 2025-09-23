// tests/testkit/index.js
import { beforeEach, afterAll } from 'vitest';
import { prisma, rawStock, processedStock, sortedStock } from '../../src/lib/stocks/index.js';

// Minimal DB reset in a safe order (children -> parent) to avoid FK errors
export async function resetDb() {
  // processed
  await prisma.processedTransport.deleteMany();
  await prisma.processedLedger.deleteMany();

  // sorted
  await prisma.sortedTransport.deleteMany();
  await prisma.sortedLedger.deleteMany();

  // raw
  await prisma.rawTransport.deleteMany();
  await prisma.rawLedger.deleteMany();

  // finally, parents referenced by ledgers/transports
  await prisma.supplier.deleteMany();
}

// Vitest hooks you can opt into from each test file
export function useCleanDb() {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
}

// Re-export the things tests actually need, with human names
export {
  prisma,
  rawStock as raw,
  processedStock as processed,
  sortedStock as sorted,
};
