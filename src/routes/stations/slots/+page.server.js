// 
// /src/routes/stations/slots/+page.server.js
import { stations } from '$lib/stations/stations.js';
import { rawStock, processedStock, sortedStock } from '$lib/stocks/index.js';

const STOCK_MAP = { rawStock, processedStock, sortedStock };

export async function load({ url }) {
  const stationCode = url.searchParams.get('station');
  const mmaCode = url.searchParams.get('mma');

  const station = stations[stationCode];
  const mma = station?.mmas.find((m) => m.mmaCode === mmaCode);

  if (!station || !mma) {
    return { error: 'Invalid station or MMA', stationCode, mmaCode, slots: [] };
  }

  const stock = STOCK_MAP[mma.stock];
  if (!stock) {
    return { error: `Unknown stock engine: ${mma.stock}`, stationCode, mmaCode, slots: [] };
  }

  // Active-only slots (exactly what the ledger has with positive qty)
  const slots = await stock.slots({
    mmaCode: mma.mmaCode,
    positiveOnly: true
  });

  // Small quality-of-life bits for the UI
  const isRaw = mma.stock === 'rawStock';
  const onHand = await stock.onHand({ mmaCode: mma.mmaCode }).catch(() => null);

  // Sort: qty desc, then supplier/shade/size
  slots.sort((a, b) => {
    const qa = Number(a.qty || 0), qb = Number(b.qty || 0);
    if (qb !== qa) return qb - qa;
    if (a.supplierId !== b.supplierId) return a.supplierId - b.supplierId;
    if (a.shade !== b.shade) return a.shade.localeCompare(b.shade);
    return a.size.localeCompare(b.size);
  });

  return {
    stationCode,
    mmaCode,
    stockKey: mma.stock,
    isRaw,
    onHand,
    slots
  };
}
