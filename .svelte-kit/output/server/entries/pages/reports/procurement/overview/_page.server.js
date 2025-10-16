import { p as prisma } from "../../../../../chunks/stockEngine.js";
function readFilters(urlLike) {
  const u = urlLike instanceof URL ? urlLike : new URL(String(urlLike));
  return {
    station: u.searchParams.get("station") || "",
    // ABS / PSS / KEF
    family: u.searchParams.get("family") || "",
    // RAW / SCREENED
    shade: u.searchParams.get("shade") || "",
    size: u.searchParams.get("size") || "",
    supplierId: u.searchParams.get("supplierId") || "",
    days: u.searchParams.get("days") || "30"
    // default lookback 30d
  };
}
function makeWhere(filters) {
  const { station, family, shade, size, supplierId, days } = filters;
  const where = { reason: "DIRECT" };
  if (station) where.mmaCode = { startsWith: `${station}_` };
  if (family) where.mmaCode = { ...where.mmaCode || {}, endsWith: `_${family}` };
  if (shade) where.shade = shade;
  if (size) where.size = size;
  if (supplierId) where.supplierId = Number(supplierId);
  if (days) {
    const d = Number(days);
    if (!Number.isNaN(d) && d > 0) {
      const start = new Date(Date.now() - d * 24 * 60 * 60 * 1e3);
      where.createdAt = { gte: start };
    }
  }
  return where;
}
const stationOf = (mma) => String(mma).split("_")[0] || "UNK";
const familyOf = (mma) => String(mma).split("_")[1] || "UNK";
const load = async ({ url }) => {
  const filters = readFilters(url);
  const where = makeWhere(filters);
  const purchases = await prisma.stockLedger.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: {
      createdAt: true,
      mmaCode: true,
      supplierId: true,
      shade: true,
      size: true,
      qtyDelta: true
    },
    take: 5e3
    // safety cap for UI; adjust if needed
  });
  const totalQty = purchases.reduce((s, r) => s + Number(r.qtyDelta ?? 0), 0);
  const days = Number(filters.days) || 30;
  const avgPerDay = totalQty / days;
  const supplierSet = new Set(purchases.map((r) => r.supplierId));
  const supplierCount = supplierSet.size;
  const lbMap = /* @__PURE__ */ new Map();
  for (const r of purchases) {
    const id = Number(r.supplierId);
    const cur = lbMap.get(id) || 0;
    lbMap.set(id, cur + Number(r.qtyDelta ?? 0));
  }
  const leaderboardRaw = [...lbMap.entries()].map(([supplierId, qty]) => ({ supplierId, qty })).sort((a, b) => b.qty - a.qty);
  const supplierIds = leaderboardRaw.map((x) => x.supplierId);
  const supplierNameMap = supplierIds.length ? new Map(
    (await prisma.supplier.findMany({
      where: { id: { in: supplierIds } },
      select: { id: true, name: true }
    })).map((s) => [s.id, s.name])
  ) : /* @__PURE__ */ new Map();
  const leaderboard = leaderboardRaw.map((r) => ({
    supplierId: r.supplierId,
    supplierName: supplierNameMap.get(r.supplierId) || `S${r.supplierId}`,
    qty: r.qty
  }));
  const top = leaderboard[0] || null;
  const heat = {};
  for (const r of purchases) {
    const st = stationOf(r.mmaCode);
    const fam = familyOf(r.mmaCode);
    heat[st] ??= {};
    heat[st][fam] = (heat[st][fam] ?? 0) + Number(r.qtyDelta ?? 0);
  }
  const families = ["RAW", "SCREENED", "SORTED", "PRODUCTION"];
  const heatRows = Object.entries(heat).map(([station, cols]) => {
    const row = { station };
    let total = 0;
    for (const f of families) {
      const v = Number(cols[f] ?? 0);
      row[f] = v;
      total += v;
    }
    row.total = total;
    return row;
  }).sort((a, b) => b.total - a.total);
  const recent = purchases.slice(0, 25).map((r) => ({
    date: r.createdAt,
    mmaCode: r.mmaCode,
    supplierId: r.supplierId,
    shade: r.shade,
    size: r.size,
    qty: Number(r.qtyDelta ?? 0)
  }));
  const stations = Array.from(new Set(purchases.map((p) => stationOf(p.mmaCode)))).sort();
  const famOpts = Array.from(new Set(purchases.map((p) => familyOf(p.mmaCode)))).sort();
  const shades = Array.from(new Set(purchases.map((p) => p.shade))).sort();
  const sizes = Array.from(new Set(purchases.map((p) => p.size))).sort();
  const supOpts = Array.from(supplierSet).map(String).sort();
  const daysOpts = ["", "7", "30", "90", "365"];
  return {
    filters,
    options: { stations, families: famOpts, shades, sizes, supOpts, daysOpts },
    kpis: [
      { label: "Purchases", value: `${totalQty.toFixed(1)} t`, icon: "🧾" },
      { label: "Avg / Day", value: `${avgPerDay.toFixed(1)} t`, icon: "📈" },
      { label: "Suppliers Active", value: `${supplierCount}`, icon: "👷" },
      { label: "Top Supplier", value: top ? `${top.qty.toFixed(1)} t` : "—", sub: top ? top.supplierName : "", icon: "🏆" }
    ],
    heatRows,
    families,
    leaderboard,
    recent
  };
};
export {
  load
};
