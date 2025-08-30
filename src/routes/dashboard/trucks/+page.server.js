
// /src/routes/dashboard/trucks/+page.server.js
import prisma from "../../../lib/server/prisma.js";
import createOreService from "../../../lib/services/oreServices.js";
import createTalcService from "../../../lib/services/talcServices.js";

export async function load({ url }) {
  // Time window (defaults to 30 days). Applies to dispatchedAt.
  const daysParam = Number(url.searchParams.get("days") ?? 30);
  const days = Number.isFinite(daysParam) && daysParam > 0 ? daysParam : 30;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const ore = createOreService(prisma);
  const talc = createTalcService(prisma);

  // Per-material grouped rows
  const [oreRows, talcRows] = await Promise.all([
    ore.groupByTruck({ since }),
    talc.groupByTruck({ since })
  ]);

  // Merge by truckNo across materials
  const byTruck = new Map();

  function addRows(rows) {
    for (const r of rows) {
      const key = r.truckNo || "—";
      const prev = byTruck.get(key) || {
        truckNo: key,
        tripsCount: 0,
        totalSendTon: 0,
        totalReceiveTon: 0,
        avgTurnaroundHrs_sum: 0,
        avgTurnaroundHrs_n: 0,
        lastTripAt: null,
        oreTrips: 0,
        talcTrips: 0,
      };

      const next = { ...prev };
      next.tripsCount += r.tripsCount || 0;
      next.totalSendTon += r.totalSendTon || 0;
      next.totalReceiveTon += r.totalReceiveTon || 0;

      // Weighted average turnaround (sum of per-truck avg*count)
      if (r.avgTurnaroundHrs_n && r.avgTurnaroundHrs_sum) {
        next.avgTurnaroundHrs_sum += r.avgTurnaroundHrs_sum;
        next.avgTurnaroundHrs_n += r.avgTurnaroundHrs_n;
      }

      // Last trip timestamp
      const last = prev.lastTripAt ? new Date(prev.lastTripAt).getTime() : 0;
      const cur  = r.lastTripAt ? new Date(r.lastTripAt).getTime() : 0;
      next.lastTripAt = cur > last ? r.lastTripAt : prev.lastTripAt;

      // Material counters
      if (r.material === "ore")  next.oreTrips  += r.tripsCount || 0;
      if (r.material === "talc") next.talcTrips += r.tripsCount || 0;

      byTruck.set(key, next);
    }
  }

  addRows(oreRows);
  addRows(talcRows);

  // Finalize rows
  const rows = Array.from(byTruck.values())
    .map((r) => {
      const avgTurnaroundHrs =
        r.avgTurnaroundHrs_n > 0 ? r.avgTurnaroundHrs_sum / r.avgTurnaroundHrs_n : 0;
      const lossPct =
        r.totalSendTon > 0
          ? ((r.totalSendTon - r.totalReceiveTon) / r.totalSendTon) * 100
          : 0;

      return {
        truckNo: r.truckNo,
        tripsCount: r.tripsCount,
        oreTrips: r.oreTrips,
        talcTrips: r.talcTrips,
        totalSendTon: r.totalSendTon,
        totalReceiveTon: r.totalReceiveTon,
        lossPct,
        avgTurnaroundHrs,
        lastTripAt: r.lastTripAt
      };
    })
    .sort((a, b) => {
      const at = a.lastTripAt ? new Date(a.lastTripAt).getTime() : 0;
      const bt = b.lastTripAt ? new Date(b.lastTripAt).getTime() : 0;
      return bt - at; // newest first
    });

  // Totals for header
  const totals = rows.reduce(
    (acc, r) => {
      acc.trucks += 1;
      acc.trips += r.tripsCount;
      acc.sendTon += r.totalSendTon;
      acc.recvTon += r.totalReceiveTon;
      return acc;
    },
    { trucks: 0, trips: 0, sendTon: 0, recvTon: 0 }
  );

  return {
    days,
    since: since.toISOString(),
    rows,
    totals
  };
}
