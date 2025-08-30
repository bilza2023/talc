
// /src/routes/dashboard/overview/+page.server.js
import prisma from "../../../lib/server/prisma.js";
import createOreService from "../../../lib/services/oreServices.js";
import createTalcService from "../../../lib/services/talcServices.js";

export async function load({ url }) {
  // Window: last N days (default 7)
  const daysParam = Number(url.searchParams.get('days') ?? 7);
  const days = Number.isFinite(daysParam) && daysParam > 0 ? daysParam : 7;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const ore = createOreService(prisma);
  const talc = createTalcService(prisma);

  // Each service returns: { depositsTonSince, receivedTonSince, inTransitTon, inTransitCount }
  const [oreOv, talcOv] = await Promise.all([
    ore.overview({ since }),
    talc.overview({ since })
  ]);

  const totals = {
    inTransitCount: (oreOv.inTransitCount || 0) + (talcOv.inTransitCount || 0),
    inTransitTon:   (oreOv.inTransitTon   || 0) + (talcOv.inTransitTon   || 0),
    depositsTonSince: (oreOv.depositsTonSince || 0) + (talcOv.depositsTonSince || 0),
    receivedTonSince: (oreOv.receivedTonSince || 0) + (talcOv.receivedTonSince || 0),
  };

  return {
    days,
    since: since.toISOString(),
    ore: oreOv,
    talc: talcOv,
    totals
  };
}
