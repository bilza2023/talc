// Transport — Reconciliation (live): compare DISPATCH vs RECEIVE, show deltas
import { prisma } from '$lib/stocks/stockEngine.js';

function readFilters(url) {
  const u = new URL(url);
  return {
    from: u.searchParams.get('from') || '',          // exact fromMmaCode
    to: u.searchParams.get('to') || '',              // exact toMmaCode
    supplierId: u.searchParams.get('supplierId') || '',
    shade: u.searchParams.get('shade') || '',
    size: u.searchParams.get('size') || '',
    days: u.searchParams.get('days') || '',          // lookback days ('' | '7' | '30' | '90' | '365')
  };
}

function makeDispatchWhere(filters) {
  const { from, to, supplierId, shade, size, days } = filters;
  const where = { type: 'DISPATCH' };
  if (from) where.fromMmaCode = from;
  if (to) where.toMmaCode = to;
  if (supplierId) where.supplierId = Number(supplierId);
  if (shade) where.shade = shade;
  if (size) where.size = size;
  if (days) {
    const d = Number(days);
    if (!Number.isNaN(d) && d > 0) {
      const start = new Date(Date.now() - d * 24 * 60 * 60 * 1000);
      where.createdAt = { gte: start };
    }
  }
  return where;
}

export const load = async ({ url }) => {
  const filters = readFilters(url);

  // 1) Pull dispatches in scope
  const whereDispatch = makeDispatchWhere(filters);
  const dispatches = await prisma.stockTransport.findMany({
    where: whereDispatch,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    select: {
      transportId: true, createdAt: true,
      fromMmaCode: true, toMmaCode: true,
      supplierId: true, shade: true, size: true,
      qty: true, amount: true
    }
  });
  const ids = dispatches.map(d => d.transportId);

  // 2) Pull matching settlements (RECEIVE/CANCEL) for those dispatches (any date)
  const settlements = ids.length
    ? await prisma.stockTransport.findMany({
        where: { transportId: { in: ids }, type: { in: ['RECEIVE', 'CANCEL'] } },
        select: {
          transportId: true, type: true, qty: true, amount: true, createdAt: true, shade: true
        }
      })
    : [];

  const recvMap = new Map(); // latest RECEIVE per id (there should be at most one)
  const cancelMap = new Map();
  for (const s of settlements) {
    if (s.type === 'RECEIVE') recvMap.set(s.transportId, s);
    else if (s.type === 'CANCEL') cancelMap.set(s.transportId, s);
  }

  // 3) Build detail rows with deltas
  const rows = dispatches.map(d => {
    const rec = recvMap.get(d.transportId);
    const can = cancelMap.get(d.transportId);
    const status = can ? 'CANCELED' : rec ? 'RECEIVED' : 'IN_TRANSIT';
    const qtyDispatch = Number(d.qty ?? 0);
    const qtyReceive  = Number(rec?.qty ?? 0);
    const amtDispatch = d.amount ?? null;
    const amtReceive  = rec?.amount ?? null;
    const qtyDelta    = rec ? qtyReceive - qtyDispatch : 0;
    const amountDelta = rec ? (amtReceive ?? 0) - (amtDispatch ?? 0) : 0;

    return {
      date: d.createdAt,
      transportId: d.transportId,
      from: d.fromMmaCode,
      to: d.toMmaCode,
      supplierId: d.supplierId,
      shade: d.shade,
      size: d.size,
      qtyDispatch,
      qtyReceive,
      qtyDelta,
      amountDispatch: amtDispatch,
      amountReceive: amtReceive,
      amountDelta,
      status
    };
  });

  // 4) KPIs
  const totalDispatch = rows.length;
  const totalReceived = rows.filter(r => r.status === 'RECEIVED').length;
  const inTransitCnt  = rows.filter(r => r.status === 'IN_TRANSIT').length;
  const reconciledPct = totalDispatch ? (totalReceived / totalDispatch) * 100 : 0;
  const totalQtyDelta = rows.reduce((s, r) => s + (r.status === 'RECEIVED' ? r.qtyDelta : 0), 0);
  const totalAmtDelta = rows.reduce((s, r) => s + (r.status === 'RECEIVED' ? r.amountDelta : 0), 0);

  // 5) Lane aggregation (Qty + Amount)
  const laneMap = new Map();
  for (const r of rows) {
    const key = `${r.from}→${r.to}`;
    const row = laneMap.get(key) ?? { from: r.from, to: r.to, dispatched: 0, received: 0, deltaQty: 0, deltaAmount: 0 };
    row.dispatched += r.qtyDispatch;
    row.received   += r.qtyReceive;
    if (r.status === 'RECEIVED') {
      row.deltaQty    += r.qtyDelta;
      row.deltaAmount += r.amountDelta;
    }
    laneMap.set(key, row);
  }
  const lanes = [...laneMap.values()].sort((a, b) => b.dispatched - a.dispatched);

  // 6) Supplier aggregation
  const supMap = new Map();
  for (const r of rows) {
    const key = r.supplierId;
    const row = supMap.get(key) ?? { supplierId: r.supplierId, dispatched: 0, received: 0, deltaQty: 0, deltaAmount: 0 };
    row.dispatched += r.qtyDispatch;
    row.received   += r.qtyReceive;
    if (r.status === 'RECEIVED') {
      row.deltaQty    += r.qtyDelta;
      row.deltaAmount += r.amountDelta;
    }
    supMap.set(key, row);
  }
  const suppliers = [...supMap.values()].sort((a, b) => b.dispatched - a.dispatched);

  // 7) Variance list: anything not fully reconciled OR reconciled-with-delta
  const variances = rows.filter(r =>
    r.status !== 'RECEIVED' || r.qtyDelta !== 0 || (r.amountDelta ?? 0) !== 0
  );

  // Facet options (compact, derived from current dispatch scope)
  const fromOpts = Array.from(new Set(dispatches.map(d => d.fromMmaCode))).sort();
  const toOpts   = Array.from(new Set(dispatches.map(d => d.toMmaCode))).sort();
  const supOpts  = Array.from(new Set(dispatches.map(d => String(d.supplierId)))).sort();
  const shadeOpts= Array.from(new Set(dispatches.map(d => d.shade))).sort();
  const sizeOpts = Array.from(new Set(dispatches.map(d => d.size))).sort();
  const daysOpts = ['', '7', '30', '90', '365'];

  return {
    filters,
    options: { fromOpts, toOpts, supOpts, shadeOpts, sizeOpts, daysOpts },
    kpis: [
      { label: 'Reconciled', value: `${reconciledPct.toFixed(1)}%`, sub: `${totalReceived}/${totalDispatch}`, icon: '✅' },
      { label: 'In-Transit', value: `${inTransitCnt}`, icon: '🚛' },
      { label: 'Δ Qty (sum)', value: `${totalQtyDelta.toFixed(1)} t`, icon: '⚖️' },
      { label: 'Δ Amount (sum)', value: `${Number(totalAmtDelta).toFixed(0)}`, icon: '💸' },
    ],
    lanes,
    suppliers,
    variances,
  };
};
