// Procurement — Suppliers (live): leaderboard + per-supplier drilldown (period & filters)
import { prisma } from '$lib/stocks/stockEngine.js';

function readFilters(urlLike) {
  const u = urlLike instanceof URL ? urlLike : new URL(String(urlLike));
  return {
    station:    u.searchParams.get('station')    || '',   // ABS / PSS / KEF
    family:     u.searchParams.get('family')     || '',   // RAW / SCREENED
    shade:      u.searchParams.get('shade')      || '',
    size:       u.searchParams.get('size')       || '',
    supplierId: u.searchParams.get('supplierId') || '',
    days:       u.searchParams.get('days')       || '30', // default lookback 30d
  };
}

function makeWhere({ station, family, shade, size, supplierId, days }, includeSupplier = false) {
  const where = { reason: 'DIRECT' }; // procurement deposits only
  if (station)     where.mmaCode   = { startsWith: `${station}_` };
  if (family)      where.mmaCode   = { ...(where.mmaCode || {}), endsWith: `_${family}` };
  if (shade)       where.shade     = shade;
  if (size)        where.size      = size;
  if (includeSupplier && supplierId) where.supplierId = Number(supplierId);
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

  // Leaderboard (filtered by station/family/shade/size & days; NOT by supplierId)
  const whereLB = makeWhere(filters, /*includeSupplier*/ false);
  const lbGrouped = await prisma.stockLedger.groupBy({
    by: ['supplierId'],
    where: whereLB,
    _sum: { qtyDelta: true }
  });

  const leaderboardRaw = lbGrouped
    .map(r => ({ supplierId: Number(r.supplierId), qty: Number(r._sum.qtyDelta ?? 0) }))
    .filter(r => r.qty > 0)
    .sort((a, b) => b.qty - a.qty);

  const supplierIds = leaderboardRaw.map(x => x.supplierId);
  const supplierNameMap = supplierIds.length
    ? new Map(
        (await prisma.supplier.findMany({
          where: { id: { in: supplierIds } },
          select: { id: true, name: true }
        })).map(s => [s.id, s.name])
      )
    : new Map();

  const leaderboard = leaderboardRaw.map(r => ({
    supplierId: r.supplierId,
    supplierName: supplierNameMap.get(r.supplierId) || `S${r.supplierId}`,
    qty: r.qty
  }));

  // KPIs
  const totalQty   = leaderboard.reduce((s, x) => s + x.qty, 0);
  const supCount   = leaderboard.length;
  const top        = leaderboard[0] || null;
  const avgPerSup  = supCount ? totalQty / supCount : 0;

  // Optional drilldown: if supplierId is provided, show that supplier's breakdown
  let selectedSupplier = null;
  let detailRows = [];

  if (filters.supplierId) {
    const supIdNum = Number(filters.supplierId);

    selectedSupplier = {
      id: supIdNum,
      name:
        supplierNameMap.get(supIdNum) ||
        (await prisma.supplier.findUnique({ where: { id: supIdNum }, select: { name: true } }))?.name ||
        `S${supIdNum}`
    };

    const whereDetail = makeWhere(filters, /*includeSupplier*/ true);
    // Group by receiving MMA & SKU keys for a compact view
    const detailGrouped = await prisma.stockLedger.groupBy({
      by: ['mmaCode', 'shade', 'size'],
      where: whereDetail,
      _sum: { qtyDelta: true }
    });

    detailRows = detailGrouped
      .map(r => ({
        mmaCode: r.mmaCode,
        shade: r.shade,
        size: r.size,
        qty: Number(r._sum.qtyDelta ?? 0)
      }))
      .filter(r => r.qty > 0)
      .sort((a, b) => b.qty - a.qty);
  }

  // Pull purchases in scope (same where) to derive facet options (compact)
  const recentPurchases = await prisma.stockLedger.findMany({
    where: whereLB,
    select: { mmaCode: true, shade: true, size: true, supplierId: true },
    take: 5000 // cap for facet derivation
  });

  const stationOf = (mma) => String(mma).split('_')[0] || 'UNK';
  const familyOf  = (mma) => String(mma).split('_')[1] || 'UNK';

  const stations = Array.from(new Set(recentPurchases.map(p => stationOf(p.mmaCode)))).sort();
  const families = Array.from(new Set(recentPurchases.map(p => familyOf(p.mmaCode)))).sort();
  const shades   = Array.from(new Set(recentPurchases.map(p => p.shade))).sort();
  const sizes    = Array.from(new Set(recentPurchases.map(p => p.size))).sort();
  const supOpts  = Array.from(new Set(recentPurchases.map(p => String(p.supplierId)))).sort();
  const daysOpts = ['', '7', '30', '90', '365'];

  return {
    filters,
    options: { stations, families, shades, sizes, supOpts, daysOpts },
    kpis: [
      { label: 'Purchases (period)', value: `${totalQty.toFixed(1)} t`, icon: '🧾' },
      { label: 'Suppliers',          value: `${supCount}`,              icon: '👷' },
      { label: 'Avg / Supplier',     value: `${avgPerSup.toFixed(1)} t`,icon: '➗' },
      { label: 'Top Supplier',       value: top ? `${top.qty.toFixed(1)} t` : '—', sub: top ? top.supplierName : '', icon: '🏆' },
    ],
    leaderboard,
    detail: { supplier: selectedSupplier, rows: detailRows }
  };
};
