
// Server-side report: General Ledger (stockLedger)
// Sort/paging via reportEngine; deterministic order by createdAt + id.
// Filters: supplierId?, mmaCode?, shade?, size?, date range?
import { parsePagination, resolveOrderBy } from '../reportEngine/index.js';
import { paginateQuery } from '../reportEngine/prismaPage.js';
import { makeEnvelope } from  '../reportEngine/envelope.js';

export async function run({ prisma, url, params = {} }) {
  const { page, pageSize, sort, dir } = parsePagination(url, {
    defaultSort: 'createdAt',
    defaultDir: 'desc',
    allowedSorts: ['createdAt', 'id', 'qtyDelta', 'supplierId', 'mmaCode', 'size', 'shade'],
    idField: 'id'
  });
  const orderBy = resolveOrderBy({ sort, dir, idField: 'id' });

  const where = {
    ...(params.supplierId ? { supplierId: Number(params.supplierId) } : {}),
    ...(params.mmaCode ? { mmaCode: String(params.mmaCode) } : {}),
    ...(params.shade ? { shade: String(params.shade) } : {}),
    ...(params.size ? { size: String(params.size) } : {}),
    ...(params.from || params.to
      ? {
          createdAt: {
            ...(params.from ? { gte: new Date(params.from) } : {}),
            ...(params.to ? { lte: new Date(params.to) } : {})
          }
        }
      : {})
  };

  const { rows, paging } = await paginateQuery(prisma.stockLedger, {
    where,
    orderBy,
    page,
    pageSize,
    select: {
      id: true,
      createdAt: true,
      mmaCode: true,
      supplierId: true,
      shade: true,
      size: true,
      qtyDelta: true,
      reason: true,
      linkId: true
    },
    totalMode: 'count'
  });

  const envelope = makeEnvelope({
    meta: {
      reportId: 'ledger',
      title: 'Stock Ledger',
      defaultSort: { key: 'createdAt', dir: 'desc' }
    },
    schema: {
      columns: [
        { key: 'createdAt', label: 'Date', type: 'datetime' },
        { key: 'id',        label: 'ID' },
        { key: 'mmaCode',   label: 'MMA' },
        { key: 'supplierId',label: 'Supplier' },
        { key: 'shade',     label: 'Shade' },
        { key: 'size',      label: 'Size' },
        { key: 'qtyDelta',  label: 'Δ Qty' },
        { key: 'reason',    label: 'Reason' },
        { key: 'linkId',    label: 'Link' }
      ]
    },
    rows,
    paging
  });

  return { envelope };
}
