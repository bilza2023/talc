// Test helpers for API endpoints
import { prisma } from '../../src/lib/stocks/stockEngine.js';

export async function resetDb() {
  // Order matters due to FKs: clear transport/ledger first, then suppliers.
  await prisma.stockTransport.deleteMany();
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
