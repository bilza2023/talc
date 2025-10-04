// KEF station home loader
export const load = async ({ url }) => {
  const STATION = {
    code: 'KEF',
    name: 'Kohat (KEF)',
    mmas: [
      { mmaCode: 'KEF_SORTED', label: 'Sorted' }
    ],
    cards: [
      // Home actions
      { icon: '📥', label: 'Receive (PSS_SORTED → KEF_SORTED)', href: '/stations/kef/receive_pss_sorted' },

      // Slots
      { icon: '📦', label: 'Slots — Sorted', href: '/stations/kef/kef_sorted' }
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
