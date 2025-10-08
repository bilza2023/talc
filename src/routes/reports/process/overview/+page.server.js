// /src/routes/reports/process/overview/+page.server.js
// Process — Overview (schema-safe): screening_tbl (+ optional sorting_tbl for wastage)

import { prisma } from '$lib/stocks/stockEngine.js';

function readFilters(urlLike) {
  const u = urlLike instanceof URL ? urlLike : new URL(String(urlLike));
  return { days: u.searchParams.get('days') || '30' };
}

const num = (v) => Number(v ?? 0);

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

  // --- Screening runs (no select → no schema guessing)
  let screeningRuns = [];
  if (prisma?.screening_tbl?.findMany) {
    screeningRuns = await prisma.screening_tbl.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: 5000
    });
  }

  // --- Sorting runs (only if model exists). We’ll read wastage from here if present.
  let sortingRuns = [];
  if (prisma?.sorting_tbl?.findMany) {
    sortingRuns = await prisma.sorting_tbl.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: 5000
    });
  }

  // KPIs
  const totalScreenedQty = screeningRuns.reduce(
    (s, r) => s + num(r.qtyT ?? r.qty ?? 0),
    0
  );

  // Average HT from screening (if column exists)
  const htVals = screeningRuns
    .map((r) => (r.ht != null ? Number(r.ht) : null))
    .filter((v) => v != null);
  const avgHt = htVals.length ? htVals.reduce((s, v) => s + v, 0) / htVals.length : 0;

  // Average wastage from sorting (column name assumed `wastage`; if different, stays 0)
  const wVals = sortingRuns
    .map((r) =>
      r && Object.prototype.hasOwnProperty.call(r, 'wastage') ? Number(r.wastage) : null
    )
    .filter((v) => v != null);
  // Normalize: if value <= 1 treat as fraction (×100), else assume already in %
  const wPct = wVals.map((v) => (v <= 1 ? v * 100 : v));
  const avgWastage = wPct.length ? wPct.reduce((s, v) => s + v, 0) / wPct.length : 0;

  const kpis = [
    { label: 'Screened Qty', value: `${totalScreenedQty.toFixed(1)} t`, icon: '🧰' },
    { label: 'Avg HT', value: `${avgHt.toFixed(1)}`, icon: '📏' },
    { label: 'Avg Wastage (Sorting)', value: `${avgWastage.toFixed(1)}%`, icon: '🧪' },
    { label: 'Runs', value: `${screeningRuns.length}`, icon: '🧮' }
  ];

  // Latest table (mix screening + sorting; only use fields we’re sure about)
  const latest = [
    ...screeningRuns.slice(0, 200).map((r) => ({
      id: r.id,
      date: r.createdAt,
      qty: num(r.qtyT ?? r.qty ?? 0),
      wastagePct: null, // screening has no wastage
      ht: r.ht != null ? Number(r.ht) : null,
      status: r.status ?? ''
    })),
    ...sortingRuns.slice(0, 200).map((r) => ({
      id: r.id,
      date: r.createdAt,
      qty: num(r.qtyT ?? r.qty ?? 0),
      // if sorting has wastage, show it; else null
      wastagePct:
        r && Object.prototype.hasOwnProperty.call(r, 'wastage')
          ? (Number(r.wastage) <= 1 ? Number(r.wastage) * 100 : Number(r.wastage))
          : null,
      ht: r.ht != null ? Number(r.ht) : null,
      status: r.status ?? ''
    }))
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 25);

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
