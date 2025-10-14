// Logistics — Reconciliation (Dispatch vs Receive only)
import { prisma } from '$lib/stocks/stockEngine.js';
import { parsePagination, makeEnvelope } from '$lib/reportEngine/index.js';

export const load = async ({ url }) => {
  const { page, pageSize } = parsePagination(url, {
    defaultSort: 'createdAt',
    defaultDir: 'desc',
    allowedSorts: ['createdAt'],
  });

  // --- All DISPATCHES ---
  const dispatches = await prisma.stockTransport.findMany({
    where: { type: 'DISPATCH' },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    select: {
      transportId: true,
      createdAt: true,
      fromMmaCode: true,
      toMmaCode: true,
      qty: true,
      amount: true
    }
  });
  const ids = dispatches.map(d => d.transportId);

  // --- Only RECEIVES (ignore canceled/in-transit) ---
  const receives = ids.length
    ? await prisma.stockTransport.findMany({
        where: { transportId: { in: ids }, type: 'RECEIVE' },
        select: { transportId: true, qty: true, amount: true }
      })
    : [];

  const recMap = new Map(receives.map(r => [r.transportId, r]));

  // --- Match and compute deltas ---
  const matched = dispatches
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

  // --- KPI ---
  const total = matched.length;
  const totalQtyDiff = matched.reduce((s, r) => s + r.qtyDelta, 0);
  const totalAmtDiff = matched.reduce((s, r) => s + r.amountDelta, 0);

  const kpis = { total, totalQtyDiff, totalAmtDiff };

  // --- Pagination ---
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const paged = matched.slice(start, start + pageSize);
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  // --- Schema + Envelope ---
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
    rows: paged,
    paging: { page, pageSize, total, totalPages, hasPrev, hasNext }
  });

  return { envelope };
};
