
// Transport — Overview (live): KPIs, lane summary, recent movements
import { prisma } from '$lib/stocks/stockEngine.js';

export const load = async () => {
  // --- Helpers
  const now = new Date();

  // Distinct transportId counts by type
  const [dispatchIds, receiveIds, cancelIds] = await Promise.all([
    prisma.stockTransport.findMany({ where: { type: 'DISPATCH' }, select: { transportId: true } }),
    prisma.stockTransport.findMany({ where: { type: 'RECEIVE' },  select: { transportId: true, createdAt: true } }),
    prisma.stockTransport.findMany({ where: { type: 'CANCEL' },   select: { transportId: true } }),
  ]);
  const setDispatch = new Set(dispatchIds.map(x => x.transportId));
  const setReceive  = new Set(receiveIds.map(x => x.transportId));
  const setCancel   = new Set(cancelIds.map(x => x.transportId));

  const inTransitIds = [...setDispatch].filter(id => !setReceive.has(id) && !setCancel.has(id));

  // In-transit qty (sum dispatched qty for unsettled)
  const unsettledDispatches = inTransitIds.length
    ? await prisma.stockTransport.findMany({
        where: { type: 'DISPATCH', transportId: { in: inTransitIds } },
        select: { qty: true }
      })
    : [];
  const inTransitQty = unsettledDispatches.reduce((s, r) => s + Number(r.qty ?? 0), 0);

  // KPI: totals
  const totalDispatch = setDispatch.size;
  const totalReceived = setReceive.size;
  const totalCanceled = setCancel.size;
  const inTransitCnt  = inTransitIds.length;
  const reconciledPct = totalDispatch ? (totalReceived / totalDispatch) * 100 : 0;

  // Avg days-in-transit (for received transports only)
  let avgDaysTransit = 0;
  if (totalReceived) {
    const recvList = await prisma.stockTransport.findMany({
      where: { type: 'RECEIVE' },
      select: { transportId: true, createdAt: true }
    });
    const ids = recvList.map(r => r.transportId);
    const dispForRecv = ids.length
      ? await prisma.stockTransport.findMany({
          where: { type: 'DISPATCH', transportId: { in: ids } },
          select: { transportId: true, createdAt: true }
        })
      : [];
    const dispMap = new Map(dispForRecv.map(d => [d.transportId, d.createdAt]));
    const diffs = recvList
      .map(r => {
        const d = dispMap.get(r.transportId);
        if (!d) return null;
        const ms = new Date(r.createdAt).getTime() - new Date(d).getTime();
        return ms / (1000 * 60 * 60 * 24);
      })
      .filter(v => v != null);
    const sum = diffs.reduce((s, v) => s + v, 0);
    avgDaysTransit = diffs.length ? sum / diffs.length : 0;
  }

  // Lane summary: dispatched vs received per (from,to)
  const [byLaneD, byLaneR] = await Promise.all([
    prisma.stockTransport.groupBy({
      by: ['fromMmaCode', 'toMmaCode'],
      where: { type: 'DISPATCH' },
      _sum: { qty: true }
    }),
    prisma.stockTransport.groupBy({
      by: ['fromMmaCode', 'toMmaCode'],
      where: { type: 'RECEIVE' },
      _sum: { qty: true }
    })
  ]);
  const laneMap = new Map();
  for (const r of byLaneD) {
    const key = `${r.fromMmaCode}→${r.toMmaCode}`;
    laneMap.set(key, {
      from: r.fromMmaCode,
      to: r.toMmaCode,
      dispatched: Number(r._sum.qty ?? 0),
      received: 0
    });
  }
  for (const r of byLaneR) {
    const key = `${r.fromMmaCode}→${r.toMmaCode}`;
    const row = laneMap.get(key) ?? { from: r.fromMmaCode, to: r.toMmaCode, dispatched: 0, received: 0 };
    row.received += Number(r._sum.qty ?? 0);
    laneMap.set(key, row);
  }
  const lanes = [...laneMap.values()]
    .map(x => ({ ...x, delta: Number(x.dispatched) - Number(x.received) }))
    .sort((a, b) => (b.dispatched - a.dispatched));

  // Recent movements: latest 25 DISPATCH with computed status & deltas
  const recentDispatches = await prisma.stockTransport.findMany({
    where: { type: 'DISPATCH' },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: 25,
    select: {
      transportId: true, createdAt: true,
      fromMmaCode: true, toMmaCode: true,
      supplierId: true, shade: true, size: true, qty: true, amount: true
    }
  });
  const rIds = recentDispatches.map(d => d.transportId);
  const recentSettlements = rIds.length
    ? await prisma.stockTransport.findMany({
        where: { transportId: { in: rIds }, type: { in: ['RECEIVE', 'CANCEL'] } },
        select: { transportId: true, type: true, qty: true, amount: true, createdAt: true, shade: true }
      })
    : [];
  const recMap = new Map();
  const canMap = new Map();
  for (const e of recentSettlements) {
    if (e.type === 'RECEIVE') recMap.set(e.transportId, e);
    else if (e.type === 'CANCEL') canMap.set(e.transportId, e);
  }

  const recent = recentDispatches.map(d => {
    const rec = recMap.get(d.transportId);
    const can = canMap.get(d.transportId);
    const status = can ? 'CANCELED' : rec ? 'RECEIVED' : 'IN_TRANSIT';

    const ageHrs =
      status === 'IN_TRANSIT'
        ? (now.getTime() - new Date(d.createdAt).getTime()) / (1000 * 60 * 60)
        : (new Date(rec?.createdAt ?? d.createdAt).getTime() - new Date(d.createdAt).getTime()) / (1000 * 60 * 60);

    const qtyDelta = rec ? Number(rec.qty ?? 0) - Number(d.qty ?? 0) : 0;
    const amountDelta = (rec?.amount ?? 0) - (d.amount ?? 0);

    return {
      date: d.createdAt,
      transportId: d.transportId,
      lane: `${d.fromMmaCode}→${d.toMmaCode}`,
      supplierId: d.supplierId,
      shade: d.shade,
      size: d.size,
      qty: Number(d.qty ?? 0),
      status,
      ageHrs: Number(ageHrs.toFixed(1)),
      amountDispatch: d.amount ?? null,
      amountReceive: rec?.amount ?? null,
      qtyDelta,
      amountDelta
    };
  });

  return {
    kpis: [
      { label: 'In-Transit (qty)', value: `${inTransitQty.toFixed(1)} t`, icon: '🚛' },
      { label: 'In-Transit (jobs)', value: `${inTransitCnt}`, icon: '📦' },
      { label: 'Reconciled', value: `${reconciledPct.toFixed(1)}%`, sub: `${totalReceived}/${totalDispatch}`, icon: '✅' },
      { label: 'Avg Days in Transit', value: `${avgDaysTransit.toFixed(1)}`, icon: '⏱️' },
    ],
    lanes,
    recent
  };
};
