
// /src/routes/stations/abs/purchase_unscreened/+server.js
import Abs from '$lib/core/abs/abs.js';
import { redirect } from '@sveltejs/kit';

export async function POST({ request }) {
    console.log("ok")
  const fd = await request.formData();
  const supplierId = Number(fd.get('supplierId'));
  const shade      = fd.get('shade');
  const size       = fd.get('size');
  const qty        = Number(fd.get('qty'));
  const meta       = (() => { try { return JSON.parse(fd.get('meta') || '{}'); } catch { return {}; } })();

  try {
    await Abs.purchaseUnscreened({ supplierId, shade, size, qty, meta });
    // success → redirect back with ok flag
    throw redirect(303, '/stations/abs/purchase_unscreened?ok=1');
  } catch (e) {
    const msg = encodeURIComponent(e?.message ?? 'Purchase failed');
    // failure → redirect back with error flag
    throw redirect(303, `/stations/abs/purchase_unscreened?err=${msg}`);
  }
}
