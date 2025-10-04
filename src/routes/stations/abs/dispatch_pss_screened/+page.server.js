// ABS → PSS dispatch (Screened), API-aligned
const FROM_MMA = 'ABS_SCREENED';
const TO_MMA   = 'PSS_SCREENED';

export async function load({ url, fetch }) {
  const supplierId = Number(url.searchParams.get('supplierId') || '');
  const shade      = url.searchParams.get('shade') || '';
  const size       = url.searchParams.get('size') || '';
  const qty        = Number(url.searchParams.get('qty') || 0); // optional prefill

  const missing = !supplierId || !shade || !size;

  // fetch actual on-hand for this tuple
  let available = 0;
  if (!missing) {
    const p = new URLSearchParams({
      mmaCode: FROM_MMA,
      supplierId: String(supplierId),
      shade,
      size
    });
    const r = await fetch(`/api/onhand?${p.toString()}`);
    const j = await r.json().catch(() => ({ ok: false, data: 0 }));
    available = j.ok ? Number(j.data || 0) : 0;
  }

  return {
    error: missing ? 'Missing supplierId, shade, or size in URL. Open from the ABS Screened Slots page.' : null,
    fromMmaCode: FROM_MMA,
    toMmaCode: TO_MMA,
    supplierId,
    shade,
    size,
    qty: qty > 0 ? qty : 1,
    available
  };
}
