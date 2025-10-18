// Screening Report (ListTable envelope) — POJO-safe serialization
import { prisma } from '$lib/stocks/stockEngine.js';

import { parsePagination, resolveOrderBy } from '$lib/reportEngine/index.js';
import { paginateQuery } from '$lib/reportEngine/prismaPage.js';
import { makeEnvelope } from '$lib/reportEngine/envelope.js';

export const load = async ({ url }) => {
  const { page, pageSize, sort, dir } = parsePagination(url, {
    defaultSort: 'createdAt',
    defaultDir: 'desc',
    allowedSorts: ['createdAt', 'id', 'qtyT', 'committedAt'],
    idField: 'id'
  });

  const orderBy = resolveOrderBy({ sort, dir, idField: 'id' });

  // Read header rows from screening_tbl
  const { rows: rawRows, paging } = await paginateQuery(prisma.screening_tbl, {
    where: {},
    orderBy,
    page,
    pageSize,
    select: {
      id: true,
      createdAt: true,
      qtyT: true,          // Prisma.Decimal -> convert below
      committedAt: true
    },
    totalMode: 'none'
  });

  // ---- Ensure everything is a plain JSON type (no Decimal, no Date objects) ----
  const toNum = (v) => (v == null ? null : Number(v));
  const toISO = (d) => (d ? new Date(d).toISOString() : null);

  const rows = rawRows.map((r) => ({
    createdAt:   toISO(r.createdAt),
    id:          r.id,
    qtyT:        toNum(r.qtyT),
    committedAt: toISO(r.committedAt),
    status:      r.committedAt ? 'COMMITTED' : 'PENDING'
  }));

  const envelope = makeEnvelope({
    meta: {
      reportId: 'screening',
      title: 'Screening Runs',
      defaultSort: { key: 'createdAt', dir: 'desc' }
    },
    schema: {
      columns: [
        { key: 'createdAt',   label: 'Date',      type: 'datetime' },
        { key: 'id',          label: 'ID' },
        { key: 'qtyT',        label: 'Qty (t)',   type: 'number' },
        { key: 'committedAt', label: 'Committed', type: 'datetime' },
        { key: 'status',      label: 'Status' }
      ]
    },
    rows,
    paging
  });
 
  // console.log("envelope" , envelope);

  return { envelope };
};
