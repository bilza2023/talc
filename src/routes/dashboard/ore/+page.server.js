
// /src/routes/dashboard/ore/+page.server.js
import prisma from '$lib/server/prisma.js';

/** Helper: ISO of max(non-null dates) or null */
function maxIso(...dates) {
  const ts = dates.filter(Boolean).map((d) => new Date(d).getTime());
  return ts.length ? new Date(Math.max(...ts)).toISOString() : null;
}

export async function load() {
  // 1) Station list from batches + edges (both ends)
  const [bStations, fromStations, toStations] = await Promise.all([
    prisma.oreBatch.findMany({ distinct: ['stationCode'], select: { stationCode: true } }),
    prisma.oreEdge.findMany({ distinct: ['fromStation'], select: { fromStation: true } }),
    prisma.oreEdge.findMany({ distinct: ['toStation'],   select: { toStation: true } }),
  ]);

  const stationSet = new Set();
  bStations.forEach((r) => r.stationCode && stationSet.add(r.stationCode));
  fromStations.forEach((r) => r.fromStation && stationSet.add(r.fromStation));
  toStations.forEach((r) => r.toStation && stationSet.add(r.toStation));
  const stations = [...stationSet].sort();

  // 2) Per-station stock/inbound/outbound & last activity
  const stationSummary = await Promise.all(
    stations.map(async (code) => {
      const [stockAgg, inAgg, outAgg, bMax, eMaxFrom, eMaxRecv] = await Promise.all([
        prisma.oreBatch.aggregate({
          _sum: { remainingTon: true },
          where: { stationCode: code, remainingTon: { gt: 0 } },
        }),
        prisma.oreEdge.aggregate({
          _sum: { dispatchWeight: true },
          where: { toStation: code, status: 'in_transit' },
        }),
        prisma.oreEdge.aggregate({
          _sum: { dispatchWeight: true },
          where: { fromStation: code, status: 'in_transit' },
        }),
        prisma.oreBatch.aggregate({
          _max: { createdAt: true, closedAt: true },
          where: { stationCode: code },
        }),
        prisma.oreEdge.aggregate({
          _max: { dispatchedAt: true },
          where: { fromStation: code },
        }),
        prisma.oreEdge.aggregate({
          _max: { receivedAt: true },
          where: { toStation: code, status: 'received' },
        }),
      ]);

      return {
        stationCode: code,
        stock: Number(stockAgg._sum.remainingTon || 0),
        inbound: Number(inAgg._sum.dispatchWeight || 0),
        outbound: Number(outAgg._sum.dispatchWeight || 0),
        lastActivity: maxIso(
          bMax._max.createdAt,
          bMax._max.closedAt,
          eMaxFrom._max.dispatchedAt,
          eMaxRecv._max.receivedAt
        ),
      };
    })
  );

  // 3) Grade totals (current stock by grade = sum remainingTon)
  const gradeTotals = (
    await prisma.oreBatch.groupBy({
      by: ['gradeCode'],
      _sum: { remainingTon: true },
      where: { remainingTon: { gt: 0 } },
    })
  )
    .map((r) => ({ gradeCode: r.gradeCode, stock: Number(r._sum.remainingTon || 0) }))
    .sort((a, b) => a.gradeCode.localeCompare(b.gradeCode));

  // 4) Grade matrix per-station (rows) × grade (columns) from live batches
  const sg = await prisma.oreBatch.groupBy({
    by: ['stationCode', 'gradeCode'],
    _sum: { remainingTon: true },
    where: { remainingTon: { gt: 0 } },
  });

  const gradeSet = new Set(gradeTotals.map((g) => g.gradeCode));
  sg.forEach((r) => gradeSet.add(r.gradeCode));
  const grades = [...gradeSet].sort();

  const seedRow = () => Object.fromEntries(grades.map((g) => [g, 0]));
  const byStation = new Map();
  for (const st of stations) byStation.set(st, seedRow());

  for (const r of sg) {
    const row = byStation.get(r.stationCode) || seedRow();
    row[r.gradeCode] = Number(row[r.gradeCode] || 0) + Number(r._sum.remainingTon || 0);
    byStation.set(r.stationCode, row);
  }

  const gradeMatrix = {
    grades,
    rows: [...byStation.entries()].map(([stationCode, byGrade]) => {
      const total = grades.reduce((s, g) => s + Number(byGrade[g] || 0), 0);
      return { stationCode, totalStock: total, byGrade };
    }),
  };

  // 5) In-transit shipments (table)
  const inTransit = await prisma.oreEdge.findMany({
    where: { status: 'in_transit' },
    orderBy: [{ dispatchedAt: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }],
    select: {
      id: true,
      truckNo: true,
      fromStation: true,
      toStation: true,
      dispatchWeight: true,
      dispatchGrade: true,
      dispatchedAt: true,
    },
  });

  // 6) Totals banner
  const totals = {
    stations: stations.length,
    totalStock: stationSummary.reduce((s, r) => s + (r.stock || 0), 0),
    inTransitTon: inTransit.reduce((s, r) => s + Number(r.dispatchWeight || 0), 0),
    inTransitCount: inTransit.length,
    asOf: new Date().toISOString(),
  };

  return {
    stations,
    stationSummary,
    gradeTotals,
    gradeMatrix,
    inTransit,
    totals,
  };
}
