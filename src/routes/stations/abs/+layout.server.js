// /src/routes/stations/abs/+layout.server.js
export const load = async ({ url }) => {
  const STATION = {
    code: 'ABS',
    name: 'Abbottabad (ABS)',
    mmas: [
      { mmaCode: 'ABS_RAW',      label: 'Unscreened (RAW)' },
      { mmaCode: 'ABS_SCREENED', label: 'Screened' }
    ],
    cards: [
      { icon: '🧾', label: 'Purchase (Unscreened)', href: '/stations/abs/purchase_unscreened' },
      { icon: '🧾', label: 'Purchase (Screened)',   href: '/stations/abs/purchase_screened' },
      { icon: '📦', label: 'Slots — Unscreened',    href: '/stations/abs/abs_unscreened_raw' },
      { icon: '📦', label: 'Slots — Screened',      href: '/stations/abs/abs_screened' },
      { icon: '🚚', label: 'Dispatch → PSS',        href: '/stations/abs/dispatch_pss_screened' },
      { icon: '🚚', label: 'Dispatch → KEF',        href: '/stations/abs/dispatch_kef_screened' }
    ]
  };

  return {
    stationCode: STATION.code,
    stationName: STATION.name,
    mmas: STATION.mmas,
    cards: STATION.cards,
    fromUrl: Object.fromEntries(url.searchParams.entries())
  };
};
