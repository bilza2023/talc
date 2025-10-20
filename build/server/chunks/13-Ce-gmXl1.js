import { p as prisma } from './stockEngine-jmqVw6zN.js';
import '@prisma/client';
import 'crypto';

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

var _page_server = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 13;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-PuA6pPUz.js')).default;
const server_id = "src/routes/reports/process/overview/+page.server.js";
const imports = ["_app/immutable/nodes/13.B53qYQuw.js","_app/immutable/chunks/BCQUcm9Y.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/L2kH7WuS.js","_app/immutable/chunks/D4gjX95n.js","_app/immutable/chunks/CCnCa0Il.js","_app/immutable/chunks/DB0uj-TY.js","_app/immutable/chunks/CRYz92Wr.js"];
const stylesheets = ["_app/immutable/assets/SmartTable.C-wTpi7Y.css","_app/immutable/assets/FacetPanel.CwdmLYS8.css"];
const fonts = [];

export { component, fonts, imports, index, _page_server as server, server_id, stylesheets };
//# sourceMappingURL=13-Ce-gmXl1.js.map
