
// /src/routes/dashboard/traceability/+page.server.js
import prisma from "../../../lib/server/prisma.js";
import createOreService from "../../../lib/services/oreServices.js";
import createTalcService from "../../../lib/services/talcServices.js";

export async function load({ url }) {
  // Window & filters
  const daysParam = Number(url.searchParams.get("days") ?? 30);
  const days = Number.isFinite(daysParam) && daysParam > 0 ? daysParam : 30;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const fromStation = url.searchParams.get("from")?.toUpperCase() || null;
  const toStation   = url.searchParams.get("to")?.toUpperCase() || null;

  // Status filter: by default we look at received shipments (so lag & coverage are meaningful).
  const status = (url.searchParams.get("status") || "received").toLowerCase(); // "received" | "all"
  const onlyReceived = status !== "all";

  const ore  = createOreService(prisma);
  const talc = createTalcService(prisma);

  // 1) Pull ore transports in window
  const transports = await ore.listTransports({
    since,
    status: onlyReceived ? "received" : null,
    fromStation,
    toStation
  });

  if (!transports.length) {
    return {
      days,
      since: since.toISOString(),
      status: onlyReceived ? "received" : "all",
      rows: [],
      totals: { transports: 0, sendTon: 0, linkedTon: 0, avgCoverage: 0, withLinks: 0 }
    };
  }

  // 2) Sum talc deposits linked to these ore transport ids
  const ids = transports.map(t => t.id);
  const linkMap = await talc.sumLinkedTalcByOreTransportIds({ oreTransportIds: ids });

  // 3) Build rows with coverage & lag
  const rows = transports.map(t => {
    const link = linkMap.get(t.id) || { linkedTon: 0, firstDepositAt: null };
    const sendTon = Number(t.sendWeightTon || 0);
    const linkedTon = Number(link.linkedTon || 0);
    const coveragePct = sendTon > 0 ? (linkedTon / sendTon) * 100 : 0;

    let lagHrs = null;
    if (t.receivedAt && link.firstDepositAt) {
      lagHrs = (new Date(link.firstDepositAt).getTime() - new Date(t.receivedAt).getTime()) / 3600000;
    }

    return {
      id: t.id,
      route: `${t.fromStation}→${t.toStation}`,
      sendGrade: t.sendGradeCode,
      sendTon,
      receivedAt: t.receivedAt,
      linkedTalcTon: linkedTon,
      coveragePct,
      lagHrs
    };
  }).sort((a, b) => {
    // Sort by lowest coverage first, then newest receivedAt
    if (a.coveragePct !== b.coveragePct) return a.coveragePct - b.coveragePct;
    const at = a.receivedAt ? new Date(a.receivedAt).getTime() : 0;
    const bt = b.receivedAt ? new Date(b.receivedAt).getTime() : 0;
    return bt - at;
  });

  // 4) Totals
  const totals = rows.reduce((acc, r) => {
    acc.transports += 1;
    acc.sendTon += r.sendTon;
    acc.linkedTon += r.linkedTalcTon;
    if (r.linkedTalcTon > 0) acc.withLinks += 1;
    return acc;
  }, { transports: 0, sendTon: 0, linkedTon: 0, withLinks: 0 });

  totals.avgCoverage = totals.sendTon > 0 ? (totals.linkedTon / totals.sendTon) * 100 : 0;

  return {
    days,
    since: since.toISOString(),
    status: onlyReceived ? "received" : "all",
    filter: { fromStation, toStation },
    rows,
    totals
  };
}
