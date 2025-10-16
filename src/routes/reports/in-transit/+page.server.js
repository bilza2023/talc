// Logistics → In-Transit (flat under /reports/in-transit)
// Re-aligned to use the shared server-side report at $lib/reports/inbound.js
// so UI consumes the canonical ReportEnvelope shape.

import { prisma } from '$lib/stocks/stockEngine.js';
import { run as runInbound } from '$lib/reports/inbound.js';

function readFilters(urlStr) {
  const u = new URL(urlStr);
  return {
    // inbound report supports these (others are ignored)
    toMmaCode: u.searchParams.get('toMmaCode') || '',
    supplierId: u.searchParams.get('supplierId') || '',
  };
}

export const load = async ({ url }) => {
  // 1) delegate to the shared inbound report (it already handles paging/sort)
  const filters = readFilters(url);
  const params = {
    ...(filters.toMmaCode ? { toMmaCode: filters.toMmaCode } : {}),
    ...(filters.supplierId ? { supplierId: Number(filters.supplierId) } : {}),
  };

  // NOTE: runInbound builds the canonical envelope:
  // rows: [{ date, transportId, lane, supplierId, shade, size, qty, amount }]
  const { envelope } = await runInbound({ prisma, url, params });

  // 2) KPIs (computed from the already-filtered, already-paged data)
  // If you want KPIs on the full (unpaged) set, move KPI computation into the report itself.
  const jobs = envelope.rows.length;
  const qty = envelope.rows.reduce((s, r) => s + Number(r.qty || 0), 0);

  // 3) Lanes roll-up (from the envelope rows)
  const laneMap = new Map();
  for (const r of envelope.rows) {
    const key = r.lane;
    const row = laneMap.get(key) ?? { lane: key, jobs: 0, qty: 0 };
    row.jobs += 1;
    row.qty += Number(r.qty || 0);
    laneMap.set(key, row);
  }
  const lanes = [...laneMap.values()].sort((a, b) => b.qty - a.qty);

  // 4) Facet options (compact, derived from the current rows)
  const supOpts   = Array.from(new Set(envelope.rows.map(r => String(r.supplierId)))).sort();
  const laneOpts  = Array.from(new Set(envelope.rows.map(r => r.lane))).sort();
  const shadeOpts = Array.from(new Set(envelope.rows.map(r => r.shade))).sort();
  const sizeOpts  = Array.from(new Set(envelope.rows.map(r => r.size))).sort();

  // 5) return exactly what the Svelte page needs
  const kpis = { jobs, qty };
  const options = { supplierId: supOpts, lane: laneOpts, shade: shadeOpts, size: sizeOpts };

  return { envelope, lanes, filters, options };
};
