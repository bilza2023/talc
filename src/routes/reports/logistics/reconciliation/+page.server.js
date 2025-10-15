// Logistics — Reconciliation (Dispatch vs Receive only, SERVER-SIDE pagination)
import { prisma } from '$lib/stocks/stockEngine.js';
import { parsePagination, makeEnvelope } from '$lib/reportEngine/index.js';

export const load = async ({ url }) => {
  const { page, pageSize } = parsePagination(url, {
    defaultSort: 'createdAt',
    defaultDir: 'desc',
    allowedSorts: ['createdAt'],
  });

  // ---- Pagination controls for Prisma ----
  const skip = (page - 1) * pageSize;
  const take = pageSize + 1; // fetch one extra to detect next page

  // ---- Pull only current-page dispatches ----
  const dispatches = await prisma.stockTransport.findMany({
    where: {
      type: 'DISPATCH',
      transportId: {
        in: await prisma.stockTransport.findMany({
          where: { type: 'RECEIVE' },
          select: { transportId: true }
        }).then(r => r.map(x => x.transportId))
      }
    },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    skip,
    take,
    select: {
      transportId: true,
      createdAt: true,
      fromMmaCode: true,
      toMmaCode: true,
      qty: true,
      amount: true
    }
  });

  const hasNext = dispatches.length > pageSize;
  const currentPageDispatches = hasNext ? dispatches.slice(0, pageSize) : dispatches;
  const ids = currentPageDispatches.map(d => d.transportId);

  // ---- Get only matching RECEIVES for those dispatch IDs ----
  const receives = ids.length
    ? await prisma.stockTransport.findMany({
        where: { transportId: { in: ids }, type: 'RECEIVE' },
        select: { transportId: true, qty: true, amount: true }
      })
    : [];

  const recMap = new Map(receives.map(r => [r.transportId, r]));

  // ---- Match and compute deltas ----
  const matched = currentPageDispatches
    .filter(d => recMap.has(d.transportId))
    .map(d => {
      const r = recMap.get(d.transportId);
      return {
        date: d.createdAt,
        transportId: d.transportId,
        lane: `${d.fromMmaCode}→${d.toMmaCode}`,
        qtyDispatch: Number(d.qty ?? 0),
        qtyReceive: Number(r.qty ?? 0),
        amountDispatch: Number(d.amount ?? 0),
        amountReceive: Number(r.amount ?? 0),
        qtyDelta: Number(r.qty ?? 0) - Number(d.qty ?? 0),
        amountDelta: Number(r.amount ?? 0) - Number(d.amount ?? 0)
      };
    });

  // ---- KPI (based on current page) ----
  const totalQtyDiff = matched.reduce((s, r) => s + r.qtyDelta, 0);
  const totalAmtDiff = matched.reduce((s, r) => s + r.amountDelta, 0);
  const total = matched.length;

  const kpis = { total, totalQtyDiff, totalAmtDiff };

  // ---- Get total record count for full pagination ----
  const grandTotal = await prisma.stockTransport.count({ where: { type: 'DISPATCH' } });
  const totalPages = Math.max(1, Math.ceil(grandTotal / pageSize));

  // ---- Build schema + envelope ----
  const schema = {
    columns: [
      { key: 'date', label: 'Date', type: 'datetime' },
      { key: 'transportId', label: 'TID' },
      { key: 'lane', label: 'From → To' },
      { key: 'qtyDispatch', label: 'Qty Dispatch' },
      { key: 'qtyReceive', label: 'Qty Receive' },
      { key: 'qtyDelta', label: 'Δ Qty' },
      { key: 'amountDispatch', label: 'Amount D' },
      { key: 'amountReceive', label: 'Amount R' },
      { key: 'amountDelta', label: 'Δ Amount' }
    ]
  };

  const envelope = makeEnvelope({
    meta: {
      reportId: 'reconciliation',
      title: 'Reconciliation — Dispatch vs Receive'
    },
    kpis,
    schema,
    rows: matched,
    paging: {
      page,
      pageSize,
      total: grandTotal,
      totalPages,
      hasPrev: page > 1,
      hasNext
    }
  });

  return { envelope };
};
