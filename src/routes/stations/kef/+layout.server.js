
// /src/routes/stations/kef/+layout.server.js
import { prisma, rawStock, processedStock, sortedStock } from '$lib/stocks/index.js';

// ── Station config (edit only this block) ─────────────────────────────────────
const STATION = {
  code: 'KEF',
  name: 'Khanpur (KEF)',
  mmas: [
    { mmaCode: 'KEF_SORTED', label: 'Sorted' }
  ],
  cards: [
    // Receives into KEF_SORTED
    { icon: '📥', label: 'Receive ← ABS (SCREENED → SORTED)', href: '/stations/kef/receive_abs_sorted' },
    { icon: '📥', label: 'Receive ← PSS (SORTED → SORTED)',   href: '/stations/kef/receive_pss_sorted' },
    { icon: '📦', label: 'Slots — Sorted',                     href: '/stations/kef/slots?mma=KEF_SORTED' },
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
  // Shared lists (kept for consistency with other station layouts)
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
