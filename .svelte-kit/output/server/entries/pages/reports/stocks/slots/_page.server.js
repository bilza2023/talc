import { p as prisma } from "../../../../../chunks/stockEngine.js";
function pickFilters(url) {
  const u = new URL(url);
  const station = u.searchParams.get("station") || "";
  const family = u.searchParams.get("family") || "";
  const shade = u.searchParams.get("shade") || "";
  const size = u.searchParams.get("size") || "";
  return { station, family, shade, size };
}
const load = async ({ url }) => {
  const { station, family, shade, size } = pickFilters(url);
  const where = {
    ...station ? { mmaCode: { startsWith: `${station}_` } } : {},
    ...family ? { mmaCode: { endsWith: `_${family}` } } : {},
    ...shade ? { shade } : {},
    ...size ? { size } : {}
  };
  const grouped = await prisma.stockLedger.groupBy({
    by: ["mmaCode", "supplierId", "shade", "size"],
    where,
    _sum: { qtyDelta: true }
  });
  const slots = grouped.map((r) => ({
    mmaCode: r.mmaCode,
    supplierId: Number(r.supplierId),
    shade: r.shade,
    size: r.size,
    qty: Number(r._sum.qtyDelta ?? 0)
  })).filter((r) => r.qty > 0).sort((a, b) => b.qty - a.qty);
  const supplierIds = Array.from(new Set(slots.map((s) => s.supplierId)));
  const suppliers = supplierIds.length ? await prisma.supplier.findMany({ where: { id: { in: supplierIds } }, select: { id: true, name: true } }) : [];
  const supName = new Map(suppliers.map((s) => [s.id, s.name]));
  const rows = slots.map((s) => ({ ...s, supplierName: supName.get(s.supplierId) || `S${s.supplierId}` }));
  const totalQty = rows.reduce((sum, r) => sum + r.qty, 0);
  const slotCount = rows.length;
  const stations = Array.from(new Set(rows.map((r) => String(r.mmaCode).split("_")[0]))).sort();
  const families = Array.from(new Set(rows.map((r) => String(r.mmaCode).split("_")[1]))).sort();
  const shades = Array.from(new Set(rows.map((r) => r.shade))).sort();
  const sizes = Array.from(new Set(rows.map((r) => r.size))).sort();
  return {
    filters: { station, family, shade, size },
    options: {
      stations,
      // e.g., ['ABS','PSS','KEF']
      families,
      // e.g., ['RAW','SCREENED','SORTED','PRODUCTION']
      shades,
      sizes
    },
    kpis: [
      { label: "Total On-Hand (filtered)", value: `${totalQty.toFixed(1)} t`, icon: "📦" },
      { label: "Slots", value: `${slotCount}`, icon: "🗂️" },
      { label: "Avg/Slot", value: slotCount ? `${(totalQty / slotCount).toFixed(1)} t` : "0.0 t", icon: "➗" },
      { label: "Filters", value: [station || "All", family || "All", shade || "All", size || "All"].join(" • "), icon: "🎛️" }
    ],
    rows
  };
};
export {
  load
};
