import { p as prisma } from './stockEngine-jmqVw6zN.js';
import '@prisma/client';
import 'crypto';

const num = (v) => Number(v ?? 0);
const ymd = (d) => new Date(d).toISOString().slice(0, 10);
function readFilters(urlLike) {
  const u = urlLike instanceof URL ? urlLike : new URL(String(urlLike));
  return { days: u.searchParams.get("days") || "30" };
}
const load = async ({ url }) => {
  const { days } = readFilters(url);
  const where = {};
  {
    const d = Number(days);
    if (!Number.isNaN(d) && d > 0) {
      where.createdAt = { gte: new Date(Date.now() - d * 24 * 60 * 60 * 1e3) };
    }
  }
  let runs = [];
  if (prisma?.screening_tbl?.findMany) {
    runs = await prisma.screening_tbl.findMany({
      where,
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      take: 1e4
    });
  }
  const totalQty = runs.reduce((s, r) => s + num(r.qtyT ?? r.qty ?? 0), 0);
  const htVals = runs.map((r) => r.ht != null ? Number(r.ht) : null).filter((v) => v != null);
  const avgHt = htVals.length ? htVals.reduce((s, v) => s + v, 0) / htVals.length : 0;
  const runCount = runs.length;
  const success = runs.filter((r) => r.status === "SUCCESS").length;
  const successPct = runCount ? success / runCount * 100 : 0;
  const kpis = [
    { label: "Screened Qty", value: `${totalQty.toFixed(1)} t`, icon: "🧰" },
    { label: "Avg HT", value: `${avgHt.toFixed(1)}`, icon: "📏" },
    { label: "Runs", value: `${runCount}`, icon: "🧮" },
    { label: "Success Rate", value: `${successPct.toFixed(1)}%`, icon: "✅" }
  ];
  const bucket = /* @__PURE__ */ new Map();
  for (const r of runs) {
    const key = ymd(r.createdAt);
    bucket.set(key, (bucket.get(key) || 0) + num(r.qtyT ?? r.qty ?? 0));
  }
  const series = [...bucket.entries()].map(([label, qty]) => ({ label, qty })).sort((a, b) => a.label < b.label ? -1 : 1);
  const latest = [...runs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt) || b.id - a.id).slice(0, 50).map((r) => ({
    id: r.id,
    date: r.createdAt,
    qty: num(r.qtyT ?? r.qty ?? 0),
    ht: r.ht != null ? Number(r.ht) : null,
    status: r.status ?? ""
  }));
  return {
    filters: { days },
    kpis,
    series,
    points: series.map((s) => s.qty),
    latest
  };
};

var _page_server = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 14;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-B6PdciX3.js')).default;
const server_id = "src/routes/reports/process/screening/+page.server.js";
const imports = ["_app/immutable/nodes/14.2A28W3cB.js","_app/immutable/chunks/BCQUcm9Y.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/L2kH7WuS.js","_app/immutable/chunks/D4gjX95n.js","_app/immutable/chunks/CCnCa0Il.js","_app/immutable/chunks/DB0uj-TY.js","_app/immutable/chunks/BrXPnwD5.js","_app/immutable/chunks/CRYz92Wr.js"];
const stylesheets = ["_app/immutable/assets/SmartTable.C-wTpi7Y.css","_app/immutable/assets/FacetPanel.CwdmLYS8.css","_app/immutable/assets/Sparkline.BVvfISpz.css"];
const fonts = [];

export { component, fonts, imports, index, _page_server as server, server_id, stylesheets };
//# sourceMappingURL=14-BGHBaXze.js.map
