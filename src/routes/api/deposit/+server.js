// /api/deposit
import { json } from '@sveltejs/kit';
import { stock } from '$lib/stocks/stockEngine.js';

export async function POST({ url }) {
  try {
    const toMmaCode = url.searchParams.get('toMmaCode');
    const supplierId = Number(url.searchParams.get('supplierId'));
    const shade      = url.searchParams.get('shade');
    const size       = url.searchParams.get('size') || 'ANY';
    const qty        = Number(url.searchParams.get('qty'));

    if (!toMmaCode || !supplierId || !shade || !qty) {
      return json({ ok: false, error: 'Missing required params' }, { status: 400 });
    }

    const result = await stock.deposit({
      toMmaCode,
      supplierId,
      shade,
      size,
      qty,
    });

    return json({ ok: true, data: result });
  } catch (err) {
    return json({ ok: false, error: err.message }, { status: 500 });
  }
}
