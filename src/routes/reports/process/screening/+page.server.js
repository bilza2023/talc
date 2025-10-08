
// Process — Screening (schema-safe): totals, HT stats, time series, latest runs
import { prisma } from '$lib/stocks/stockEngine.js';

const num = (v) => Number(v ?? 0);
const ymd = (d) => new Date(d).toISOString().slice(0, 10);

function readFilters(urlLike) {
  const u = urlLike instanceof URL ? urlLike : new URL(String(urlLike));
  return { days: u.searchParams.get('days') || '30' };
}

export const load = async ({ url }) => {
  const { days } = readFilters(url);

  // Lookback window
  const where = {};
  if (days) {
    const d = Number(days);
    if (!Number.isNaN(d) && d > 0) {
      where.createdAt = { gte: new Date(Date.now() - d * 24 * 60 * 60 * 1000) };
    }
  }

  // Read without select (avoid field guessing)
  let runs = [];
  if (prisma?.screening_tbl?.findMany) {
    runs = await prisma.screening_tbl.findMany({
      where,
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      take: 10000
    });
  }

  // KPIs
  const totalQty = runs.reduce((s, r) => s + num(r.qtyT ?? r.qty ?? 0), 0);
  const htVals = runs.map(r => (r.ht != null ? Number(r.ht) : null)).filter(v => v != null);
  const avgHt = htVals.length ? htVals.reduce((s, v) => s + v, 0) / htVals.length : 0;
  const runCount = runs.length;
  const success = runs.filter(r => r.status === 'SUCCESS').length;
  const successPct = runCount ? (success / runCount) * 100 : 0;

  const kpis = [
    { label: 'Screened Qty', value: `${totalQty.toFixed(1)} t`, icon: '🧰' },
    { label: 'Avg HT',       value: `${avgHt.toFixed(1)}`,      icon: '📏' },
    { label: 'Runs',         value: `${runCount}`,              icon: '🧮' },
    { label: 'Success Rate', value: `${successPct.toFixed(1)}%`,icon: '✅' },
  ];

  // Time series by day (sum qty)
  const bucket = new Map();
  for (const r of runs) {
    const key = ymd(r.createdAt);
    bucket.set(key, (bucket.get(key) || 0) + num(r.qtyT ?? r.qty ?? 0));
  }
  const series = [...bucket.entries()]
    .map(([label, qty]) => ({ label, qty }))
    .sort((a, b) => (a.label < b.label ? -1 : 1));

  // Latest 50 (newest first)
  const latest = [...runs]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt) || (b.id - a.id))
    .slice(0, 50)
    .map(r => ({
      id: r.id,
      date: r.createdAt,
      qty: num(r.qtyT ?? r.qty ?? 0),
      ht: r.ht != null ? Number(r.ht) : null,
      status: r.status ?? ''
    }));

  return {
    filters: { days },
    kpis,
    series,
    points: series.map(s => s.qty),
    latest
  };
};
