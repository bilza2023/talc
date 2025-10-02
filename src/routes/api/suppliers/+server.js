
// /api/suppliers
import { json } from '@sveltejs/kit';
import { prisma } from '$lib/stocks/stockEngine.js'; // <-- corrected import

export async function GET({ url }) {
  try {
    const q = url.searchParams.get('q')?.trim();

    const where = q
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { code: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {};

    const suppliers = await prisma.supplier.findMany({
      where,
      orderBy: { name: 'asc' },
      select: { id: true, name: true, code: true },
    });

    return json({ ok: true, data: suppliers });
  } catch (err) {
    return json({ ok: false, error: err.message }, { status: 500 });
  }
}
