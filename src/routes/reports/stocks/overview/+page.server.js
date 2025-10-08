// Live Stocks Overview — KPIs, heat (station×family), top slots
import { prisma } from '$lib/stocks/stockEngine.js';

// helpers
const stationOf = (mma) => String(mma).split('_')[0] || 'UNK';
const familyOf  = (mma) => String(mma).split('_')[1] || 'UNK';

export const load = async () => {
  // 1) On-hand totals per MMA
  const byMma = await prisma.stockLedger.groupBy({
    by: ['mmaCode'],
    _sum: { qtyDelta: true }
  });

  // keep only positive on-hand for displays
  const mmaBalances = byMma
    .map(r => ({ mmaCode: r.mmaCode, qty: Number(r._sum.qtyDelta ?? 0) }))
    .filter(r => r.qty > 0);

  // 2) KPIs
  const totalOnHand = mmaBalances.reduce((s, r) => s + r.qty, 0);

  // Active suppliers with positive on-hand (distinct supplierId where Σ>0)
  const bySlot = await prisma.stockLedger.groupBy({
    by: ['mmaCode','supplierId','shade','size'],
    _sum: { qtyDelta: true }
  });
  const slotRows = bySlot.map(r => ({
    mmaCode: r.mmaCode,
    supplierId: Number(r.supplierId),
    shade: r.shade,
    size: r.size,
    qty: Number(r._sum.qtyDelta ?? 0)
  }));
  const positiveSlots = slotRows.filter(r => r.qty > 0);

  const activeSuppliers = new Set(positiveSlots.map(r => r.supplierId)).size;

  // Largest single slot
  const largest = positiveSlots.reduce((max, r) => r.qty > (max?.qty ?? -Infinity) ? r : max, null);

  // # SKUs (distinct shade×size with qty>0)
  const skuKey = (r) => `${r.shade}::${r.size}`;
  const skuCount = new Set(positiveSlots.map(skuKey)).size;

  // 3) Station × Family heat (sum on-hand)
  const heat = {};
  for (const r of mmaBalances) {
    const st = stationOf(r.mmaCode);
    const fam = familyOf(r.mmaCode);
    heat[st] ??= {};
    heat[st][fam] = (heat[st][fam] ?? 0) + r.qty;
  }
  // normalize to array rows for the UI table: {station, RAW, SCREENED, SORTED, PRODUCTION, total}
  const families = ['RAW','SCREENED','SORTED','PRODUCTION'];
  const heatRows = Object.entries(heat).map(([st, cols]) => {
    const row = { station: st };
    let tot = 0;
    for (const f of families) {
      const v = Number(cols[f] ?? 0);
      row[f] = v;
      tot += v;
    }
    row.total = tot;
    return row;
  }).sort((a,b) => b.total - a.total);

  // 4) Top slots table (largest 25 slots)
  const topSlots = positiveSlots
    .sort((a,b) => b.qty - a.qty)
    .slice(0, 25);

  return {
    kpis: [
      { label: 'On-Hand', value: `${totalOnHand.toFixed(1)} t`, icon: '📦' },
      { label: 'Active Suppliers', value: `${activeSuppliers}`, icon: '👷' },
      { label: 'Largest Slot', value: largest ? `${largest.qty.toFixed(1)} t` : '0', sub: largest ? `${largest.mmaCode} • S${largest.supplierId} • ${largest.shade}/${largest.size}` : '', icon: '🏆' },
      { label: 'SKUs', value: `${skuCount}`, sub: 'shade × size', icon: '🔢' },
    ],
    heatRows,
    families,
    topSlots
  };
};
