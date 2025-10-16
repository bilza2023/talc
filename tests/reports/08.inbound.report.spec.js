
import { parsePagination, resolveOrderBy } from '../../src/lib/reportEngine/index.js';
import { paginateQuery } from '../../src/lib/reportEngine/prismaPage.js';
import { makeEnvelope } from '../../src/lib/reportEngine/envelope.js';


export async function run({ prisma, url, params = {} }) {
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
