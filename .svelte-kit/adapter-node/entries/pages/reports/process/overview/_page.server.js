import { p as prisma } from "../../../../../chunks/stockEngine.js";
function readFilters(urlLike) {
  const u = urlLike instanceof URL ? urlLike : new URL(String(urlLike));
  return { days: u.searchParams.get("days") || "30" };
}
const num = (v) => Number(v ?? 0);
const load = async ({ url }) => {
  const { days } = readFilters(url);
  const where = {};
  {
    const d = Number(days);
    if (!Number.isNaN(d) && d > 0) {
      where.createdAt = { gte: new Date(Date.now() - d * 24 * 60 * 60 * 1e3) };
    }
  }
  let screeningRuns = [];
  if (prisma?.screening_tbl?.findMany) {
    screeningRuns = await prisma.screening_tbl.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 5e3
    });
  }
  let sortingRuns = [];
  if (prisma?.sorting_tbl?.findMany) {
    sortingRuns = await prisma.sorting_tbl.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 5e3
    });
  }
  const totalScreenedQty = screeningRuns.reduce(
    (s, r) => s + num(r.qtyT ?? r.qty ?? 0),
    0
  );
  const htVals = screeningRuns.map((r) => r.ht != null ? Number(r.ht) : null).filter((v) => v != null);
  const avgHt = htVals.length ? htVals.reduce((s, v) => s + v, 0) / htVals.length : 0;
  const wVals = sortingRuns.map(
    (r) => r && Object.prototype.hasOwnProperty.call(r, "wastage") ? Number(r.wastage) : null
  ).filter((v) => v != null);
  const wPct = wVals.map((v) => v <= 1 ? v * 100 : v);
  const avgWastage = wPct.length ? wPct.reduce((s, v) => s + v, 0) / wPct.length : 0;
  const kpis = [
    { label: "Screened Qty", value: `${totalScreenedQty.toFixed(1)} t`, icon: "🧰" },
    { label: "Avg HT", value: `${avgHt.toFixed(1)}`, icon: "📏" },
    { label: "Avg Wastage (Sorting)", value: `${avgWastage.toFixed(1)}%`, icon: "🧪" },
    { label: "Runs", value: `${screeningRuns.length}`, icon: "🧮" }
  ];
  const latest = [
    ...screeningRuns.slice(0, 200).map((r) => ({
      id: r.id,
      date: r.createdAt,
      qty: num(r.qtyT ?? r.qty ?? 0),
      wastagePct: null,
      // screening has no wastage
      ht: r.ht != null ? Number(r.ht) : null,
      status: r.status ?? ""
    })),
    ...sortingRuns.slice(0, 200).map((r) => ({
      id: r.id,
      date: r.createdAt,
      qty: num(r.qtyT ?? r.qty ?? 0),
      // if sorting has wastage, show it; else null
      wastagePct: r && Object.prototype.hasOwnProperty.call(r, "wastage") ? Number(r.wastage) <= 1 ? Number(r.wastage) * 100 : Number(r.wastage) : null,
      ht: r.ht != null ? Number(r.ht) : null,
      status: r.status ?? ""
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 25);
  return {
    filters: { days },
    kpis,
    latest: latest.map((r) => ({
      ...r,
      // keep UI formatting easy
      wastagePct: r.wastagePct == null ? null : r.wastagePct
    }))
  };
};
export {
  load
};
