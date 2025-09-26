import { prisma } from '../stocks/index.js';

export default async function getStationSuppliers(ids = []) {
  // normalize & dedupe
  const order = [];
  const seen = new Set();
  for (const v of ids) {
    const n = Number(v);
    if (Number.isFinite(n) && !seen.has(n)) {
      seen.add(n);
      order.push(n);
    }
  }

  // DEBUG
  console.log('[getStationSuppliers] input IDs:', order);

  if (order.length === 0) return [];

  const rows = await prisma.supplier.findMany({
    where: { id: { in: order } },
    select: { id: true, name: true, code: true }
  });

  // DEBUG
  console.log('[getStationSuppliers] DB rows:', rows);

  const byId = new Map(rows.map((r) => [r.id, r]));
  const missing = order.filter((id) => !byId.has(id));
  if (missing.length) {
    console.warn('[getStationSuppliers] missing IDs (not in DB):', missing);
  }

  return order.map((id) => byId.get(id)).filter(Boolean);
}
