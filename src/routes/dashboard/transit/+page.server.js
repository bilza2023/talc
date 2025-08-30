
// /src/routes/dashboard/in-transit/+page.server.js
import prisma from "../../../lib/server/prisma.js";
import createOreService from "../../../lib/services/oreServices.js";
import createTalcService from "../../../lib/services/talcServices.js";

export async function load({ url }) {
  // Filters
  const daysParam = Number(url.searchParams.get("days") ?? 30);
  const days = Number.isFinite(daysParam) && daysParam > 0 ? daysParam : 30;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const fromStation = url.searchParams.get("from")?.toUpperCase() || null;
  const toStation   = url.searchParams.get("to")?.toUpperCase() || null;
  const grade       = url.searchParams.get("grade")?.toUpperCase() || null;
  const truckNo     = url.searchParams.get("truck") || null;

  const ore  = createOreService(prisma);
  const talc = createTalcService(prisma);

  // Use existing service methods; we filter in memory to avoid changing services.
  const [oreIn, talcIn] = await Promise.all([
    ore.listInTransit?.() ?? [],
    talc.listInTransit?.() ?? []
  ]);

  const now = Date.now();

  // Normalise, filter, compute ages (hours)
  function clean(items, material) {
    return (items || []).map(t => ({
      material,
      id: t.id,
      truckNo: t.truckNo ?? "—",
      fromStation: t.fromStation ?? "—",
      toStation: t.toStation ?? "—",
      sendWeightTon: Number(t.sendWeightTon ?? 0),
      sendGradeCode: (t.sendGradeCode ?? "").toUpperCase(),
      dispatchedAt: t.dispatchedAt ? new Date(t.dispatchedAt) : null
    }))
    .filter(t => {
      if (t.dispatchedAt && t.dispatchedAt < since) return false;
      if (fromStation && t.fromStation !== fromStation) return false;
      if (toStation   && t.toStation   !== toStation)   return false;
      if (grade       && t.sendGradeCode !== grade)     return false;
      if (truckNo     && t.truckNo !== truckNo)         return false;
      return true;
    })
    .map(t => {
      const ageHrs = t.dispatchedAt ? (now - t.dispatchedAt.getTime()) / 3600000 : 0;
      return { ...t, ageHrs };
    });
  }

  const rows = [...clean(oreIn, "ore"), ...clean(talcIn, "talc")]
    .sort((a, b) => b.ageHrs - a.ageHrs); // oldest (longest on road) first

  // Summary by destination
  const summaryMap = new Map();
  for (const r of rows) {
    const key = r.toStation || "—";
    const cur = summaryMap.get(key) || { toStation: key, count: 0, totalTon: 0, ageSum: 0, oldestAge: 0 };
    cur.count += 1;
    cur.totalTon += r.sendWeightTon || 0;
    cur.ageSum += r.ageHrs || 0;
    cur.oldestAge = Math.max(cur.oldestAge, r.ageHrs || 0);
    summaryMap.set(key, cur);
  }

  const summary = Array.from(summaryMap.values())
    .map(s => ({
      toStation: s.toStation,
      count: s.count,
      totalTon: s.totalTon,
      avgAgeHrs: s.count ? s.ageSum / s.count : 0,
      oldestAgeHrs: s.oldestAge
    }))
    .sort((a, b) => b.count - a.count || b.totalTon - a.totalTon);

  // Totals
  const totals = rows.reduce(
    (acc, r) => {
      acc.shipments += 1;
      acc.totalTon += r.sendWeightTon || 0;
      return acc;
    },
    { shipments: 0, totalTon: 0 }
  );

  return {
    days,
    since: since.toISOString(),
    filters: { fromStation, toStation, grade, truckNo },
    totals,
    summary,
    rows
  };
}
