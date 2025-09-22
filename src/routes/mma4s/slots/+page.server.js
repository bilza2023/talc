// src/routes/mma4s/slots/+page.server.js
import { error } from '@sveltejs/kit';
import { processed4s, sorted4s } from '$lib/mma'; // resolves to lib/mma/index.js

function pickSvcAndMma(mmaOrAlias) {
  if (!mmaOrAlias) throw error(400, 'Required query params: mma and supplierId');

  const val = String(mmaOrAlias).trim();
  const lc = val.toLowerCase();

  // Allow aliases in the mma param
  if (lc === 'processed4s') {
    const first = processed4s?.registry?.[0];
    if (!first) throw error(400, 'processed4s has no registered MMA codes');
    return { svc: processed4s, mmaCode: first };
  }
  if (lc === 'sorted4s') {
    const first = sorted4s?.registry?.[0];
    if (!first) throw error(400, 'sorted4s has no registered MMA codes');
    return { svc: sorted4s, mmaCode: first };
  }

  // Otherwise treat as a real MMA code
  if (processed4s.registry?.includes(val)) return { svc: processed4s, mmaCode: val };
  if (sorted4s.registry?.includes(val)) return { svc: sorted4s, mmaCode: val };

  const valid = [
    ...(processed4s.registry || []),
    ...(sorted4s.registry || [])
  ];
  throw error(400, `Unknown or unregistered mma code: ${val}. Valid: ${valid.join(', ')}`);
}

export async function load({ url }) {
  const mmaParam = url.searchParams.get('mma');
  const supplierIdParam = url.searchParams.get('supplierId');

  if (!mmaParam || !supplierIdParam) {
    throw error(400, 'Required query params: mma and supplierId');
  }

  const supplierId = Number(supplierIdParam);
  if (!Number.isFinite(supplierId)) {
    throw error(400, 'supplierId must be a number');
  }

  const { svc, mmaCode } = pickSvcAndMma(mmaParam);

  // Get active slots for that exact MMA
  const allSlots = await svc.activeSlots({ mmaCode });

  const slots = (allSlots || [])
    .filter((r) => Number(r.supplierId) === supplierId && Number(r.qty) > 0)
    .map((r) => ({ shade: r.shade, size: r.size, qty: Number(r.qty) }))
    .sort((a, b) => b.qty - a.qty);

  return { mmaCode, supplierId, slots };
}
