import { json } from '@sveltejs/kit';
import { prisma } from '../../../lib/stocks/stockEngine.js';

export async function GET({ url }) {
  try {
    const q = url.searchParams.get('q')?.trim();

    // No query → simple sorted list
    if (!q) {
      const suppliers = await prisma.supplier.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, name: true, code: true },
      });
      return json({ ok: true, data: suppliers });
    }

    // With query → try DB-Level case-insensitive; fallback to JS for SQLite
    let suppliers;
    try {
      suppliers = await prisma.supplier.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { code: { contains: q, mode: 'insensitive' } },
          ],
        },
        orderBy: { name: 'asc' },
        select: { id: true, name: true, code: true },
      });
    } catch {
      // SQLite fallback (no 'mode' support)
      const all = await prisma.supplier.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, name: true, code: true },
      });
      const ql = q.toLowerCase();
      suppliers = all.filter(
        (s) => s.name.toLowerCase().includes(ql) || s.code.toLowerCase().includes(ql)
      );
    }

    return json({ ok: true, data: suppliers });
  } catch (err) {
    return json({ ok: false, error: err.message }, { status: 500 });
  }
}
