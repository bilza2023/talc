// /src/routes/stations/abs/+layout.server.js
import Abs from '$lib/core/abs/abs.js';

export const load = async () => {
  // ensure names are present
  const suppliers =
    (Abs.suppliers ?? [{ id: 263 }, { id: 264 }, { id: 265 }]).map(s => ({
      id: s.id,
      name: s.name ?? String(s.id)
    }));
  const shades = Abs.shades ?? ['WHITE', 'GREY', 'LIGHTGREY', 'GREEN', 'MIXED'];
  const sizes  = Abs.sizes  ?? ['LUMPS', 'CHIPS', 'FINE'];

  const defaults = {
    supplierId: suppliers[0]?.id ?? '',
    shade:      shades[0] ?? '',
    size:       sizes[0] ?? '',
    qty:        ''
  };

  return {
    stationName: 'Abbottabad Sorting Station',
    stationCode: Abs.code,
    mmaCode:     Abs.mmaCode,
    suppliers,
    shades,
    sizes,
    defaults
  };
};
