// src/routes/stations/pss/+page.server.js
import prisma from "../../../lib/server/prisma.js";
import createOreService from "../../../lib/services/oreServices.js";
import createTalcService from "../../../lib/services/talcServices.js";

export async function load() {
  const STATION = "PSS";
  const ore  = createOreService(prisma);
  const talc = createTalcService(prisma);

  const [oreIn, talcIn, talcStock] = await Promise.all([
    ore.listInTransit(STATION),
    talc.listInTransit(STATION),
    talc.getStationStock(STATION)
  ]);

  const mapRow = (t, material) => ({
    id: t.id,
    material,
    fromStation: t.fromStation,
    toStation: t.toStation,
    gradeCode: t.sendGradeCode,
    weightTon: t.sendWeightTon,
    truckNo: t.truckNo,
    dispatchedAt: t.dispatchedAt,
    unloadUrl:
      (material === "talc" ? "/talc/unload" : "/ore/unload") +
      `?transportId=${encodeURIComponent(t.id)}&station=${encodeURIComponent(STATION)}`
  });

  const inbound = [
    ...(oreIn  || []).map((t) => mapRow(t, "ore")),
    ...(talcIn || []).map((t) => mapRow(t, "talc"))
  ].sort((a, b) => new Date(b.dispatchedAt) - new Date(a.dispatchedAt));

  console.log("[PSS talc stock]", talcStock);

  return {
    stationCode: STATION,
    talcStock,               // ✅ expose talc stock only
    ore: {                   // keep your quick links as-is
      depositUrl: `/ore/deposit?station=${encodeURIComponent(STATION)}`,
      dispatchUrl: `/ore/dispatch?station=${encodeURIComponent(STATION)}`
    },
    talc: {
      depositUrl: `/talc/deposit?station=${encodeURIComponent(STATION)}`,
      dispatchUrl: `/talc/dispatch?station=${encodeURIComponent(STATION)}`
    },
    inbound
  };
}
