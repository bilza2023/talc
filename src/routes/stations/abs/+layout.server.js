// /src/routes/stations/abs/+layout.server.js
import { prisma, rawStock, processedStock, sortedStock } from '$lib/stocks/index.js';

// ── Station config (edit only this block) ─────────────────────────────────────
const STATION = {
  code: 'ABS',
  name: 'Abbottabad (ABS)',
  mmas: [
    { mmaCode: 'ABS_UNSCREENED_RAW', label: 'Unscreened (RAW)' },
    { mmaCode: 'ABS_SCREENED',       label: 'Screened' }
  ],
  cards: [
    { icon: '🧾', label: 'Purchase (Unscreened)', href: '/stations/abs/purchase_unscreened' },
    { icon: '🧾', label: 'Purchase (Screened)',   href: '/stations/abs/purchase_screened'   },
    // { icon: '🧰', label: 'Screening (RAW → SCREENED)', href: '/stations/abs/screening'      },
    // Dispatch from ABS_SCREENED → PSS_SORTED / KEF_SORTED
    // { icon: '🚚', label: 'Dispatch → PSS (to SORTED)', href: '/stations/abs/dispatch_pss_sorted' },
    // { icon: '🚚', label: 'Dispatch → KEF (to SORTED)', href: '/stations/abs/dispatch_kef_sorted' },
    { icon: '📦', label: 'Slots — Unscreened', href: '/stations/abs/abs_unscreened_raw' },
    { icon: '📦', label: 'Slots — Screened',   href: '/stations/abs/abs_screened'       },
  ],
};
// ─────────────────────────────────────────────────────────────────────────────

// Maps MMA code suffix to the right stock API (RAW/SCREENED/SORTED)
function stockFor(mmaCode) {
  if (/_RAW$/.test(mmaCode))       return rawStock;
  if (/_SCREENED$/.test(mmaCode))  return processedStock;
  if (/_SORTED$/.test(mmaCode))    return sortedStock;
  return processedStock; // default family
}

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ url }) {
  // Shared lists
  const suppliers = await prisma.supplier.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, code: true }
  });
  const shadeOptions = ['WHITE', 'GREY', 'LIGHTGREY', 'GREEN', 'MIXED'];
  const sizeOptions  = ['LUMPS', 'CHIPS', 'FINE', 'ANY'];

  // Inbound counts per MMA
  const inboundCounts = {};
  await Promise.all(
    STATION.mmas.map(async (m) => {
      const api = stockFor(m.mmaCode);
      const rows = await api.inbound({ mmaCode: m.mmaCode });
      inboundCounts[m.mmaCode] = rows.length;
    })
  );

  const fromUrl = Object.fromEntries(url.searchParams.entries());

  return {
    stationCode: STATION.code,
    stationName: STATION.name,
    suppliers,
    shadeOptions,
    sizeOptions,
    mmas: STATION.mmas,
    inboundCounts,
    cards: STATION.cards,
    fromUrl
  };
}
