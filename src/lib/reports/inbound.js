// Inbound (unsettled incoming dispatches): latest record per transportId with status DISPATCH.
// Approach: compute settled transportIds once, then page remaining DISPATCH rows via paginateQuery.
// Notes in your API docs also describe this as a flat array; here we still return an envelope for consistency.
import { parsePagination, resolveOrderBy } from '../reportEngine/index.js';
import { paginateQuery } from '../reportEngine/prismaPage.js';
import { makeEnvelope } from '../reportEngine/envelope.js';

export async function run({ prisma, url, params = {} }) {
  // Identify settled transports (RECEIVE or CANCEL exists)
  const settled = await prisma.stockTransport.findMany({
    where: { type: { in: ['RECEIVE', 'CANCEL'] } },
    select: { transportId: true },
    distinct: ['transportId']
  });
  const settledIds = settled.map(s => s.transportId);

  const { page, pageSize, sort, dir } = parsePagination(url, {
    defaultSort: 'createdAt',
    defaultDir: 'desc',
    allowedSorts: ['createdAt', 'id', 'qty', 'amount', 'supplierId', 'toMmaCode'],
    idField: 'id'
  });
  const orderBy = resolveOrderBy({ sort, dir, idField: 'id' });

  const where = {
    type: 'DISPATCH',
    ...(params.toMmaCode ? { toMmaCode: String(params.toMmaCode) } : {}),
    ...(params.supplierId ? { supplierId: Number(params.supplierId) } : {}),
    transportId: { notIn: settledIds }
  };

  const { rows, paging } = await paginateQuery(prisma.stockTransport, {
    where,
    orderBy,
    page,
    pageSize,
    select: {
      id: true, createdAt: true,
      fromMmaCode: true, toMmaCode: true, transportId: true,
      supplierId: true, shade: true, size: true, qty: true, amount: true
    },
    totalMode: 'count'
  });

  const rowsOut = rows.map(r => ({
    date: r.createdAt,
    transportId: r.transportId,
    lane: `${r.fromMmaCode}→${r.toMmaCode}`,
    supplierId: r.supplierId,
    shade: r.shade,
    size: r.size,
    qty: r.qty,
    amount: r.amount ?? 0
  }));

  const envelope = makeEnvelope({
    meta: { reportId: 'inbound', title: 'Inbound (In-Transit)', defaultSort: { key: 'createdAt', dir: 'desc' } },
    schema: {
      columns: [
        { key: 'date',        label: 'Date', type: 'datetime' },
        { key: 'transportId', label: 'Txn' },
        { key: 'lane',        label: 'Lane' },
        { key: 'supplierId',  label: 'Supplier' },
        { key: 'shade',       label: 'Shade' },
        { key: 'size',        label: 'Size' },
        { key: 'qty',         label: 'Qty' },
        { key: 'amount',      label: 'Amount' }
      ]
    },
    rows: rowsOut,
    paging
  });

  return { envelope };
}
