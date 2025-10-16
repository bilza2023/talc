import { p as prisma } from "../../../../../chunks/stockEngine.js";
const stationOf = (mma) => String(mma).split("_")[0] || "UNK";
const familyOf = (mma) => String(mma).split("_")[1] || "UNK";
const load = async () => {
  const byMma = await prisma.stockLedger.groupBy({
    by: ["mmaCode"],
    _sum: { qtyDelta: true }
  });
  const mmaBalances = byMma.map((r) => ({ mmaCode: r.mmaCode, qty: Number(r._sum.qtyDelta ?? 0) })).filter((r) => r.qty > 0);
  const totalOnHand = mmaBalances.reduce((s, r) => s + r.qty, 0);
  const bySlot = await prisma.stockLedger.groupBy({
    by: ["mmaCode", "supplierId", "shade", "size"],
    _sum: { qtyDelta: true }
  });
  const slotRows = bySlot.map((r) => ({
    mmaCode: r.mmaCode,
    supplierId: Number(r.supplierId),
    shade: r.shade,
    size: r.size,
    qty: Number(r._sum.qtyDelta ?? 0)
  }));
  const positiveSlots = slotRows.filter((r) => r.qty > 0);
  const activeSuppliers = new Set(positiveSlots.map((r) => r.supplierId)).size;
  const largest = positiveSlots.reduce((max, r) => r.qty > (max?.qty ?? -Infinity) ? r : max, null);
  const skuKey = (r) => `${r.shade}::${r.size}`;
  const skuCount = new Set(positiveSlots.map(skuKey)).size;
  const heat = {};
  for (const r of mmaBalances) {
    const st = stationOf(r.mmaCode);
    const fam = familyOf(r.mmaCode);
    heat[st] ??= {};
    heat[st][fam] = (heat[st][fam] ?? 0) + r.qty;
  }
  const families = ["RAW", "SCREENED", "SORTED", "PRODUCTION"];
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
  }).sort((a, b) => b.total - a.total);
  const topSlots = positiveSlots.sort((a, b) => b.qty - a.qty).slice(0, 25);
  return {
    kpis: [
      { label: "On-Hand", value: `${totalOnHand.toFixed(1)} t`, icon: "📦" },
      { label: "Active Suppliers", value: `${activeSuppliers}`, icon: "👷" },
      { label: "Largest Slot", value: largest ? `${largest.qty.toFixed(1)} t` : "0", sub: largest ? `${largest.mmaCode} • S${largest.supplierId} • ${largest.shade}/${largest.size}` : "", icon: "🏆" },
      { label: "SKUs", value: `${skuCount}`, sub: "shade × size", icon: "🔢" }
    ],
    heatRows,
    families,
    topSlots
  };
};
export {
  load
};
