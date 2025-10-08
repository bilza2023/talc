// /src/routes/reports/+page.server.js
import { prisma } from '$lib/stocks/stockEngine.js';

export const load = async () => {
  // KPIs
  const totalOnHand = await prisma.stockLedger.aggregate({ _sum: { qtyDelta: true } });

  // Count DISPATCH that aren't RECEIVED/CANCELED
  const settledIds = await prisma.stockTransport.findMany({
    where: { type: { in: ['RECEIVE', 'CANCEL'] } },
    select: { transportId: true }
  });
  const inTransitCount = await prisma.stockTransport.count({
    where: { type: 'DISPATCH', transportId: { notIn: settledIds.map(x => x.transportId) } }
  });

  const purchases = await prisma.stockLedger.aggregate({
    _sum: { qtyDelta: true },
    where: { reason: 'DIRECT' }
  });

  // SAFE avg wastage (schema may not have a numeric 'wastage')
  let avgWastage = 0;
  try {
    const ag = await prisma.screening_tbl.aggregate({ _avg: { wastage: true } });
    avgWastage = Number(ag._avg.wastage ?? 0);
  } catch {
    avgWastage = 0; // fallback if field not numeric / not present
  }

  // Top MMAs by on-hand
  const slotRows = await prisma.stockLedger.groupBy({
    by: ['mmaCode'],
    _sum: { qtyDelta: true },
    orderBy: { _sum: { qtyDelta: 'desc' } },
    take: 10
  });

  return {
    kpis: [
      { label: 'On-Hand',     value: `${Number(totalOnHand._sum.qtyDelta ?? 0).toFixed(1)} t`, icon: '📦' },
      { label: 'In-Transit',  value: `${inTransitCount}`,                                       icon: '🚛' },
      { label: 'Purchases',   value: `${Number(purchases._sum.qtyDelta ?? 0).toFixed(1)} t`,    icon: '🧾' },
      { label: 'Avg Wastage', value: `${avgWastage.toFixed(1)}%`,                                icon: '⚙️' }
    ],
    slots: slotRows.map(r => ({
      mmaCode: r.mmaCode,
      qty: Number(r._sum.qtyDelta ?? 0) // keep numeric for table sorting
    }))
  };
};
