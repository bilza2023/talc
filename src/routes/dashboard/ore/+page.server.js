// /home/bilal-tariq/ab/src/routes/dashboard/ore/+page.server.js
import prisma from "../../../lib/server/prisma.js";
import createOreService from "../../../lib/services/oreServices.js";

const ore = createOreService(prisma);

// Known Ore grades (keeps column order stable). Any unknown grade in DB will be added after these.
const KNOWN_GRADES = ["WL", "WC", "WF", "GL", "GC", "GF"];

function maxDate(...dates) {
  const nums = dates.filter(Boolean).map((d) => new Date(d).getTime());
  if (!nums.length) return null;
  return new Date(Math.max(...nums)).toISOString();
}

export async function load() {
  // 1) Build the station list dynamically from deposits & transports (union)
  const [depStations, fromStations, toStations] = await Promise.all([
    prisma.oreDeposit.findMany({ distinct: ["stationCode"], select: { stationCode: true } }),
    prisma.oreTransport.findMany({ distinct: ["fromStation"], select: { fromStation: true } }),
    prisma.oreTransport.findMany({ distinct: ["toStation"], select: { toStation: true } })
  ]);

  const stationSet = new Set();
  depStations.forEach((r) => r.stationCode && stationSet.add(r.stationCode));
  fromStations.forEach((r) => r.fromStation && stationSet.add(r.fromStation));
  toStations.forEach((r) => r.toStation && stationSet.add(r.toStation));
  const stationCodes = [...stationSet].sort();

  // 2) Station summaries (reuse existing getStationStock + compute lastActivity)
  const stationSummary = await Promise.all(
    stationCodes.map(async (code) => {
      const stock = await ore.getStationStock(code);
      const [maxDep, maxFrom, maxTo] = await Promise.all([
        prisma.oreDeposit.aggregate({
          _max: { depositedAt: true },
          where: { stationCode: code }
        }),
        prisma.oreTransport.aggregate({
          _max: { dispatchedAt: true },
          where: { fromStation: code }
        }),
        prisma.oreTransport.aggregate({
          _max: { receivedAt: true },
          where: { toStation: code, status: "received" }
        })
      ]);

      const lastActivity = maxDate(
        maxDep._max.depositedAt,
        maxFrom._max.dispatchedAt,
        maxTo._max.receivedAt
      );

      return { ...stock, lastActivity };
    })
  );

  // 3) In-transit list (already exists in service)
  const inTransit = await ore.listInTransit();

  // 4) Totals banner
  const totalStock = stationSummary.reduce((s, r) => s + Number(r.stock || 0), 0);
  const inTransitTons = inTransit.reduce((s, r) => s + Number(r.sendWeightTon || 0), 0);
  const totals = {
    totalStock,
    inTransitTons,
    systemTotal: totalStock + inTransitTons
  };

  // 5) Grade totals snapshot (system-wide): deposits + received − outbound-in-transit, grouped by grade
  const [depByGrade, recByGrade, transitByGrade] = await Promise.all([
    prisma.oreDeposit.groupBy({
      by: ["gradeCode"],
      _sum: { weightTon: true }
    }),
    prisma.oreTransport.groupBy({
      by: ["receiveGradeCode"],
      where: { status: "received" },
      _sum: { receiveWeightTon: true }
    }),
    prisma.oreTransport.groupBy({
      by: ["sendGradeCode"],
      where: { status: "in_transit" },
      _sum: { sendWeightTon: true }
    })
  ]);

  const gradeMap = new Map();
  // deposits
  for (const r of depByGrade) {
    const g = r.gradeCode;
    const cur = gradeMap.get(g) || 0;
    gradeMap.set(g, cur + Number(r._sum.weightTon || 0));
  }
  // received
  for (const r of recByGrade) {
    const g = r.receiveGradeCode;
    const cur = gradeMap.get(g) || 0;
    gradeMap.set(g, cur + Number(r._sum.receiveWeightTon || 0));
  }
  // outbound still in transit (subtract)
  for (const r of transitByGrade) {
    const g = r.sendGradeCode;
    const cur = gradeMap.get(g) || 0;
    gradeMap.set(g, cur - Number(r._sum.sendWeightTon || 0));
  }

  const gradeTotals = [...gradeMap.entries()]
    .map(([gradeCode, stock]) => ({ gradeCode, stock }))
    .sort((a, b) => a.gradeCode.localeCompare(b.gradeCode));

  // 6) Per-station × per-grade matrix:
  //    Stock(S,G) = Deposits(S,G) + Received(S,G) − OutboundInTransit(S,G)
  const [depSG, recSG, tranSG] = await Promise.all([
    prisma.oreDeposit.groupBy({
      by: ["stationCode", "gradeCode"],
      _sum: { weightTon: true }
    }),
    prisma.oreTransport.groupBy({
      by: ["toStation", "receiveGradeCode"],
      where: { status: "received" },
      _sum: { receiveWeightTon: true }
    }),
    prisma.oreTransport.groupBy({
      by: ["fromStation", "sendGradeCode"],
      where: { status: "in_transit" },
      _sum: { sendWeightTon: true }
    })
  ]);

  // Build grade list (start with known for ordering; append any new codes if found)
  const gradeSet = new Set(KNOWN_GRADES);
  for (const r of depSG) gradeSet.add(r.gradeCode);
  for (const r of recSG) gradeSet.add(r.receiveGradeCode);
  for (const r of tranSG) gradeSet.add(r.sendGradeCode);
  const grades = [...gradeSet];

  // Initialize matrix: station -> grade -> 0
  const byStation = new Map();
  for (const st of stationCodes) {
    const gMap = Object.fromEntries(grades.map((g) => [g, 0]));
    byStation.set(st, gMap);
  }

  // Add Deposits(S,G)
  for (const r of depSG) {
    const st = r.stationCode;
    const g = r.gradeCode;
    if (!byStation.has(st)) {
      byStation.set(st, Object.fromEntries(grades.map((x) => [x, 0])));
    }
    byStation.get(st)[g] = (byStation.get(st)[g] || 0) + Number(r._sum.weightTon || 0);
  }

  // Add Received(S,G)
  for (const r of recSG) {
    const st = r.toStation;
    const g = r.receiveGradeCode;
    if (!byStation.has(st)) {
      byStation.set(st, Object.fromEntries(grades.map((x) => [x, 0])));
    }
    byStation.get(st)[g] = (byStation.get(st)[g] || 0) + Number(r._sum.receiveWeightTon || 0);
  }

  // Subtract OutboundInTransit(S,G)
  for (const r of tranSG) {
    const st = r.fromStation;
    const g = r.sendGradeCode;
    if (!byStation.has(st)) {
      byStation.set(st, Object.fromEntries(grades.map((x) => [x, 0])));
    }
    byStation.get(st)[g] = (byStation.get(st)[g] || 0) - Number(r._sum.sendWeightTon || 0);
  }

  // Build rows with totals and percentages
  const gradeMatrixRows = [...byStation.entries()]
    .map(([stationCode, gMap]) => {
      const totalStock = grades.reduce((sum, g) => sum + Number(gMap[g] || 0), 0);
      const byGrade = gMap;
      const byGradePct = Object.fromEntries(
        grades.map((g) => [
          g,
          totalStock > 0 ? Number(byGrade[g] || 0) / totalStock : 0
        ])
      );
      return { stationCode, totalStock, byGrade, byGradePct };
    })
    .sort((a, b) => a.stationCode.localeCompare(b.stationCode));

  const gradeMatrix = { grades, rows: gradeMatrixRows };

  return {
    stationSummary,
    inTransit,
    totals,
    gradeTotals,
    gradeMatrix,
    asOf: new Date().toISOString()
  };
}
