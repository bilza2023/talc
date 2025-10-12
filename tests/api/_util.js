// tests/api/_util.js
// Test helpers for API endpoints
import { prisma } from '../../src/lib/stocks/stockEngine.js';

export async function resetDb() {
  // FK-safe order: children → parents
  await prisma.stockTransport.deleteMany();
  await prisma.purchase_tbl.deleteMany();         // NEW: points to StockLedger
  await prisma.screening_tbl?.deleteMany?.();     // if present in schema
  await prisma.sorting_tbl?.deleteMany?.();       // if present in schema
  await prisma.stockLedger.deleteMany();
  await prisma.supplier.deleteMany();
}

export async function seedSupplier(name = 'Test Supplier') {
  return prisma.supplier.create({
    data: { name, code: name.toLowerCase().replace(/\s+/g, '_') }
  });
}

export async function disconnect() {
  await prisma.$disconnect();
}
