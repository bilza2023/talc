// /src/routes/stations/<station>/+layout.server.js
import { prisma, rawStock, processedStock, sortedStock } from '$lib/stocks/index.js';

/**
 * ── EDIT ONLY THIS CONFIG ─────────────────────────────────────────────────────
 * Change `code`, `name`, `mmas`, and `cards` per station.
 * Use SCREENED everywhere (no PROCESSED in codes).
 *
 * EXAMPLES:
 * ABS:
 *   code: 'ABS', name: 'Abbottabad (ABS)'
 *   mmas: [{ mmaCode:'ABS_UNSCREENED_RAW', label:'Unscreened (RAW)' },
 *          { mmaCode:'ABS_SCREENED',       label:'Screened' }]
 *   cards: [
 *     { icon:'🧾', label:'Purchase (Unscreened)', href:'/stations/abs/purchase_unscreened' },
 *     { icon:'🧾', label:'Purchase (Screened)',   href:'/stations/abs/purchase_screened'   },
 *     { icon:'🧰', label:'Screening (RAW → SCREENED)', href:'/stations/abs/screening'      },
 *     { icon:'🚚', label:'Dispatch → PSS (Screened)', href:'/stations/abs/dispatch_pss_screened' },
 *     { icon:'🚚', label:'Dispatch → KEF (Sorted)',   href:'/stations/abs/dispatch_kef_sorted'   },
 *     { icon:'📦', label:'Slots — Unscreened', href:'/stations/abs/slots?mma=ABS_UNSCREENED_RAW' },
 *     { icon:'📦', label:'Slots — Screened',   href:'/stations/abs/slots?mma=ABS_SCREENED'       },
 *   ]
 *
 * PSS:
 *   code: 'PSS', name: 'Peshawar (PSS)'
 *   mmas: [{ mmaCode:'PSS_SCREENED', label:'Screened' },
 *          { mmaCode:'PSS_SORTED',   label:'Sorted'   }]
 *   cards: [
 *     { icon:'📥', label:'Receive (ABS → PSS_SCREENED)', href:'/stations/pss/receive_screened' },
 *     { icon:'🧰', label:'Sorting (SCREENED → SORTED)',  href:'/stations/pss/sort'             },
 *     { icon:'🚚', label:'Dispatch (PSS_SORTED → KEF)',  href:'/stations/pss/dispatch_kef_sorted' },
 *     { icon:'📦', label:'Slots — Screened', href:'/stations/pss/slots?mma=PSS_SCREENED' },
 *     { icon:'📦', label:'Slots — Sorted',   href:'/stations/pss/slots?mma=PSS_SORTED'   },
 *   ]
 *
 * KEF:
 *   code: 'KEF', name: 'Karachi Export (KEF)'
 *   mmas: [{ mmaCode:'KEF_SORTED', label:'Sorted' }]
 *   cards: [
 *     { icon:'📥', label:'Receive (… → KEF_SORTED)', href:'/stations/kef/receive_sorted' },
 *     { icon:'📦', label:'Slots — Sorted',           href:'/stations/kef/slots?mma=KEF_SORTED' },
 *   ]
 * ──────────────────────────────────────────────────────────────────────────────
 */
const STATION = {
  code: 'PSS',
  name: 'Peshawar (PSS)',
  mmas: [
    { mmaCode: 'PSS_SCREENED', label: 'Screened' },
    { mmaCode: 'PSS_SORTED',   label: 'Sorted'   }
  ],
  cards: [
    { icon: '📦', label: 'Slots — Sorted',   href: '/stations/pss/pss_sorted'   },
    { icon: '📦', label: 'Slots — Screened', href: '/stations/pss/pss_screened' },
  
    { icon: '📥', label: 'Receive (ABS → PSS_SCREENED)', href: '/stations/pss/receive_abs_screened' },
    { icon: '🧰', label: 'Sorting (SCREENED → SORTED)',  href: '/stations/pss/sort'             },
  
  ],
};
/** ─────────────────────────────────────────────────────────────────────────── */

function stockFor(mmaCode) {
  if (/_RAW$/.test(mmaCode))       return rawStock;
  if (/_SCREENED$/.test(mmaCode))  return processedStock;
  if (/_SORTED$/.test(mmaCode))    return sortedStock;
  // Default: treat unknown as processed-screened family
  return processedStock;
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

  // Inbound counts keyed by exact mmaCode (must match mmas[].mmaCode)
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
