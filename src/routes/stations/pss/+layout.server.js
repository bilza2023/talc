// /src/routes/stations/pss/+layout.server.js
export const load = async ({ url }) => {
  const STATION = {
    code: 'PSS',
    name: 'Peshawar (PSS)',
    mmas: [
      { mmaCode: 'PSS_SCREENED', label: 'Screened' },
      { mmaCode: 'PSS_SORTED',   label: 'Sorted'   }
    ],
    cards: [
      // Home actions (keep simple, anchor links only—same style as ABS)
      { icon: '📥', label: 'Receive (ABS → PSS_SCREENED)', href: '/stations/pss/receive_abs_screened' },
      { icon: '🧰', label: 'Sorting (SCREENED → SORTED)',  href: '/stations/pss/sort' },

      // Slots (match your existing route names, like ABS)
      { icon: '📦', label: 'Slots — Screened', href: '/stations/pss/pss_screened' },
      { icon: '📦', label: 'Slots — Sorted',   href: '/stations/pss/pss_sorted' }
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
