import { p as prisma } from "../../../../../chunks/stockEngine.js";
function readFilters(urlLike) {
  const u = urlLike instanceof URL ? urlLike : new URL(String(urlLike));
  return {
    station: u.searchParams.get("station") || "",
    family: u.searchParams.get("family") || "",
    shade: u.searchParams.get("shade") || "",
    size: u.searchParams.get("size") || "",
    supplierId: u.searchParams.get("supplierId") || "",
    days: u.searchParams.get("days") || "90",
    // default 90d lookback
    group: u.searchParams.get("group") || "week"
    // 'day' | 'week' | 'month'
  };
}
function makeWhere({ station, family, shade, size, supplierId, days }) {
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
const ymd = (d) => new Date(d).toISOString().slice(0, 10);
function startOfMonth(d) {
  const x = new Date(d);
  return new Date(Date.UTC(x.getUTCFullYear(), x.getUTCMonth(), 1));
}
function startOfWeek(d) {
  const x = new Date(d);
  const dow = (x.getUTCDay() + 6) % 7;
  const start = new Date(Date.UTC(x.getUTCFullYear(), x.getUTCMonth(), x.getUTCDate()));
  start.setUTCDate(start.getUTCDate() - dow);
  return start;
}
const load = async ({ url }) => {
  const filters = readFilters(url);
  const where = makeWhere(filters);
  const purchases = await prisma.stockLedger.findMany({
    where,
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    select: { createdAt: true, mmaCode: true, supplierId: true, shade: true, size: true, qtyDelta: true },
    take: 1e4
    // safety cap
  });
  const seriesMap = /* @__PURE__ */ new Map();
  for (const r of purchases) {
    const q = Number(r.qtyDelta ?? 0);
    if (!q) continue;
    let start;
    if (filters.group === "day") start = /* @__PURE__ */ new Date(ymd(r.createdAt) + "T00:00:00Z");
    else if (filters.group === "month") start = startOfMonth(r.createdAt);
    else start = startOfWeek(r.createdAt);
    const key = start.toISOString();
    const label = filters.group === "day" ? ymd(start) : filters.group === "month" ? key.slice(0, 7) : (
      // YYYY-MM
      `${key.slice(0, 10)} (wk)`
    );
    const cur = seriesMap.get(key) || { start, label, qty: 0 };
    cur.qty += q;
    seriesMap.set(key, cur);
  }
  const series = [...seriesMap.values()].sort((a, b) => a.start - b.start);
  const totalQty = series.reduce((s, p) => s + p.qty, 0);
  const periods = series.length || 1;
  const avgPerPeriod = totalQty / periods;
  const mixMap = /* @__PURE__ */ new Map();
  for (const r of purchases) {
    const q = Number(r.qtyDelta ?? 0);
    if (!q) continue;
    const k = r.shade || "UNSPEC";
    mixMap.set(k, (mixMap.get(k) || 0) + q);
  }
  const shadeMix = [...mixMap.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, 12);
  const stations = Array.from(new Set(purchases.map((p) => stationOf(p.mmaCode)))).sort();
  const families = Array.from(new Set(purchases.map((p) => familyOf(p.mmaCode)))).sort();
  const shades = Array.from(new Set(purchases.map((p) => p.shade))).sort();
  const sizes = Array.from(new Set(purchases.map((p) => p.size))).sort();
  const supOpts = Array.from(new Set(purchases.map((p) => String(p.supplierId)))).sort();
  const daysOpts = ["", "7", "30", "90", "180", "365"];
  const groupOpts = ["day", "week", "month"];
  return {
    filters,
    options: { stations, families, shades, sizes, supOpts, daysOpts, groupOpts },
    kpis: [
      { label: "Purchases (total)", value: `${totalQty.toFixed(1)} t`, icon: "🧾" },
      { label: `Avg / ${filters.group}`, value: `${avgPerPeriod.toFixed(1)} t`, icon: "➗" },
      { label: "# Periods", value: `${series.length}`, icon: "📅" },
      { label: "Shades", value: `${shadeMix.length}`, icon: "🎨" }
    ],
    series,
    // [{ start: Date, label: 'YYYY-MM'/'YYYY-MM-DD (wk)', qty: number }]
    points: series.map((s) => Number(s.qty)),
    // sparkline points
    shadeMix
    // [{ label, value }]
  };
};
export {
  load
};
