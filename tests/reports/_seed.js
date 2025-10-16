// tests/reports/_seed.js
import { prisma } from '../../src/lib/stocks/stockEngine.js';

export async function seedSuppliers(list = [{ id: 1, name: 'S-1' }, { id: 2, name: 'S-2' }, { id: 3, name: 'S-3' }]) {
  for (const s of list) {
    await prisma.supplier.create({ data: { id: s.id, name: s.name } });
  }
}

export function dt(s) { return new Date(s); }

export async function seedLedger(rows) {
  for (const r of rows) {
    await prisma.stockLedger.create({ data: r });
  }
}

export async function seedTransport(rows) {
  for (const r of rows) {
    await prisma.stockTransport.create({ data: r });
  }
}

export function mkUrl(q = {}) {
  const qs = new URLSearchParams(q).toString();
  return new URL(`http://test.local${qs ? `?${qs}` : ''}`);
}
