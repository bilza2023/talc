// src/lib/server/getStationDashboard.js
import prisma from '$lib/server/prisma.js';
import createOreService from '$lib/services/oreServices.js';
import createTalcService from '$lib/services/talcServices.js';

export default async function getStationDashboard(STATION) {
  const station = String(STATION || '').toUpperCase();
  if (!station) throw new Error('station required');

  const ore = createOreService(prisma);
  const talc = createTalcService(prisma);

  // Station stock from open batches (remainingTon > 0), grouped by grade
  const [oreStockRaw, talcStockRaw, oreIn, talcIn] = await Promise.all([
    prisma.oreBatch.groupBy({
      by: ['gradeCode'],
      where: { stationCode: station, remainingTon: { gt: 0 } },
      _sum: { remainingTon: true }
    }),
    prisma.talcBatch.groupBy({
      by: ['gradeCode'],
      where: { stationCode: station, remainingTon: { gt: 0 } },
      _sum: { remainingTon: true }
    }),
    ore.listIncomingEdges(station),   // in_transit edges destined TO this station
    talc.listIncomingEdges(station)
  ]);

  const normalizeStock = (rows) =>
    rows
      .map((r) => ({ gradeCode: r.gradeCode, ton: Number(r._sum?.remainingTon || 0) }))
      .sort((a, b) => a.gradeCode.localeCompare(b.gradeCode));

  const oreStock = normalizeStock(oreStockRaw);
  const talcStock = normalizeStock(talcStockRaw);

  const mapEdge = (e, material) => ({
    id: e.id,
    material, // "ore" | "talc"
    fromStation: e.fromStation,
    toStation: e.toStation,
    gradeCode: e.dispatchGrade,
    weightTon: e.dispatchWeight,
    truckNo: e.truckNo,
    dispatchedAt: e.dispatchedAt,
    // unload -> receive; pass edge id (not transportId)
    receiveUrl:
      (material === 'talc' ? '/talc/receive' : '/ore/receive') +
      `?edge=${encodeURIComponent(e.id)}&station=${encodeURIComponent(station)}`
  });

  const inbound = [
    ...(oreIn || []).map((e) => mapEdge(e, 'ore')),
    ...(talcIn || []).map((e) => mapEdge(e, 'talc'))
  ].sort((a, b) => new Date(b.dispatchedAt || 0) - new Date(a.dispatchedAt || 0));

  return {
    stationCode: station,
    talcStock,
    oreStock,
    ore: {
      depositUrl: `/ore/deposit?station=${encodeURIComponent(station)}`,
      dispatchUrl: `/ore/dispatch?station=${encodeURIComponent(station)}`
    },
    talc: {
      // talc “deposit” is the process step
      depositUrl: `/talc/process?station=${encodeURIComponent(station)}`,
      dispatchUrl: `/talc/dispatch?station=${encodeURIComponent(station)}`
    },
    inbound
  };
}
