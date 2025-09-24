// /src/routes/actions/dispatch/+page.server.js
import { stations } from '$lib/stations/stations.js';
import { rawStock, processedStock, sortedStock } from '$lib/stocks/index.js';

const STOCK_MAP = { rawStock, processedStock, sortedStock };

function findMma(stationCode, mmaCode) {
  const st = stations[stationCode];
  if (!st) return null;
  return st.mmas.find((m) => m.mmaCode === mmaCode) || null;
}

export async function load({ url }) {
  const stationCode = url.searchParams.get('station') || '';
  const mmaCode     = url.searchParams.get('mma') || '';

  const supplierId  = url.searchParams.get('supplierId') || '';
  const shade       = url.searchParams.get('shade') || '';
  const size        = url.searchParams.get('size') || '';

  // REQUIRED: destination (internal transfer only)
  const toStationCode = url.searchParams.get('toStation') || '';
  const toMmaCode     = url.searchParams.get('toMma') || '';

  const fromMma = findMma(stationCode, mmaCode);
  const toMma   = findMma(toStationCode, toMmaCode);

  if (!fromMma) {
    return { error: 'Invalid source station/MMA', stationCode, mmaCode };
  }
  if (!toMma) {
    return { error: 'Destination (toStation,toMma) is required and must be valid', stationCode, mmaCode, toStationCode, toMmaCode };
  }

  const stock = STOCK_MAP[fromMma.stock];
  if (!stock) {
    return { error: `Unknown stock engine: ${fromMma.stock}`, stationCode, mmaCode };
  }

  // Current qty for this exact slot (hint only)
  let currentQty = 0;
  try {
    const slots = await stock.slots({ mmaCode: fromMma.mmaCode, positiveOnly: true });
    const match = slots.find(
      s => String(s.supplierId) === String(supplierId) && s.shade === shade && s.size === size
    );
    currentQty = Number(match?.qty || 0);
  } catch (_) {/* non-fatal */}

  return {
    error: null,
    stationCode, mmaCode,
    stockKey: fromMma.stock,
    supplierId, shade, size,
    toStationCode, toMmaCode,
    currentQty
  };
}

export const actions = {
  default: async ({ request }) => {
    const form = await request.formData();

    const stationCode   = String(form.get('stationCode') || '');
    const mmaCode       = String(form.get('mmaCode') || '');
    const supplierId    = Number(form.get('supplierId'));
    const shade         = String(form.get('shade') || '');
    const size          = String(form.get('size') || '');
    const qty           = Number(form.get('qty'));
    const toStationCode = String(form.get('toStationCode') || '');
    const toMmaCode     = String(form.get('toMmaCode') || '');

    const fromMma = findMma(stationCode, mmaCode);
    const toMma   = findMma(toStationCode, toMmaCode);

    if (!fromMma) return { success: false, error: 'Invalid source station/MMA' };
    if (!toMma)   return { success: false, error: 'Invalid destination station/MMA' };
    if (!supplierId || !shade || !size || !qty || qty <= 0) {
      return { success: false, error: 'Enter a positive quantity.' };
    }

    const stock = STOCK_MAP[fromMma.stock];
    if (!stock) return { success: false, error: `Unknown stock engine: ${fromMma.stock}` };

    // Internal transfer ONLY (Stock.dispatch requires toMmaCode)
    await stock.dispatch({
      fromMmaCode: fromMma.mmaCode,
      toMmaCode,
      supplierId,
      shade,
      size,
      qty,
      fromStationCode: stationCode || null,
      toStationCode: toStationCode || null
    });

    return {
      success: true,
      posted: { stationCode, mmaCode, supplierId, shade, size, qty, toStationCode, toMmaCode }
    };
  }
};
