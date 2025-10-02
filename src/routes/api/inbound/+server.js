
// GET /api/inbound?mmaCode=...
import { json } from '@sveltejs/kit';
import { stock } from '../../../lib/stocks/stockEngine.js';

export async function GET({ url }) {
  try {
    const mmaCode = url.searchParams.get('mmaCode');
    if (!mmaCode) return json({ ok: false, error: 'mmaCode is required' }, { status: 400 });

    const rows = await stock.inbound({ mmaCode });
    return json({ ok: true, data: rows });
  } catch (err) {
    return json({ ok: false, error: err.message }, { status: 500 });
  }
}
