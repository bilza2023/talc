// src/routes/mma4s/slots/+page.server.js
import { error } from '@sveltejs/kit';
import { processed4s, sorted4s } from '$lib/mma'; // resolves to lib/mma/index.js

function pickSvcByMma(mmaCode) {
  if (processed4s?.registry?.includes(mmaCode)) return processed4s;
  if (sorted4s?.registry?.includes(mmaCode)) return sorted4s;

  const valid = [
    ...(processed4s?.registry ?? []),
    ...(sorted4s?.registry ?? [])
  ];
  throw error(400, `Unknown or unregistered mma code: ${mmaCode}. Valid: ${valid.join(', ')}`);
}

export async function load({ url }) {
  const mmaParam = url.searchParams.get('mma')?.trim();
  const supplierIdParam = url.searchParams.get('supplierId');

  if (!mmaParam || !supplierIdParam) {
    throw error(400, 'Required query params: mma and supplierId');
  }

  const supplierId = Number(supplierIdParam);
  if (!Number.isFinite(supplierId)) {
    throw error(400, 'supplierId must be a number');
  }

  // Be forgiving: allow aliases "processed4s"/"sorted4s" in mma= for testing
  const mmaLower = mmaParam.toLowerCase();
  const mmaCode =
    mmaLower === 'processed4s' ? (processed4s.registry?.[0] ?? '') :
    mmaLower === 'sorted4s'    ? (sorted4s.registry?.[0] ?? '') :
    mmaParam;

  const svc = pickSvcByMma(mmaCode);

  // Get active, positive-only slots for this MMA
  const allSlots = await svc.activeSlots({ mmaCode });

  const slots = (allSlots ?? [])
    .filter(r => Number(r.supplierId) === supplierId && Number(r.qty) > 0)
    .map(r => ({ shade: r.shade, size: r.size, qty: Number(r.qty) }))
    .sort((a, b) => b.qty - a.qty);

  return { mmaCode, supplierId, slots };
}
