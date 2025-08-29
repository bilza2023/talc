
// src/routes/stations/jss/+page.server.js
import prisma from "../../../lib/server/prisma.js";
import createOreService from "../../../lib/services/oreServices.js";
import createTalcService from "../../../lib/services/talcServices.js";

/**
 * JSS station dashboard:
 * - Quick actions: deposit/dispatch (ore & talc)
 * - Inbound (in_transit) list: links to UNLOAD (requires existing transport)
 */
export async function load() {
  const STATION = "JSS";

  const ore  = createOreService(prisma);
  const talc = createTalcService(prisma);

  // Pull both materials' in-transit lists for this station
  const [oreIn, talcIn] = await Promise.all([
    ore.listInTransit(STATION),
    talc.listInTransit(STATION)
  ]);

  // Normalize to a single inbound list
  const mapRow = (t, material) => ({
    id: t.id,
    material, // 'ore' | 'talc'
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

  // Quick action URLs
  const oreActions = {
    depositUrl: `/ore/deposit?station=${encodeURIComponent(STATION)}`,
    dispatchUrl: `/ore/dispatch?station=${encodeURIComponent(STATION)}`
  };
  const talcActions = {
    depositUrl: `/talc/deposit?station=${encodeURIComponent(STATION)}`,
    dispatchUrl: `/talc/dispatch?station=${encodeURIComponent(STATION)}`
  };

  return {
    stationCode: STATION,
    ore: oreActions,
    talc: talcActions,
    inbound
  };
}
