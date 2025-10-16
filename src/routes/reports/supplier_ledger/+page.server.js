// Reconciliation report loader (aligned to supplierLedger's shape)
import { prisma } from '$lib/stocks/stockEngine.js';

export const load = async ({ url }) => {
  // Paging (fixed 25)
  const page = Math.max(1, Number(url.searchParams.get('page') || 1));
  const pageSize = 25;
  const skip = (page - 1) * pageSize;
  const take = pageSize + 1; // sentinel for hasNext
  const baseIndex = (page - 1) * pageSize;

  // 1) Get transportIds that have a RECEIVE
  const receiveIds = await prisma.stockTransport.findMany({
    where: { type: 'RECEIVE' },
    select: { transportId: true }
  }).then(list => list.map(x => x.transportId));

  // 2) Page DISPATCH rows that also have a RECEIVE
  const dispatches = await prisma.stockTransport.findMany({
    where: { type: 'DISPATCH', transportId: { in: receiveIds } },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    skip,
    take,
    select: {
      id: true,
      transportId: true,
      createdAt: true,
      fromMmaCode: true,
      toMmaCode: true,
      qty: true,
      amount: true
    }
  });

  const hasNext = dispatches.length > pageSize;
  const pageSlice = hasNext ? dispatches.slice(0, pageSize) : dispatches;
  const ids = pageSlice.map(d => d.transportId);

  // 3) Receives for the current page’s transportIds
  const receives = ids.length
    ? await prisma.stockTransport.findMany({
        where: { type: 'RECEIVE', transportId: { in: ids } },
        select: { transportId: true, qty: true, amount: true }
      })
    : [];
  const recMap = new Map(receives.map(r => [r.transportId, r]));

  // 4) Build rows — align keys to supplierLedger pattern
  const rows = pageSlice
    .filter(d => recMap.has(d.transportId))
    .map((d, i) => {
      const r = recMap.get(d.transportId);
      const qtyD = Number(d.qty ?? 0);
      const qtyR = Number(r.qty ?? 0);
      const amtD = Number(d.amount ?? 0);
      const amtR = Number(r.amount ?? 0);

      return {
        // required stable key (your ListTable may default to 'id')
        id: d.transportId,                      // use transportId as the row id
        createdAt: d.createdAt,                 // use createdAt (not 'date')
        transportId: d.transportId,             // for the TID column
        lane: `${d.fromMmaCode}→${d.toMmaCode}`,
        qtyDispatch: qtyD,
        qtyReceive: qtyR,
        qtyDelta: qtyR - qtyD,
        amountDispatch: amtD,
        amountReceive: amtR,
        amountDelta: amtR - amtD,
        // handy S.No if you want to show it later
        sNo: baseIndex + i + 1
      };
    });

  // 5) Count for total pages
  const totalDispatchWithReceive = await prisma.stockTransport.count({
    where: { type: 'DISPATCH', transportId: { in: receiveIds } }
  });
  const totalPages = Math.max(1, Math.ceil(totalDispatchWithReceive / pageSize));

  // 6) Schema — first column key changed to 'createdAt'
  const schema = {
    columns: [
      { key: 'createdAt',     label: 'Date', type: 'datetime' }, // ← align to demo
      { key: 'transportId',   label: 'TID' },
      { key: 'lane',          label: 'From → To' },
      { key: 'qtyDispatch',   label: 'Qty Dispatch' },
      { key: 'qtyReceive',    label: 'Qty Receive' },
      { key: 'qtyDelta',      label: 'Δ Qty' },
      { key: 'amountDispatch', label: 'Amount D' },
      { key: 'amountReceive',  label: 'Amount R' },
      { key: 'amountDelta',    label: 'Δ Amount' }
    ]
  };

  const envelope = {
    meta: { reportId: 'reconciliation', title: 'Reconciliation' },
    schema,
    rows,
    paging: {
      page,
      pageSize,
      total: totalDispatchWithReceive,
      totalPages,
      hasPrev: page > 1,
      hasNext
    }
  };

  return { envelope };
};
