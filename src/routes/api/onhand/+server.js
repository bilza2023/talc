
// GET /api/onhand?mmaCode=&supplierId=&shade=&size=
import { json } from '@sveltejs/kit';
import { stock } from '../../../lib/stocks/stockEngine.js';

export async function GET({ url }) {
  try {
    const mmaCode   = url.searchParams.get('mmaCode') || undefined;
    const supplier  = url.searchParams.get('supplierId');
    const supplierId = supplier != null && supplier !== '' ? Number(supplier) : undefined;
    const shade     = url.searchParams.get('shade') || undefined;
    const size      = url.searchParams.get('size') || undefined;

    const value = await stock.onHand({ mmaCode, supplierId, shade, size });
    return json({ ok: true, data: value });
  } catch (err) {
    return json({ ok: false, error: err.message }, { status: 500 });
  }
}
