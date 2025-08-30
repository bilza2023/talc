
// /home/bilal-tariq/ab/src/routes/dashboard/talc/+page.server.js
import prisma from "../../../lib/server/prisma.js";
import createTalcService from "../../../lib/services/talcServices.js";

const talc = createTalcService(prisma);

// Keep a stable column order; append any unseen grades dynamically.
const KNOWN_GRADES = ["WL", "WC", "WF", "GL", "GC", "GF"];

function maxDate(...dates) {
  const nums = dates.filter(Boolean).map((d) => new Date(d).getTime());
  if (!nums.length) return null;
  return new Date(Math.max(...nums)).toISOString();
}

export async function load() {
  // 1) Gather the active station list from deposits & transports (union)
  const [depStations, fromStations, toStations] = await Promise.all([
    prisma.talcDeposit.findMany({ distinct: ["stationCode"], select: { stationCode: true } }),
    prisma.talcTransport.findMany({ distinct: ["fromStation"], select: { fromStation: true } }),
    prisma.talcTransport.findMany({ distinct: ["toStation"], select: { toStation: true } })
  ]);

  const stationSet = new Set();
  depStations.forEach((r) => r.stationCode && stationSet.add(r.stationCode));
  fromStations.forEach((r) => r.fromStation && stationSet.add(r.fromStation));
  toStations.forEach((r) => r.toStation && stationSet.add(r.toStation));
  const stationCodes = [...stationSet].sort();

  // 2) Per-station summary (reuse talc.getStationStock + last activity)
  const stationSummary = await Promise.all(
    stationCodes.map(async (code) => {
      const stock = await talc.getStationStock(code);
      const [maxDep, maxFrom, maxTo] = await Promise.all([
        prisma.talcDeposit.aggregate({
          _max: { depositedAt: true },
          where: { stationCode: code }
        }),
        prisma.talcTransport.aggregate({
          _max: { dispatchedAt: true },
          where: { fromStation: code }
        }),
        prisma.talcTransport.aggregate({
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

  // 3) In-transit list (service method)
  const inTransit = await talc.listInTransit();

  // 4) Totals banner
  const totalStock = stationSummary.reduce((s, r) => s + Number(r.stock || 0), 0);
  const inTransitTons = inTransit.reduce((s, r) => s + Number(r.sendWeightTon || 0), 0);
  const totals = {
    totalStock,
    inTransitTons,
    systemTotal: totalStock + inTransitTons
  };

  // 5) System-wide grade totals (deposits + received − outbound-in-transit)
  const [depByGrade, recByGrade, tranByGrade] = await Promise.all([
    prisma.talcDeposit.groupBy({
      by: ["gradeCode"],
      _sum: { weightTon: true }
    }),
    prisma.talcTransport.groupBy({
      by: ["receiveGradeCode"],
      where: { status: "received" },
      _sum: { receiveWeightTon: true }
    }),
    prisma.talcTransport.groupBy({
      by: ["sendGradeCode"],
      where: { status: "in_transit" },
      _sum: { sendWeightTon: true }
    })
  ]);

  const gradeMap = new Map();
  for (const r of depByGrade) {
    const g = r.gradeCode;
    gradeMap.set(g, (gradeMap.get(g) || 0) + Number(r._sum.weightTon || 0));
  }
  for (const r of recByGrade) {
    const g = r.receiveGradeCode;
    gradeMap.set(g, (gradeMap.get(g) || 0) + Number(r._sum.receiveWeightTon || 0));
  }
  for (const r of tranByGrade) {
    const g = r.sendGradeCode;
    gradeMap.set(g, (gradeMap.get(g) || 0) - Number(r._sum.sendWeightTon || 0));
  }

  const gradeTotals = [...gradeMap.entries()]
    .map(([gradeCode, stock]) => ({ gradeCode, stock }))
    .sort((a, b) => a.gradeCode.localeCompare(b.gradeCode));

  // 6) Per-station × per-grade matrix (Stock(S,G) = Deposits + Received − OutboundInTransit)
  const [depSG, recSG, tranSG] = await Promise.all([
    prisma.talcDeposit.groupBy({
      by: ["stationCode", "gradeCode"],
      _sum: { weightTon: true }
    }),
    prisma.talcTransport.groupBy({
      by: ["toStation", "receiveGradeCode"],
      where: { status: "received" },
      _sum: { receiveWeightTon: true }
    }),
    prisma.talcTransport.groupBy({
      by: ["fromStation", "sendGradeCode"],
      where: { status: "in_transit" },
      _sum: { sendWeightTon: true }
    })
  ]);

  // Grade column set (known + discovered)
  const gradeSet = new Set(KNOWN_GRADES);
  for (const r of depSG) gradeSet.add(r.gradeCode);
  for (const r of recSG) gradeSet.add(r.receiveGradeCode);
  for (const r of tranSG) gradeSet.add(r.sendGradeCode);
  const grades = [...gradeSet];

  // Seed matrix: station -> grade -> 0
  const byStation = new Map();
  for (const st of stationCodes) {
    byStation.set(st, Object.fromEntries(grades.map((g) => [g, 0])));
  }

  // + Deposits(S,G)
  for (const r of depSG) {
    const st = r.stationCode, g = r.gradeCode;
    if (!byStation.has(st)) byStation.set(st, Object.fromEntries(grades.map((x) => [x, 0])));
    byStation.get(st)[g] = (byStation.get(st)[g] || 0) + Number(r._sum.weightTon || 0);
  }
  // + Received(S,G)
  for (const r of recSG) {
    const st = r.toStation, g = r.receiveGradeCode;
    if (!byStation.has(st)) byStation.set(st, Object.fromEntries(grades.map((x) => [x, 0])));
    byStation.get(st)[g] = (byStation.get(st)[g] || 0) + Number(r._sum.receiveWeightTon || 0);
  }
  // − OutboundInTransit(S,G)
  for (const r of tranSG) {
    const st = r.fromStation, g = r.sendGradeCode;
    if (!byStation.has(st)) byStation.set(st, Object.fromEntries(grades.map((x) => [x, 0])));
    byStation.get(st)[g] = (byStation.get(st)[g] || 0) - Number(r._sum.sendWeightTon || 0);
  }

  // Final rows with totals and in-station percentages
  const gradeMatrixRows = [...byStation.entries()].map(([stationCode, gMap]) => {
    const totalStock = grades.reduce((sum, g) => sum + Number(gMap[g] || 0), 0);
    const byGrade = gMap;
    const byGradePct = Object.fromEntries(
      grades.map((g) => [g, totalStock > 0 ? Number(byGrade[g] || 0) / totalStock : 0])
    );
    return { stationCode, totalStock, byGrade, byGradePct };
  }).sort((a, b) => a.stationCode.localeCompare(b.stationCode));

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
