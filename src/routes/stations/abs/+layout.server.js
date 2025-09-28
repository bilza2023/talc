// /src/routes/stations/+page.server.js
import { prisma, rawStock, processedStock, sortedStock } from '$lib/stocks/index.js';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
  // Canonical list of stations + their MMAs (codes you already use in pages).
  // If your DB uses PROCESSED codes like 'ABS_PROCESSED', switch those here.
  const stationSpecs = [
    {
      code: 'ABS',
      name: 'Abbottabad (ABS)',
      href: '/stations/abs',
      mmas: [
        { mmaCode: 'ABS_UNSCREENED_RAW', label: 'Unscreened (RAW)' },
        { mmaCode: 'ABS_SCREENED',       label: 'Screened (PROCESSED)' }
      ],
    },
    {
      code: 'PSS',
      name: 'Peshawar (PSS)',
      href: '/stations/pss',
      mmas: [
        { mmaCode: 'PSS_SCREENED', label: 'Screened (PROCESSED)' },
        { mmaCode: 'PSS_SORTED',   label: 'Sorted' }
      ],
    },
    {
      code: 'KEF',
      name: 'Karachi Export (KEF)',
      href: '/stations/kef',
      mmas: [
        { mmaCode: 'KEF_SORTED', label: 'Sorted' }
      ],
    }
  ];

  // Compute inbound counts per MMA, using the right stock family.
  async function inboundCount(mmaCode) {
    if (mmaCode.endsWith('_RAW'))      return (await rawStock.inbound({ mmaCode })).length;
    if (mmaCode.includes('SCREENED'))  return (await processedStock.inbound({ mmaCode })).length;
    if (mmaCode.includes('PROCESSED')) return (await processedStock.inbound({ mmaCode })).length;
    if (mmaCode.includes('SORTED'))    return (await sortedStock.inbound({ mmaCode })).length;
    return 0;
  }

  const stations = [];
  for (const spec of stationSpecs) {
    const inboundCounts = {};
    await Promise.all(spec.mmas.map(async (m) => {
      inboundCounts[m.mmaCode] = await inboundCount(m.mmaCode);
    }));

    stations.push({
      code: spec.code,
      name: spec.name,
      href: spec.href,
      mmas: spec.mmas,
      inboundCounts
    });
  }

  // Simple top-level cards (optional; the station page may not use these).
  const cards = stationSpecs.map(s => ({
    icon: '🏭',
    label: s.name,
    href: s.href,
    desc: 'Open station dashboard'
  }));

  // Basic lists (shared dropdowns if your top page needs them)
  const suppliers   = await prisma.supplier.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true, code: true }});
  const shadeOptions = ['WHITE', 'GREY', 'LIGHTGREY', 'GREEN', 'MIXED'];
  const sizeOptions  = ['LUMPS', 'CHIPS', 'FINE', 'ANY'];

  return { stations, cards, suppliers, shadeOptions, sizeOptions };
}
