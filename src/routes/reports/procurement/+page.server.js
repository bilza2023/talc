// Logistics → In-Transit (/reports/in-transit)
// Delegates to the canonical server-side report at $lib/reports/inbound.js
// and returns the envelope + lightweight UI helpers (lanes/options).
//
// NOTE: KPIs now come from envelope.kpis (full set), with a safe fallback.

import { prisma } from '$lib/stocks/stockEngine.js';
import { run as runInbound } from '$lib/reports/inbound.js';

export const load = async () => {
  // 1) Delegate to the shared inbound report (handles paging/sort internally)
  const { envelope } = await runInbound({ prisma });

  // 2) KPIs — prefer full-set KPIs emitted by the report; fallback to page slice if absent
  const kpis =
    envelope?.kpis ??
    {
      jobs: envelope?.rows?.length ?? 0,
      qty: (envelope?.rows ?? []).reduce((s, r) => s + Number(r.qty || 0), 0),
    };

  // 3) Lanes roll-up (derived from current page rows; purely for quick UI chips if needed)
  const laneMap = new Map();
  for (const r of envelope.rows ?? []) {
    const key = r.lane;
    const row = laneMap.get(key) ?? { lane: key, jobs: 0, qty: 0 };
    row.jobs += 1;
    row.qty += Number(r.qty || 0);
    laneMap.set(key, row);
  }
  const lanes = [...laneMap.values()].sort((a, b) => b.qty - a.qty);

  // 4) Facet options (derived from the current page rows; safe even if unused by the UI)
  const rows = envelope.rows ?? [];
  const supOpts   = Array.from(new Set(rows.map(r => String(r.supplierId)))).sort();
  const laneOpts  = Array.from(new Set(rows.map(r => r.lane))).sort();
  const shadeOpts = Array.from(new Set(rows.map(r => r.shade))).sort();
  const sizeOpts  = Array.from(new Set(rows.map(r => r.size))).sort();
  const options = { supplierId: supOpts, lane: laneOpts, shade: shadeOpts, size: sizeOpts };

  // 5) Return exactly what the page can consume without breaking anything
  return { envelope, lanes, options, kpis };
};
