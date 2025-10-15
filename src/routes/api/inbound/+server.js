import { prisma } from '$lib/stocks/stockEngine.js';
import { parsePagination, makeEnvelope } from '$lib/reportEngine/index.js';

const PAGE_SIZE = 25;

export const load = async ({ url }) => {
  const { page } = parsePagination(url, {
    defaultSort: 'createdAt',
    defaultDir: 'desc',
    allowedSorts: ['createdAt'],
    defaultPage: 1, defaultPageSize: PAGE_SIZE, maxPageSize: PAGE_SIZE
  });

  // 1) Total unsettled (count distinct TIDs)
  const [{ c: total }] = await prisma.$queryRaw`
    SELECT COUNT(*) AS c
    FROM (
      SELECT d.transportId
      FROM "StockTransport" d
      WHERE d.type = 'DISPATCH'
        AND d.transportId IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM "StockTransport" s
          WHERE s.transportId = d.transportId
            AND s.type IN ('RECEIVE','CANCEL')
        )
      GROUP BY d.transportId
    ) t
  `;

  const totalPages = Math.max(1, Math.ceil(Number(total) / PAGE_SIZE));
  const offset = (page - 1) * PAGE_SIZE;

  // 2) Page of unsettled TIDs (newest first by dispatch time)
  const pageHeads = await prisma.$queryRaw`
    SELECT d.transportId, MAX(d.createdAt) AS createdAt
    FROM "StockTransport" d
    WHERE d.type = 'DISPATCH'
      AND d.transportId IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM "StockTransport" s
        WHERE s.transportId = d.transportId
          AND s.type IN ('RECEIVE','CANCEL')
      )
    GROUP BY d.transportId
    ORDER BY createdAt DESC
    LIMIT ${PAGE_SIZE} OFFSET ${offset}
  `;

  const pageIds = pageHeads.map(r => String(r.transportId));
  let rows = [];

  if (pageIds.length) {
    // 3) Fetch details for those TIDs; take the latest DISPATCH per TID
    const detail = await prisma.$queryRaw`
      SELECT createdAt, transportId, fromMmaCode, toMmaCode,
             supplierId, shade, size, qty, amount
      FROM "StockTransport"
      WHERE type = 'DISPATCH' AND transportId IN (${prisma.join(pageIds)})
      ORDER BY createdAt DESC, id DESC
    `;

    const seen = new Set();
    rows = detail
      .filter(r => { const k = String(r.transportId); if (seen.has(k)) return false; seen.add(k); return true; })
      .map(d => ({
        date: d.createdAt,
        transportId: String(d.transportId),
        lane: `${d.fromMmaCode}→${d.toMmaCode}`,
        supplierId: d.supplierId,
        shade: d.shade,
        size: d.size,
        qty: Number(d.qty ?? 0),
        amount: Number(d.amount ?? 0)
      }));
  }

  const schema = {
    columns: [
      { key: 'date',        label: 'Date', type: 'datetime' },
      { key: 'transportId', label: 'TID' },
      { key: 'lane',        label: 'From → To' },
      { key: 'supplierId',  label: 'Supplier' },
      { key: 'shade',       label: 'Shade' },
      { key: 'size',        label: 'Size' },
      { key: 'qty',         label: 'Qty' },
      { key: 'amount',      label: 'Amount' }
    ]
  };

  const envelope = makeEnvelope({
    meta: { reportId: 'in_transit', title: 'Logistics — In-Transit' },
    schema,
    rows,
    paging: {
      page, pageSize: PAGE_SIZE, total: Number(total),
      totalPages, hasPrev: page > 1, hasNext: page < totalPages
    }
  });

  return { envelope };
};
