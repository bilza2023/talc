// Reconciliation: one row per transportId summarizing DISPATCH vs RECEIVE/CANCEL.
import { parsePagination, resolveOrderBy } from '../../src/lib/reportEngine/index.js';
import { paginateQuery } from '../../src/lib/reportEngine/prismaPage.js';
import { makeEnvelope } from '../../src/lib/reportEngine/envelope.js';

function arrayDelegate(rows) {
  return {
    async count() { return rows.length; },
    async findMany({ orderBy = [], skip = 0, take, select } = {}) {
      let out = [...rows];
      for (let i = orderBy.length - 1; i >= 0; i--) {
        const spec = orderBy[i];
        const [k, dir] = Object.entries(spec)[0];
        out.sort((a, b) => {
          const av = a[k], bv = b[k];
          if (av === bv) return 0;
          const cmp = av < bv ? -1 : 1;
          return dir === 'asc' ? cmp : -cmp;
        });
      }
      if (skip) out = out.slice(skip);
      if (take != null) out = out.slice(0, take);
      if (select) {
        out = out.map(r => Object.fromEntries(Object.keys(select).filter(k => select[k]).map(k => [k, r[k]])));
      }
      return out;
    }
  };
}

export async function run({ prisma, url, params = {} }) {
  const events = await prisma.stockTransport.findMany({
    where: {
      ...(params.fromMmaCode ? { fromMmaCode: String(params.fromMmaCode) } : {}),
      ...(params.toMmaCode ? { toMmaCode: String(params.toMmaCode) } : {}),
      ...(params.supplierId ? { supplierId: Number(params.supplierId) } : {})
    },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    select: {
      id: true, createdAt: true, type: true, transportId: true,
      fromMmaCode: true, toMmaCode: true,
      supplierId: true, shade: true, size: true, qty: true, amount: true
    }
  });

  const latestById = new Map();
  for (const e of events) if (!latestById.has(e.transportId)) latestById.set(e.transportId, e);

  const rowsAll = [];
  for (const latest of latestById.values()) {
    let status = 'IN_TRANSIT';
    if (latest.type === 'RECEIVE') status = 'RECEIVED';
    if (latest.type === 'CANCEL')  status = 'CANCELED';

    const dispatch = await prisma.stockTransport.findFirst({
      where: { transportId: latest.transportId, type: 'DISPATCH' },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      select: { qty: true, amount: true, shade: true, size: true, createdAt: true, id: true }
    });

    const recv = (status === 'RECEIVED')
      ? { qty: latest.qty, amount: latest.amount ?? 0, createdAt: latest.createdAt }
      : null;

    rowsAll.push({
      createdAt: latest.createdAt,
      id: latest.id,
      transportId: latest.transportId,
      lane: `${latest.fromMmaCode}→${latest.toMmaCode}`,
      supplierId: latest.supplierId,
      dispatchQty: dispatch?.qty ?? null,
      dispatchAmount: dispatch?.amount ?? null,
      receiveQty: recv?.qty ?? null,
      receiveAmount: recv?.amount ?? null,
      qtyDelta: recv && dispatch ? (recv.qty - dispatch.qty) : null,
      amountDelta: recv && dispatch ? ((recv.amount ?? 0) - (dispatch.amount ?? 0)) : null,
      status,
      shade: dispatch?.shade ?? latest.shade,
      size: dispatch?.size ?? latest.size
    });
  }

  const { page, pageSize, sort, dir } = parsePagination(url, {
    defaultSort: 'createdAt',
    defaultDir: 'desc',
    allowedSorts: ['createdAt', 'id', 'status', 'supplierId', 'qtyDelta', 'amountDelta'],
    idField: 'id'
  });
  const orderBy = resolveOrderBy({ sort, dir, idField: 'id' });

  const { rows, paging } = await paginateQuery(arrayDelegate(rowsAll), {
    orderBy,
    page,
    pageSize,
    select: {
      createdAt: true, id: true, transportId: true, lane: true, supplierId: true,
      dispatchQty: true, receiveQty: true, qtyDelta: true,
      dispatchAmount: true, receiveAmount: true, amountDelta: true,
      status: true, shade: true, size: true
    },
    totalMode: 'count'
  });

  const envelope = makeEnvelope({
    meta: { reportId: 'reconciliation', title: 'Logistics Reconciliation', defaultSort: { key: 'createdAt', dir: 'desc' } },
    schema: {
      columns: [
        { key: 'createdAt',     label: 'Last Event', type: 'datetime' },
        { key: 'transportId',   label: 'Txn' },
        { key: 'lane',          label: 'Lane' },
        { key: 'supplierId',    label: 'Supplier' },
        { key: 'shade',         label: 'Shade' },
        { key: 'size',          label: 'Size' },
        { key: 'dispatchQty',   label: 'Dispatched' },
        { key: 'receiveQty',    label: 'Received' },
        { key: 'qtyDelta',      label: 'Δ Qty' },
        { key: 'dispatchAmount',label: 'Dispatched ₹' },
        { key: 'receiveAmount', label: 'Received ₹' },
        { key: 'amountDelta',   label: 'Δ ₹' },
        { key: 'status',        label: 'Status' },
        { key: 'id',            label: 'ID' }
      ]
    },
    rows,
    paging
  });

  return { envelope };
}
