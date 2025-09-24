// /src/routes/stations/pss/+page.server.js
import { stations } from '$lib/stations/stations.js';
import { rawStock, processedStock, sortedStock } from '$lib/stocks/index.js';

const STOCK_MAP = { rawStock, processedStock, sortedStock };

export async function load() {
  const station = stations.PSS; // hard-coded since this is /stations/pss
  if (!station) {
    return { stationCode: 'PSS', error: 'Station not found' };
  }

  const mmaData = [];
  for (const mma of station.mmas) {
    const stock = STOCK_MAP[mma.stock];
    if (!stock) continue;

    const onHand = await stock.onHand({ mmaCode: mma.mmaCode });
    const slots = await stock.slots({ mmaCode: mma.mmaCode });
    const inbound = await stock.inbound({ mmaCode: mma.mmaCode });
    const outbound = await stock.outbound({ mmaCode: mma.mmaCode });

    mmaData.push({
      mmaCode: mma.mmaCode,
      stockKey: mma.stock,
      onHand,
      slots,
      inbound,
      outbound
    });
  }

  return {
    stationCode: station.stationCode,
    mmas: mmaData
  };
}
