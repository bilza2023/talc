// PSS — Sorting (SCREENED → SORTED) using unified Stock API
import { fail } from '@sveltejs/kit';
import { stock, prisma } from '$lib/stocks/stockEngine.js';
import { randomUUID as uuidv4 } from 'crypto';

function num(n, d = undefined) {
  const v = n == null ? NaN : Number(n);
  return Number.isFinite(v) ? v : d;
}

/** @type {import('./$types').PageServerLoad} */
export async function load({ url, fetch }) {
  const supplierId = num(url.searchParams.get('supplierId'));
  const shade      = (url.searchParams.get('shade') || '').trim();
  const size       = (url.searchParams.get('size')  || '').trim();
  const urlQty     = num(url.searchParams.get('qty'));

  const fromMmaCode = 'PSS_SCREENED';
  const toMmaCode   = 'PSS_SORTED';

  // compute onHand for this exact slot via /api/slots
  let onHand = null;
  try {
    const res = await fetch(`/api/slots?mmaCode=${encodeURIComponent(fromMmaCode)}&positiveOnly=1`);
    const j = await res.json();
    const slots = j.ok ? j.data : [];
    if (supplierId && shade && size) {
      const match = slots.find(
        (s) =>
          Number(s.supplierId) === Number(supplierId) &&
          String(s.shade) === shade &&
          String(s.size) === size
      );
      onHand = match ? Number(match.qty) : 0;
    }
  } catch {
    onHand = null;
  }

  return {
    stationCode: 'PSS',
    lane: `${fromMmaCode} → ${toMmaCode}`,
    fromMmaCode,
    toMmaCode,
    supplierId: supplierId || '',
    shade,
    size,
    urlQty: urlQty || '',
    onHand
  };
}

/** @type {import('./$types').Actions} */
export const actions = {
  sort: async ({ request }) => {
    const form = await request.formData();

    const fromMmaCode  = String(form.get('fromMmaCode') || 'PSS_SCREENED');
    const toMmaCode    = String(form.get('toMmaCode')   || 'PSS_SORTED');
    const supplierId   = num(form.get('supplierId'));
    const fromShade    = String(form.get('fromShade') || '');
    const fromSize     = String(form.get('fromSize')  || '');
    const qty          = num(form.get('qty'));

    // optional process meta
    const wastageRaw   = form.get('wastage'); // %
    const htRaw        = form.get('ht');      // sieve/height

    if (!supplierId)              return fail(400, { error: 'Missing supplierId.' });
    if (!fromShade || !fromSize)  return fail(400, { error: 'Missing source shade/size.' });
    if (!qty || qty <= 0)         return fail(400, { error: 'Qty must be > 0.' });

    const processId = uuidv4();
    const meta = {
      ...(wastageRaw !== '' && wastageRaw != null ? { wastage: Number(wastageRaw) } : {}),
      ...(htRaw !== '' && htRaw != null ? { ht: Number(htRaw) } : {})
    };

    // atomic: withdraw SCREENED, deposit SORTED, same qty/shade/size
    try {
      await stock.withdraw({
        fromMmaCode,
        supplierId,
        shade: fromShade,
        size: fromSize,
        qty,
        processId,
        reason: 'PROCESS',
        meta
      });

      await stock.deposit({
        toMmaCode,
        supplierId,
        shade: fromShade,
        size: fromSize,
        qty,
        processId,
        reason: 'PROCESS',
        meta
      });

      // (optional) If you add a Prisma model for screening, wire it here:
      // if (prisma?.screening_tbl) {
      //   await prisma.screening_tbl.create({
      //     data: {
      //       processId,
      //       fromMmaCode,
      //       toMmaCode,
      //       supplierId,
      //       fromShade: fromShade,
      //       fromSize: fromSize,
      //       toShade: fromShade,
      //       toSize: fromSize,
      //       qtyT: qty,
      //       ht: meta.ht ?? null,
      //       wastage: meta.wastage ?? null
      //     }
      //   });
      // }

      return {
        success: true,
        sorted: { processId },
        posted: { supplierId, fromShade, fromSize, qty, wastage: wastageRaw, ht: htRaw }
      };
    } catch (e) {
      return fail(400, {
        error: 'Sort failed',
        detail: String(e?.message || e),
        posted: { supplierId, fromShade, fromSize, qty, wastage: wastageRaw, ht: htRaw }
      });
    }
  }
};
