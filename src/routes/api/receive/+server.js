
// POST /api/receive?transportId=&toMmaCode=&supplierId=&qty=&amount=&shade=
import { json } from '@sveltejs/kit';
import { stock } from '../../../lib/stocks/stockEngine.js';

export async function POST({ url }) {
  try {
    const transportId = url.searchParams.get('transportId');
    const toMmaCode   = url.searchParams.get('toMmaCode');
    const supplierId  = Number(url.searchParams.get('supplierId'));

    if (!transportId || !toMmaCode || !supplierId) {
      return json({ ok: false, error: 'Missing required params' }, { status: 400 });
    }

    const qtyParam    = url.searchParams.get('qty');
    const amountParam = url.searchParams.get('amount');
    const shadeParam  = url.searchParams.get('shade');

    const qty    = qtyParam != null && qtyParam !== '' ? Number(qtyParam) : undefined;
    const amount = amountParam != null && amountParam !== '' ? Number(amountParam) : undefined;
    const shade  = shadeParam != null && shadeParam !== '' ? String(shadeParam) : undefined;

    const data = await stock.receive({
      transportId, toMmaCode, supplierId, qty, amount, shade
    });

    return json({ ok: true, data });
  } catch (err) {
    return json({ ok: false, error: err.message }, { status: 500 });
  }
}
