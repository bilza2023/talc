
// Stocks — Suppliers (live): leaderboard + optional per-supplier drilldown
import { prisma } from '$lib/stocks/stockEngine.js';

function readFilters(url) {
  const u = new URL(url);
  return {
    station: u.searchParams.get('station') || '',
    family: u.searchParams.get('family') || '',
    shade: u.searchParams.get('shade') || '',
    size: u.searchParams.get('size') || '',
    supplierId: u.searchParams.get('supplierId') || '',
  };
}

function makeWhere({ station, family, shade, size, supplierId }, includeSupplier = false) {
  const AND = [];
  if (station) AND.push({ mmaCode: { startsWith: `${station}_` } });
  if (family)  AND.push({ mmaCode: { endsWith: `_${family}` } });
  if (shade)   AND.push({ shade });
  if (size)    AND.push({ size });
  if (includeSupplier && supplierId) AND.push({ supplierId: Number(supplierId) });
  return AND.length ? { AND } : {};
}

export const load = async ({ url }) => {
  const filters = readFilters(url);

  // Leaderboard (filtered by station/family/shade/size; not by supplierId)
  const whereLB = makeWhere(filters, /*includeSupplier*/ false);
  const groupedLB = await prisma.stockLedger.groupBy({
    by: ['supplierId'],
    where: whereLB,
    _sum: { qtyDelta: true },
  });

  // Keep positive on-hand only
  const leaderboardRaw = groupedLB
    .map(r => ({ supplierId: Number(r.supplierId), qty: Number(r._sum.qtyDelta ?? 0) }))
    .filter(r => r.qty > 0)
    .sort((a, b) => b.qty - a.qty);

  const supplierIds = leaderboardRaw.map(r => r.supplierId);
  const supplierMap = supplierIds.length
    ? new Map(
        (await prisma.supplier.findMany({
          where: { id: { in: supplierIds } },
          select: { id: true, name: true },
        })).map(s => [s.id, s.name])
      )
    : new Map();

  const leaderboard = leaderboardRaw.map(r => ({
    supplierId: r.supplierId,
    supplierName: supplierMap.get(r.supplierId) || `S${r.supplierId}`,
    qty: r.qty,
  }));

  // KPIs
  const totalQty = leaderboard.reduce((s, x) => s + x.qty, 0);
  const supCount = leaderboard.length;
  const top = leaderboard[0] || null;
  const avgPerSup = supCount ? totalQty / supCount : 0;

  // Optional drilldown for a selected supplier
  let detailRows = [];
  let selectedSupplier = null;

  if (filters.supplierId) {
    const supIdNum = Number(filters.supplierId);
    selectedSupplier = {
      id: supIdNum,
      name:
        supplierMap.get(supIdNum) ||
        (await prisma.supplier.findUnique({ where: { id: supIdNum }, select: { name: true } }))?.name ||
        `S${supIdNum}`,
    };

    const whereDetail = makeWhere(filters, /*includeSupplier*/ true);
    const groupedDetail = await prisma.stockLedger.groupBy({
      by: ['mmaCode', 'shade', 'size'],
      where: whereDetail,
      _sum: { qtyDelta: true },
    });

    detailRows = groupedDetail
      .map(r => ({
        mmaCode: r.mmaCode,
        shade: r.shade,
        size: r.size,
        qty: Number(r._sum.qtyDelta ?? 0),
      }))
      .filter(r => r.qty > 0)
      .sort((a, b) => b.qty - a.qty);
  }

  // Facet option lists (derived from leaderboard slice)
  // For suppliers list in facet we’ll offer numeric IDs (component supports string values only).
  const stations = Array.from(new Set(
    (await prisma.stockLedger.findMany({
      where: whereLB,
      select: { mmaCode: true },
      take: 5000, // safety cap
    })).map(r => String(r.mmaCode).split('_')[0])
  )).sort();

  const families = Array.from(new Set(
    (await prisma.stockLedger.findMany({
      where: whereLB,
      select: { mmaCode: true },
      take: 5000,
    })).map(r => String(r.mmaCode).split('_')[1])
  )).sort();

  // shade/size options from current filtered space (not just top suppliers)
  const shades = Array.from(new Set(
    (await prisma.stockLedger.groupBy({
      by: ['shade'],
      where: whereLB,
      _sum: { qtyDelta: true },
    })).map(r => r.shade)
  )).sort();

  const sizes = Array.from(new Set(
    (await prisma.stockLedger.groupBy({
      by: ['size'],
      where: whereLB,
      _sum: { qtyDelta: true },
    })).map(r => r.size)
  )).sort();

  return {
    filters,
    options: {
      stations,
      families,
      shades,
      sizes,
      supplierIds: leaderboard.map(x => String(x.supplierId)), // use numeric string values
    },
    kpis: [
      { label: 'On-Hand (filtered)', value: `${totalQty.toFixed(1)} t`, icon: '📦' },
      { label: 'Suppliers', value: `${supCount}`, icon: '🧑‍🏭' },
      { label: 'Avg / Supplier', value: `${avgPerSup.toFixed(1)} t`, icon: '➗' },
      { label: 'Top Supplier', value: top ? `${top.qty.toFixed(1)} t` : '—', sub: top ? (top.supplierName || `S${top.supplierId}`) : '', icon: '🏆' },
    ],
    leaderboard,
    detail: {
      supplier: selectedSupplier,
      rows: detailRows,
    },
  };
};
