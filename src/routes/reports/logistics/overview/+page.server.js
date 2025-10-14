// Logistics → Overview (URL-paginated): KPIs, lane summary (unpaged), recent movements (paged)
import { prisma } from '$lib/stocks/stockEngine.js';
import { parsePagination, resolveOrderBy, paginateQuery, makeEnvelope } from '$lib/reportEngine/index.js';

export const load = async ({ url }) => {
  // 1) Pagination & sorting for the "recent movements" table
  const { page, pageSize, sort, dir } = parsePagination(url, {
    defaultSort: 'createdAt',
    defaultDir: 'desc',
    allowedSorts: ['createdAt', 'qty', 'amount', 'transportId', 'id'],
    idField: 'id'
  });
  const orderBy = resolveOrderBy({ sort, dir, idField: 'id' });

  // 2) KPIs (unpaged, whole scope)
  const [dispatchIds, receiveRows, cancelIds] = await Promise.all([
    prisma.stockTransport.findMany({ where: { type: 'DISPATCH' }, select: { transportId: true } }),
    prisma.stockTransport.findMany({ where: { type: 'RECEIVE' },  select: { transportId: true, createdAt: true } }),
    prisma.stockTransport.findMany({ where: { type: 'CANCEL' },   select: { transportId: true } }),
  ]);
  const setDispatch = new Set(dispatchIds.map(x => x.transportId));
  const setReceive  = new Set(receiveRows.map(x => x.transportId));
  const setCancel   = new Set(cancelIds.map(x => x.transportId));
  const inTransitIds = [...setDispatch].filter(id => !setReceive.has(id) && !setCancel.has(id));

  const unsettledDispatches = inTransitIds.length
    ? await prisma.stockTransport.findMany({
        where: { type: 'DISPATCH', transportId: { in: inTransitIds } },
        select: { qty: true }
      })
    : [];
  const inTransitQty = unsettledDispatches.reduce((s, r) => s + Number(r?.qty ?? 0), 0);

  const totalDispatch = setDispatch.size;
  const totalReceived = setReceive.size;
  const reconciledPct = totalDispatch ? (totalReceived / totalDispatch) * 100 : 0;

  // Avg days in transit (received only)
  let avgDaysTransit = 0;
  if (totalReceived) {
    const ids = receiveRows.map(r => r.transportId);
    const dispForRecv = ids.length
      ? await prisma.stockTransport.findMany({
          where: { type: 'DISPATCH', transportId: { in: ids } },
          select: { transportId: true, createdAt: true }
        })
      : [];
    const dispMap = new Map(dispForRecv.map(d => [d.transportId, d.createdAt]));
    const diffs = receiveRows
      .map(r => {
        const d = dispMap.get(r.transportId);
        if (!d) return null;
        const ms = new Date(r.createdAt).getTime() - new Date(d).getTime();
        return ms / (1000 * 60 * 60 * 24);
      })
      .filter(v => v != null);
    avgDaysTransit = diffs.length ? (diffs.reduce((s, v) => s + v, 0) / diffs.length) : 0;
  }

  const kpis = {
    inTransitQty,
    inTransitJobs: inTransitIds.length,
    reconciledPct,
    totals: { dispatch: totalDispatch, received: totalReceived },
    avgDaysTransit
  };

  // 3) Lane summary (unpaged)
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
    laneMap.set(key, { from: r.fromMmaCode, to: r.toMmaCode, dispatched: Number(r._sum.qty ?? 0), received: 0 });
  }
  for (const r of byLaneR) {
    const key = `${r.fromMmaCode}→${r.toMmaCode}`;
    const row = laneMap.get(key) ?? { from: r.fromMmaCode, to: r.toMmaCode, dispatched: 0, received: 0 };
    row.received += Number(r._sum.qty ?? 0);
    laneMap.set(key, row);
  }
  const lanes = [...laneMap.values()]
    .map(x => ({ ...x, delta: Number(x.dispatched) - Number(x.received) }))
    .sort((a, b) => b.dispatched - a.dispatched);

  // 4) Recent movements (paged DISPATCH rows)
  const select = {
    id: true, transportId: true, createdAt: true,
    fromMmaCode: true, toMmaCode: true,
    supplierId: true, shade: true, size: true, qty: true, amount: true
  };
  const { rows: dispatchRows, paging } = await paginateQuery(prisma.stockTransport, {
    where: { type: 'DISPATCH' },
    orderBy,
    page, pageSize,
    select,
    totalMode: 'none'
  });

  // Fetch matching RECEIVE/CANCEL for only the paged set
  const ids = dispatchRows.map(d => d.transportId);
  const settlements = ids.length
    ? await prisma.stockTransport.findMany({
        where: { transportId: { in: ids }, type: { in: ['RECEIVE', 'CANCEL'] } },
        select: { transportId: true, type: true, qty: true, amount: true, createdAt: true, shade: true }
      })
    : [];
  const recMap = new Map();
  const canMap = new Map();
  for (const e of settlements) {
    if (e.type === 'RECEIVE') recMap.set(e.transportId, e);
    else if (e.type === 'CANCEL') canMap.set(e.transportId, e);
  }

  const now = new Date();
  const rows = dispatchRows.map(d => {
    const rec = recMap.get(d.transportId);
    const can = canMap.get(d.transportId);
    const status = can ? 'CANCELED' : rec ? 'RECEIVED' : 'IN_TRANSIT';
    const ageHrs = status === 'IN_TRANSIT'
      ? (now.getTime() - new Date(d.createdAt).getTime()) / (1000 * 60 * 60)
      : (new Date((rec?.createdAt ?? d.createdAt)).getTime() - new Date(d.createdAt).getTime()) / (1000 * 60 * 60);

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
      qtyDelta: rec ? Number(rec.qty ?? 0) - Number(d.qty ?? 0) : 0,
      amountDelta: (rec?.amount ?? 0) - (d.amount ?? 0),
    };
  });

  const schema = {
    columns: [
      { key: 'date',           label: 'Date',        type: 'datetime' },
      { key: 'transportId',    label: 'TID' },
      { key: 'lane',           label: 'Lane' },
      { key: 'supplierId',     label: 'Supplier' },
      { key: 'shade',          label: 'Shade' },
      { key: 'size',           label: 'Size' },
      { key: 'qty',            label: 'Qty (t)' },
      { key: 'status',         label: 'Status' },
      { key: 'ageHrs',         label: 'Age (hrs)' },
      { key: 'amountDispatch', label: 'Amount (D)' },
      { key: 'amountReceive',  label: 'Amount (R)' },
      { key: 'qtyDelta',       label: 'Δ Qty' },
      { key: 'amountDelta',    label: 'Δ Amount' },
    ]
  };

  const envelope = makeEnvelope({
    meta: {
      reportId: 'logistics_overview',
      title: 'Logistics — Overview',
      defaultSort: { key: 'createdAt', dir: 'desc' }
    },
    kpis,
    facets: {},
    schema,
    rows,
    paging
  });

  return { envelope, lanes };
};
