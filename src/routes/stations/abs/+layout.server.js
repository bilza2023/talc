
import { prisma, rawStock, screenedStock, sortedStock } from '$lib/stocks/index.js';
import createSupplierService from '$lib/services/supplierService.js';

const suppliersSvc = createSupplierService(prisma);

const STATION = {
  code: 'ABS',
  name: 'Abbottabad (ABS)',
  mmas: [
    { mmaCode: 'ABS_RAW',      label: 'Unscreened (RAW)' },
    { mmaCode: 'ABS_SCREENED', label: 'Screened' },
  ],
  cards: [
    { icon: '🧾', label: 'Purchase (Unscreened)', href: '/stations/abs/purchase_unscreened' },
    { icon: '🧾', label: 'Purchase (Screened)',   href: '/stations/abs/purchase_screened' },
    { icon: '📦', label: 'Slots — Unscreened',    href: '/stations/abs/abs_unscreened_raw' },
    { icon: '📦', label: 'Slots — Screened',      href: '/stations/abs/abs_screened' },
    { icon: '🚚', label: 'Dispatch → PSS',        href: '/stations/abs/dispatch_pss_screened' },
    { icon: '🚚', label: 'Dispatch → KEF',        href: '/stations/abs/dispatch_kef_screened' },
  ],
};

function stockFor(mmaCode) {
  if (mmaCode.includes('RAW'))       return rawStock;
  if (mmaCode.includes('SCREENED'))  return screenedStock;
  if (mmaCode.includes('SORTED'))    return sortedStock;
  throw new Error(`Unknown MMA code: ${mmaCode}`);
}

export const load = async ({ url }) => {
  const suppliers =
    typeof suppliersSvc.list === 'function'
      ? await suppliersSvc.list()
      : await suppliersSvc.all?.() ?? [];

  const shadeOptions = ['WHITE', 'GREY', 'LIGHTGREY', 'GREEN', 'MIXED'];
  const sizeOptions  = ['LUMPS', 'CHIPS', 'FINE', 'ANY'];

  const inboundCounts = {};
  await Promise.all(
    STATION.mmas.map(async ({ mmaCode }) => {
      const api  = stockFor(mmaCode);
      const rows = await api.inbound({ mmaCode });
      inboundCounts[mmaCode] = rows.length;
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
    fromUrl,
  };
};
