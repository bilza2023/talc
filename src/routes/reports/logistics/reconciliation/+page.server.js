// Logistics — Reconciliation (Dispatch vs Receive only, SERVER-SIDE pagination, table-only)
import { prisma } from '$lib/stocks/stockEngine.js';
import { parsePagination, makeEnvelope } from '$lib/reportEngine/index.js';

// 🔒 single source of truth for page size (ignore URL pageSize)
const PAGE_SIZE = 25;

export const load = async ({ url }) => {
  // only read the current page from URL; do NOT trust pageSize from query
  const { page } = parsePagination(url, {
    defaultSort: 'createdAt',
    defaultDir: 'desc',
    allowedSorts: ['createdAt'],
    defaultPage: 1,
    defaultPageSize: PAGE_SIZE,
    maxPageSize: PAGE_SIZE
  });

  // Build the set of transportIds that HAVE a RECEIVE (filter base & count)
  const receiveIdList = await prisma.stockTransport.findMany({
    where: { type: 'RECEIVE' },
    select: { transportId: true }
  }).then(r => r.map(x => x.transportId));

  // Prisma paging — always 25 per page
  const skip = (page - 1) * PAGE_SIZE;
  const take = PAGE_SIZE + 1; // +1 to detect hasNext

  // Only DISPATCH rows that have a matching RECEIVE
  const dispatches = await prisma.stockTransport.findMany({
    where: { type: 'DISPATCH', transportId: { in: receiveIdList } },
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

  const hasNext = dispatches.length > PAGE_SIZE;
  const currentPageDispatches = hasNext ? dispatches.slice(0, PAGE_SIZE) : dispatches;
  const ids = currentPageDispatches.map(d => d.transportId);

  // Receives for just this page
  const receives = ids.length
    ? await prisma.stockTransport.findMany({
        where: { transportId: { in: ids }, type: 'RECEIVE' },
        select: { transportId: true, qty: true, amount: true }
      })
    : [];
  const recMap = new Map(receives.map(r => [r.transportId, r]));

  // Table rows (dispatch vs receive)
  const rows = currentPageDispatches
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

  // Total matched pairs (for totalPages)
  const grandTotal = await prisma.stockTransport.count({
    where: { type: 'DISPATCH', transportId: { in: receiveIdList } }
  });
  const totalPages = Math.max(1, Math.ceil(grandTotal / PAGE_SIZE));

  // Schema + envelope
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
    meta: { reportId: 'reconciliation', title: 'Reconciliation — Dispatch vs Receive' },
    kpis: {},
    schema,
    rows,
    paging: {
      page,
      pageSize: PAGE_SIZE,   // 👈 always 25
      total: grandTotal,
      totalPages,
      hasPrev: page > 1,
      hasNext
    }
  });

  return { envelope, PAGE_SIZE };
};
