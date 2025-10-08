
// Process — Sorting (schema-safe): totals, avg wastage, HT stats, daily series, latest runs
import { prisma } from '$lib/stocks/stockEngine.js';

const num = (v) => Number(v ?? 0);
const ymd = (d) => new Date(d).toISOString().slice(0, 10);

function readFilters(urlLike) {
  const u = urlLike instanceof URL ? urlLike : new URL(String(urlLike));
  return { days: u.searchParams.get('days') || '30' };
}

export const load = async ({ url }) => {
  const { days } = readFilters(url);

  // Build where by createdAt if column exists; if it errors, we’ll retry without where
  const where = {};
  if (days) {
    const d = Number(days);
    if (!Number.isNaN(d) && d > 0) {
      where.createdAt = { gte: new Date(Date.now() - d * 24 * 60 * 60 * 1000) };
    }
  }

  let runs = [];
  if (prisma?.sorting_tbl?.findMany) {
    try {
      runs = await prisma.sorting_tbl.findMany({
        where,
        take: 10000 // cap for UI
      });
    } catch {
      // Fallback if createdAt not in table — fetch without where and filter in JS using committedAt if present
      runs = await prisma.sorting_tbl.findMany({ take: 10000 });
    }
  }

  // If createdAt missing but committedAt exists, apply days filter here
  const jsFiltered = (() => {
    // decide which date field to use per row
    const cutoff =
      days && !Number.isNaN(Number(days)) && Number(days) > 0
        ? new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000)
        : null;

    if (!cutoff) return runs;

    return runs.filter((r) => {
      const d = r.createdAt ?? r.committedAt ?? null;
      return d ? new Date(d) >= cutoff : true; // if no date, keep it (safer than dropping)
    });
  })();

  // KPIs
  const totalQty = jsFiltered.reduce((s, r) => s + num(r.qtyT ?? r.qty ?? 0), 0);

  // Average wastage (%). If <=1 treat as fraction, else already %
  const wastageVals = jsFiltered
    .map((r) => (Object.prototype.hasOwnProperty.call(r, 'wastage') ? Number(r.wastage) : null))
    .filter((v) => v != null);
  const wastagePctVals = wastageVals.map((v) => (v <= 1 ? v * 100 : v));
  const avgWastage = wastagePctVals.length
    ? wastagePctVals.reduce((s, v) => s + v, 0) / wastagePctVals.length
    : 0;

  // Average HT if present
  const htVals = jsFiltered
    .map((r) => (r.ht != null ? Number(r.ht) : null))
    .filter((v) => v != null);
  const avgHt = htVals.length ? htVals.reduce((s, v) => s + v, 0) / htVals.length : 0;

  const runCount = jsFiltered.length;

  const kpis = [
    { label: 'Sorted Qty',  value: `${totalQty.toFixed(1)} t`, icon: '🧺' },
    { label: 'Avg Wastage', value: `${avgWastage.toFixed(1)}%`, icon: '🧪' },
    { label: 'Avg HT',      value: `${avgHt.toFixed(1)}`, icon: '📏' },
    { label: 'Runs',        value: `${runCount}`, icon: '🧮' }
  ];

  // Daily series (Qty)
  const bucket = new Map(); // date -> qty
  for (const r of jsFiltered) {
    const d = r.createdAt ?? r.committedAt;
    if (!d) continue;
    const key = ymd(d);
    bucket.set(key, (bucket.get(key) || 0) + num(r.qtyT ?? r.qty ?? 0));
  }
  const series = [...bucket.entries()]
    .map(([label, qty]) => ({ label, qty }))
    .sort((a, b) => (a.label < b.label ? -1 : 1));

  // Latest 50 (newest first)
  const latest = [...jsFiltered]
    .sort((a, b) => {
      const da = new Date(a.createdAt ?? a.committedAt ?? 0).getTime();
      const db = new Date(b.createdAt ?? b.committedAt ?? 0).getTime();
      if (db !== da) return db - da;
      return (b.id ?? 0) - (a.id ?? 0);
    })
    .slice(0, 50)
    .map((r) => ({
      id: r.id,
      date: r.createdAt ?? r.committedAt ?? null,
      qty: num(r.qtyT ?? r.qty ?? 0),
      wastagePct: Object.prototype.hasOwnProperty.call(r, 'wastage')
        ? (Number(r.wastage) <= 1 ? Number(r.wastage) * 100 : Number(r.wastage))
        : null,
      ht: r.ht != null ? Number(r.ht) : null,
      status: r.status ?? ''
    }));

  return {
    filters: { days },
    kpis,
    series,
    points: series.map((s) => s.qty),
    latest
  };
};
