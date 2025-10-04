// ABS → KEF dispatch (Screened), API-aligned
const FROM_MMA = 'ABS_SCREENED';
const TO_MMA   = 'KEF_SCREENED';

export async function load({ url }) {
  const supplierId = Number(url.searchParams.get('supplierId') || '');
  const shade      = url.searchParams.get('shade') || '';
  const size       = url.searchParams.get('size') || '';
  const qty        = Number(url.searchParams.get('qty') || 0); // optional prefill

  const missing = !supplierId || !shade || !size;

  return {
    error: missing ? 'Missing supplierId, shade, or size in URL. Open from the ABS Screened Slots page.' : null,
    fromMmaCode: FROM_MMA,
    toMmaCode: TO_MMA,
    supplierId,
    shade,
    size,
    qty: qty > 0 ? qty : 1
  };
}
