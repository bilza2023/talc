// Supplier-focused ledger view (filter by supplierId required; other filters optional)
import { parsePagination, resolveOrderBy } from '../reportEngine/index.js';
import { paginateQuery } from '../reportEngine/prismaPage.js';
import { makeEnvelope } from  '../reportEngine/envelope.js';

export async function run({ prisma, url, params = {} }) {
  const supplierId = Number(params.supplierId);
  if (!Number.isFinite(supplierId)) throw new Error('supplierId required');

  const { page, pageSize, sort, dir } = parsePagination(url, {
    defaultSort: 'createdAt',
    defaultDir: 'desc',
    allowedSorts: ['createdAt', 'id', 'qtyDelta', 'mmaCode', 'shade', 'size'],
    idField: 'id'
  });
  const orderBy = resolveOrderBy({ sort, dir, idField: 'id' });

  const where = {
    supplierId,
    ...(params.mmaCode ? { mmaCode: String(params.mmaCode) } : {}),
    ...(params.shade ? { shade: String(params.shade) } : {}),
    ...(params.size ? { size: String(params.size) } : {})
  };

  const { rows, paging } = await paginateQuery(prisma.stockLedger, {
    where,
    orderBy,
    page,
    pageSize,
    select: {
      id: true, createdAt: true, mmaCode: true, shade: true, size: true, qtyDelta: true, reason: true, linkId: true
    },
    totalMode: 'count'
  });

  const envelope = makeEnvelope({
    meta: { reportId: 'supplier_ledger', title: `Supplier Ledger · #${supplierId}`, defaultSort: { key: 'createdAt', dir: 'desc' } },
    schema: {
      columns: [
        { key: 'createdAt', label: 'Date', type: 'datetime' },
        { key: 'mmaCode',   label: 'MMA' },
        { key: 'shade',     label: 'Shade' },
        { key: 'size',      label: 'Size' },
        { key: 'qtyDelta',  label: 'Δ Qty' },
        { key: 'reason',    label: 'Reason' },
        { key: 'linkId',    label: 'Link' },
        { key: 'id',        label: 'ID' }
      ]
    },
    rows,
    paging
  });

  return { envelope };
}
