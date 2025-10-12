// tests/setup.db.js
import { beforeEach, afterAll } from 'vitest';
import { prisma } from '../src/lib/stocks/stockEngine.js';

beforeEach(async () => {
  // FK-safe wipe order: children → parents
  await prisma.$transaction([
    prisma.stockTransport.deleteMany(), // uses supplierId → Supplier
    prisma.purchase_tbl.deleteMany(),   // has depositLedgerId → StockLedger
    prisma.screening_tbl.deleteMany?.() ?? prisma.$executeRaw`SELECT 1`, // if present
    prisma.sorting_tbl.deleteMany?.() ?? prisma.$executeRaw`SELECT 1`,   // if present
    prisma.stockLedger.deleteMany(),    // parent of purchase_tbl
    prisma.supplier.deleteMany(),       // parent of ledger/transport
  ]);
});

afterAll(async () => {
  await prisma.$disconnect();
});
