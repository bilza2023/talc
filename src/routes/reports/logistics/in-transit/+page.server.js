
// Transport — In-Transit (live): unsettled dispatches + lane rollup + filters
import { prisma } from '$lib/stocks/stockEngine.js';

function readFilters(url) {
  const u = new URL(url);
  return {
    from: u.searchParams.get('from') || '',          // exact fromMmaCode
    to: u.searchParams.get('to') || '',              // exact toMmaCode
    supplierId: u.searchParams.get('supplierId') || '',
    shade: u.searchParams.get('shade') || '',
    size: u.searchParams.get('size') || '',
    ageHrsMin: u.searchParams.get('ageHrsMin') || '', // numeric string, e.g. "48"
  };
}

export const load = async ({ url }) => {
  const filters = readFilters(url);
  const now = new Date();

  // Base WHERE for DISPATCH with optional filters
  const whereDispatch = {
    type: 'DISPATCH',
    ...(filters.from ? { fromMmaCode: filters.from } : {}),
    ...(filters.to ? { toMmaCode: filters.to } : {}),
    ...(filters.supplierId ? { supplierId: Number(filters.supplierId) } : {}),
    ...(filters.shade ? { shade: filters.shade } : {}),
    ...(filters.size ? { size: filters.size } : {}),
  };

  // All candidate dispatches (recent-first, but we'll filter to unsettled)
  const dispatches = await prisma.stockTransport.findMany({
    where: whereDispatch,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    select: {
      transportId: true, createdAt: true,
      fromMmaCode: true, toMmaCode: true,
      supplierId: true, shade: true, size: true, qty: true, amount: true
    }
  });

  const ids = dispatches.map(d => d.transportId);
  const settlements = ids.length
    ? await prisma.stockTransport.findMany({
        where: { transportId: { in: ids }, type: { in: ['RECEIVE', 'CANCEL'] } },
        select: { transportId: true, type: true }
      })
    : [];

  const settled = new Set(settlements.map(s => s.transportId));
  let unsettled = dispatches.filter(d => !settled.has(d.transportId));

  // Compute ageHrs and apply optional min age filter
  unsettled = unsettled.map(d => {
    const ageHrs = (now.getTime() - new Date(d.createdAt).getTime()) / (1000 * 60 * 60);
    return { ...d, ageHrs: Number(ageHrs.toFixed(1)), qty: Number(d.qty ?? 0) };
  });
  if (filters.ageHrsMin) {
    const min = Number(filters.ageHrsMin) || 0;
    unsettled = unsettled.filter(r => r.ageHrs >= min);
  }

  // KPIs
  const jobs = unsettled.length;
  const qty = unsettled.reduce((s, r) => s + r.qty, 0);
  const oldest = jobs ? Math.max(...unsettled.map(r => r.ageHrs)) : 0;
  const overdue48 = unsettled.filter(r => r.ageHrs >= 48).length;

  // Lane rollup for unsettled only
  const laneMap = new Map();
  for (const r of unsettled) {
    const key = `${r.fromMmaCode}→${r.toMmaCode}`;
    const row = laneMap.get(key) ?? { from: r.fromMmaCode, to: r.toMmaCode, jobs: 0, qty: 0 };
    row.jobs += 1;
    row.qty += r.qty;
    laneMap.set(key, row);
  }
  const lanes = [...laneMap.values()].sort((a, b) => b.qty - a.qty);

  // Facet options derived from unsettled set (compact + relevant)
  const fromOpts = Array.from(new Set(unsettled.map(r => r.fromMmaCode))).sort();
  const toOpts   = Array.from(new Set(unsettled.map(r => r.toMmaCode))).sort();
  const supOpts  = Array.from(new Set(unsettled.map(r => String(r.supplierId)))).sort();
  const shadeOpts= Array.from(new Set(unsettled.map(r => r.shade))).sort();
  const sizeOpts = Array.from(new Set(unsettled.map(r => r.size))).sort();
  const ageOpts  = ['', '24', '48', '72']; // quick picks

  // Table rows (format date in UI)
  const rows = unsettled;

  return {
    filters,
    options: { fromOpts, toOpts, supOpts, shadeOpts, sizeOpts, ageOpts },
    kpis: [
      { label: 'In-Transit Jobs', value: `${jobs}`, icon: '📦' },
      { label: 'In-Transit Qty',  value: `${qty.toFixed(1)} t`, icon: '🚛' },
      { label: 'Oldest (hrs)',    value: `${oldest.toFixed(1)}`, icon: '⏱️' },
      { label: '≥48h',            value: `${overdue48}`, icon: '⚠️' },
    ],
    lanes,
    rows,
  };
};
