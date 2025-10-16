// Small helpers that work with your existing prisma test DB
import { prisma } from '../../src/lib/stocks/stockEngine.js';

// Ensure required fields for Supplier (code is required by schema)
export async function seedSuppliers(list = [{ id: 1, name: 'S-1' }]) {
  for (const s of list) {
    const data = {
      id: s.id,
      name: s.name,
      // default a unique code if not provided
      code: s.code ?? (s.id != null ? `S-${s.id}` : `S-${Math.random().toString(36).slice(2, 7)}`)
    };
    await prisma.supplier.create({ data });
  }
}

export function dt(s) { return new Date(s); }

export async function seedLedger(rows) {
  for (const r of rows) await prisma.stockLedger.create({ data: r });
}

export async function seedTransport(rows) {
  for (const r of rows) await prisma.stockTransport.create({ data: r });
}

export function mkUrl(q = {}) {
  const qs = new URLSearchParams(q).toString();
  return new URL(`http://test.local${qs ? `?${qs}` : ''}`);
}
