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
  if (prisma?.sorting_tbl?.findMany) {
    try {
      runs = await prisma.sorting_tbl.findMany({
        where,
        take: 1e4
        // cap for UI
      });
    } catch {
      runs = await prisma.sorting_tbl.findMany({ take: 1e4 });
    }
  }
  const jsFiltered = (() => {
    const cutoff = !Number.isNaN(Number(days)) && Number(days) > 0 ? new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1e3) : null;
    if (!cutoff) return runs;
    return runs.filter((r) => {
      const d = r.createdAt ?? r.committedAt ?? null;
      return d ? new Date(d) >= cutoff : true;
    });
  })();
  const totalQty = jsFiltered.reduce((s, r) => s + num(r.qtyT ?? r.qty ?? 0), 0);
  const wastageVals = jsFiltered.map((r) => Object.prototype.hasOwnProperty.call(r, "wastage") ? Number(r.wastage) : null).filter((v) => v != null);
  const wastagePctVals = wastageVals.map((v) => v <= 1 ? v * 100 : v);
  const avgWastage = wastagePctVals.length ? wastagePctVals.reduce((s, v) => s + v, 0) / wastagePctVals.length : 0;
  const htVals = jsFiltered.map((r) => r.ht != null ? Number(r.ht) : null).filter((v) => v != null);
  const avgHt = htVals.length ? htVals.reduce((s, v) => s + v, 0) / htVals.length : 0;
  const runCount = jsFiltered.length;
  const kpis = [
    { label: "Sorted Qty", value: `${totalQty.toFixed(1)} t`, icon: "🧺" },
    { label: "Avg Wastage", value: `${avgWastage.toFixed(1)}%`, icon: "🧪" },
    { label: "Avg HT", value: `${avgHt.toFixed(1)}`, icon: "📏" },
    { label: "Runs", value: `${runCount}`, icon: "🧮" }
  ];
  const bucket = /* @__PURE__ */ new Map();
  for (const r of jsFiltered) {
    const d = r.createdAt ?? r.committedAt;
    if (!d) continue;
    const key = ymd(d);
    bucket.set(key, (bucket.get(key) || 0) + num(r.qtyT ?? r.qty ?? 0));
  }
  const series = [...bucket.entries()].map(([label, qty]) => ({ label, qty })).sort((a, b) => a.label < b.label ? -1 : 1);
  const latest = [...jsFiltered].sort((a, b) => {
    const da = new Date(a.createdAt ?? a.committedAt ?? 0).getTime();
    const db = new Date(b.createdAt ?? b.committedAt ?? 0).getTime();
    if (db !== da) return db - da;
    return (b.id ?? 0) - (a.id ?? 0);
  }).slice(0, 50).map((r) => ({
    id: r.id,
    date: r.createdAt ?? r.committedAt ?? null,
    qty: num(r.qtyT ?? r.qty ?? 0),
    wastagePct: Object.prototype.hasOwnProperty.call(r, "wastage") ? Number(r.wastage) <= 1 ? Number(r.wastage) * 100 : Number(r.wastage) : null,
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

const index = 15;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-B2E2Hy3f.js')).default;
const server_id = "src/routes/reports/process/sorting/+page.server.js";
const imports = ["_app/immutable/nodes/15.tDix2puU.js","_app/immutable/chunks/BCQUcm9Y.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/L2kH7WuS.js","_app/immutable/chunks/D4gjX95n.js","_app/immutable/chunks/CCnCa0Il.js","_app/immutable/chunks/DB0uj-TY.js","_app/immutable/chunks/BrXPnwD5.js","_app/immutable/chunks/CRYz92Wr.js"];
const stylesheets = ["_app/immutable/assets/SmartTable.C-wTpi7Y.css","_app/immutable/assets/FacetPanel.CwdmLYS8.css","_app/immutable/assets/Sparkline.BVvfISpz.css"];
const fonts = [];

export { component, fonts, imports, index, _page_server as server, server_id, stylesheets };
//# sourceMappingURL=15-CD9mV3dx.js.map
