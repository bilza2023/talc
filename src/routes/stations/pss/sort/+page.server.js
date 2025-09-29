
// /src/routes/stations/pss/sort/+page.server.js
import { fail } from '@sveltejs/kit';

// StationKit (registry + helpers)
import { STATION, FAMILY } from '$lib/stationKit';
import { getMma } from '$lib/stationKit';
import { makeFacade } from '$lib/stationKit';

// Use the process helper so sorting_tbl is recorded
import sorting from '$lib/processes/sorting.js';

const STATION_CODE = STATION.PSS;
const FROM_FAMILY  = FAMILY.SCREENED; // UI: "Screened"
const TO_FAMILY    = FAMILY.SORTED;   // UI: "Sorted"

function num(n, d = undefined) {
  const v = n == null ? NaN : Number(n);
  return Number.isFinite(v) ? v : d;
}

export async function load({ url }) {
  const supplierId = num(url.searchParams.get('supplierId'));
  const shade      = (url.searchParams.get('shade') || '').trim();
  const size       = (url.searchParams.get('size')  || '').trim();
  const urlQty     = num(url.searchParams.get('qty'));

  const fromMma = getMma(STATION_CODE, FROM_FAMILY); // e.g. { mmaCode: 'PSS_SCREENED', ... }
  const toMma   = getMma(STATION_CODE, TO_FAMILY);   // e.g. { mmaCode: 'PSS_SORTED', ... }

  // If a slot is targeted, fetch on-hand for display
  let onHand = null;
  if (supplierId && shade && size) {
    const facade = makeFacade(STATION_CODE);
    onHand = await facade.onHand({
      family: FROM_FAMILY,
      supplierId,
      shade,
      size
    });
  }

  return {
    stationCode: STATION_CODE,
    lane: `${fromMma.mmaCode} → ${toMma.mmaCode}`,
    fromMmaCode: fromMma.mmaCode,
    toMmaCode: toMma.mmaCode,

    // Pre-fill section
    supplierId: supplierId || '',
    shade,
    size,
    urlQty: urlQty || '',

    // Read-only display
    onHand
  };
}

export const actions = {
  // POST ?/sort
  sort: async ({ request }) => {
    const form = await request.formData();

    // Required (hidden + visible)
    const stationCode  = String(form.get('stationCode') || STATION_CODE);
    const fromMmaCode  = String(form.get('fromMmaCode'));
    const toMmaCode    = String(form.get('toMmaCode'));
    const supplierId   = num(form.get('supplierId'));
    const fromShade    = String(form.get('fromShade') || '');
    const fromSize     = String(form.get('fromSize')  || '');
    const qty          = num(form.get('qty'));

    // Meta (visible)
    const wastageRaw   = form.get('wastage');
    const htRaw        = form.get('ht');

    if (!fromMmaCode || !toMmaCode) return fail(400, { error: 'Missing lane (mma codes).' });
    if (!supplierId)                  return fail(400, { error: 'Missing supplierId.' });
    if (!fromShade || !fromSize)     return fail(400, { error: 'Missing source shade/size.' });
    if (!qty || qty <= 0)            return fail(400, { error: 'Qty must be > 0.' });

    try {
      // Route through the process helper so sorting_tbl is written
      const result = await sorting({
        fromMmaCode,
        toMmaCode,
        supplierId,
        from: { shade: fromShade, size: fromSize, qtyT: qty, stationCode },
        to:   { shade: fromShade, size: fromSize, qtyT: qty, stationCode }, // same bucket by default
        meta: {
          // include only if provided
          ...(wastageRaw !== '' && wastageRaw != null ? { wastage: Number(wastageRaw) } : {}),
          ...(htRaw !== '' && htRaw != null ? { ht: Number(htRaw) } : {})
        }
      });

      return {
        success: true,
        sorted: { processId: result.processId },
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
