// src/lib/server/getStationDashboard.js
import prisma from '$lib/server/prisma.js';
import createOreService from '$lib/services/oreServices.js';
import createTalcService from '$lib/services/talcServices.js';

export default async function getStationDashboard(STATION) {
  const station = String(STATION || '').toUpperCase();
  if (!station) throw new Error('station required');

  const ore = createOreService(prisma);
  const talc = createTalcService(prisma);

  // Grade summaries (optional for chips/tables)
  const [oreStockRaw, talcStockRaw] = await Promise.all([
    prisma.oreBatch.groupBy({
      by: ['gradeCode'],
      where: { stationCode: station, remainingTon: { gt: 0 } },
      _sum: { remainingTon: true }
    }),
    prisma.talcBatch.groupBy({
      by: ['gradeCode'],
      where: { stationCode: station, remainingTon: { gt: 0 } },
      _sum: { remainingTon: true }
    })
  ]);

  // Card metrics
  const [
    oreStockAgg,
    oreInboundAgg,
    oreOutboundAgg,
    talcStockAgg,
    talcInboundAgg,
    talcOutboundAgg
  ] = await Promise.all([
    prisma.oreBatch.aggregate({
      _sum: { remainingTon: true },
      where: { stationCode: station, remainingTon: { gt: 0 } }
    }),
    prisma.oreEdge.aggregate({
      _sum: { dispatchWeight: true },
      where: { toStation: station, status: 'in_transit' }
    }),
    prisma.oreEdge.aggregate({
      _sum: { dispatchWeight: true },
      where: { fromStation: station, status: 'in_transit' }
    }),
    prisma.talcBatch.aggregate({
      _sum: { remainingTon: true },
      where: { stationCode: station, remainingTon: { gt: 0 } }
    }),
    prisma.talcEdge.aggregate({
      _sum: { dispatchWeight: true },
      where: { toStation: station, status: 'in_transit' }
    }),
    prisma.talcEdge.aggregate({
      _sum: { dispatchWeight: true },
      where: { fromStation: station, status: 'in_transit' }
    })
  ]);

  const num = (x) => Number(x ?? 0);

  const oreCard = {
    stock:   num(oreStockAgg._sum.remainingTon),
    inbound: num(oreInboundAgg._sum.dispatchWeight),
    outbound:num(oreOutboundAgg._sum.dispatchWeight),
    unit: 't'
  };

  const talcCard = {
    stock:   num(talcStockAgg._sum.remainingTon),
    inbound: num(talcInboundAgg._sum.dispatchWeight),
    outbound:num(talcOutboundAgg._sum.dispatchWeight),
    unit: 't'
  };

  // Inbound edges list for the table (receive flow)
  const [oreIn, talcIn] = await Promise.all([
    ore.listIncomingEdges(station),
    talc.listIncomingEdges(station)
  ]);

  const normalizeStock = (rows) =>
    rows.map((r) => ({ gradeCode: r.gradeCode, ton: Number(r._sum?.remainingTon || 0) }))
        .sort((a, b) => a.gradeCode.localeCompare(b.gradeCode));

  const oreStock  = normalizeStock(oreStockRaw);
  const talcStock = normalizeStock(talcStockRaw);

  const mapEdge = (e, material) => ({
    id: e.id,
    material,
    fromStation: e.fromStation,
    toStation: e.toStation,
    gradeCode: e.dispatchGrade,
    weightTon: e.dispatchWeight,
    truckNo: e.truckNo,
    dispatchedAt: e.dispatchedAt,
    receiveUrl:
      (material === 'talc' ? '/talc/receive' : '/ore/receive') +
      `?edge=${encodeURIComponent(e.id)}&station=${encodeURIComponent(station)}`
  });

  const inbound = [
    ...oreIn.map((e) => mapEdge(e, 'ore')),
    ...talcIn.map((e) => mapEdge(e, 'talc'))
  ].sort((a, b) => new Date(b.dispatchedAt || 0) - new Date(a.dispatchedAt || 0));

  // Quick action links (unchanged)
  const links = {
    ore: {
      depositUrl: `/ore/deposit?station=${encodeURIComponent(station)}`,
      dispatchUrl: `/ore/dispatch?station=${encodeURIComponent(station)}`,
      receiveUrl: `/ore/receive?station=${encodeURIComponent(station)}`
    },
    talc: {
      depositUrl: `/talc/process?station=${encodeURIComponent(station)}`, // talc "deposit" == process
      dispatchUrl: `/talc/dispatch?station=${encodeURIComponent(station)}`,
      receiveUrl: `/talc/receive?station=${encodeURIComponent(station)}`
    }
  };

  return { stationCode: station, oreCard, talcCard, oreStock, talcStock, inbound, ...links };
}
