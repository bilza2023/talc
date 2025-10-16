// Flat transport event log (DISPATCH/RECEIVE/CANCEL), optionally filtered by lane/mma/supplier/date.
// Uses deterministic ordering (createdAt, id).
import { parsePagination, resolveOrderBy } from '../reportEngine/index.js';
import { paginateQuery } from '../reportEngine/prismaPage.js';
import { makeEnvelope } from  '../reportEngine/envelope.js';

export async function run({ prisma, url, params = {} }) {
  const { page, pageSize, sort, dir } = parsePagination(url, {
    defaultSort: 'createdAt',
    defaultDir: 'desc',
    allowedSorts: ['createdAt', 'id', 'type', 'qty', 'amount', 'supplierId', 'fromMmaCode', 'toMmaCode'],
    idField: 'id'
  });
  const orderBy = resolveOrderBy({ sort, dir, idField: 'id' });

  const where = {
    ...(params.type ? { type: String(params.type) } : {}),
    ...(params.fromMmaCode ? { fromMmaCode: String(params.fromMmaCode) } : {}),
    ...(params.toMmaCode ? { toMmaCode: String(params.toMmaCode) } : {}),
    ...(params.supplierId ? { supplierId: Number(params.supplierId) } : {}),
    ...(params.from || params.to
      ? {
          createdAt: {
            ...(params.from ? { gte: new Date(params.from) } : {}),
            ...(params.to ? { lte: new Date(params.to) } : {})
          }
        }
      : {})
  };

  const { rows, paging } = await paginateQuery(prisma.stockTransport, {
    where,
    orderBy,
    page,
    pageSize,
    select: {
      id: true, createdAt: true, type: true,
      fromMmaCode: true, toMmaCode: true,
      transportId: true, supplierId: true, shade: true, size: true, qty: true, amount: true
    },
    totalMode: 'count'
  });

  // decorate lane for convenience (UI will likely need it)
  const rowsOut = rows.map(r => ({ ...r, lane: `${r.fromMmaCode}→${r.toMmaCode}` }));

  const envelope = makeEnvelope({
    meta: { reportId: 'transport_log', title: 'Transport Log', defaultSort: { key: 'createdAt', dir: 'desc' } },
    schema: {
      columns: [
        { key: 'createdAt',  label: 'Date', type: 'datetime' },
        { key: 'id',         label: 'ID' },
        { key: 'type',       label: 'Type' },
        { key: 'lane',       label: 'Lane' },
        { key: 'transportId',label: 'Txn' },
        { key: 'supplierId', label: 'Supplier' },
        { key: 'shade',      label: 'Shade' },
        { key: 'size',       label: 'Size' },
        { key: 'qty',        label: 'Qty' },
        { key: 'amount',     label: 'Amount' }
      ]
    },
    rows: rowsOut,
    paging
  });

  return { envelope };
}
