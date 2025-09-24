// /src/routes/actions/deposit/+page.server.js
import { stations } from '$lib/stations/stations.js';
import { rawStock, processedStock, sortedStock } from '$lib/stocks/index.js';

const STOCK_MAP = { rawStock, processedStock, sortedStock };

export async function load({ url }) {
  const stationCode = url.searchParams.get('station');
  const mmaCode = url.searchParams.get('mma');

  const station = stations[stationCode];
  const mma = station?.mmas.find(m => m.mmaCode === mmaCode);

  return {
    stationCode,
    mmaCode,
    stockKey: mma?.stock ?? null,
    error: !station || !mma ? 'Invalid station or MMA' : null,
  };
}

export const actions = {
  default: async ({ request }) => {
    const form = await request.formData();
    const stationCode = form.get('stationCode');
    const mmaCode = form.get('mmaCode');
    const supplierId = Number(form.get('supplierId'));
    const shade = form.get('shade');
    const size = form.get('size');
    const qty = Number(form.get('qty'));

    const station = stations[stationCode];
    const mma = station?.mmas.find(m => m.mmaCode === mmaCode);
    if (!station || !mma) {
      return { success: false, error: 'Invalid station/MMA' };
    }

    const stock = STOCK_MAP[mma.stock];
    await stock.deposit({
      toMmaCode: mma.mmaCode,
      supplierId,
      shade,
      size,
      qty,
      toStationCode: station.stationCode,
    });

    return { success: true };
  },
};
