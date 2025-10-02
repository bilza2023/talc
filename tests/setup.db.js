// tests/setup.db.js
import { beforeEach, afterAll } from 'vitest';
import { prisma } from '../src/lib/stocks/index.js';

async function safeClear(promise) {
  try { await promise; } catch { /* ignore if table not found */ }
}

beforeEach(async () => {
  // Clear unified tables sequentially
  await safeClear(prisma.stockTransport.deleteMany());
  await safeClear(prisma.stockLedger.deleteMany());
  // optional: suppliers if you want a fresh slate
  // await safeClear(prisma.supplier.deleteMany());
});

afterAll(async () => {
  await prisma.$disconnect();
});
