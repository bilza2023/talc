// tests/setup.db.js
import { beforeEach, afterAll } from 'vitest';
import { prisma } from '../src/lib/stocks/index.js';

async function safeClear(promise) {
  try { await promise; } catch { /* ignore P2021 etc. on first run */ }
}

beforeEach(async () => {
  // Clear **sequentially** to avoid SQLite locking
  await safeClear(prisma.rawTransport.deleteMany());
  await safeClear(prisma.rawLedger.deleteMany());
  await safeClear(prisma.processedTransport.deleteMany());
  await safeClear(prisma.processedLedger.deleteMany());
  await safeClear(prisma.sortedTransport.deleteMany());
  await safeClear(prisma.sortedLedger.deleteMany());
  // If you created Supplier rows during tests and want a clean slate, uncomment:
  // await safeClear(prisma.supplier.deleteMany());
});


afterAll(async () => {
  await prisma.$disconnect();
});
