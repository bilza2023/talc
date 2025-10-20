import { p as prisma } from "../../../../chunks/stockEngine.js";
import { p as parsePagination, r as resolveOrderBy } from "../../../../chunks/index2.js";
import { p as paginateQuery, m as makeEnvelope } from "../../../../chunks/envelope.js";
const DEFAULT_PAGE_SIZE = 25;
const load = async ({ url }) => {
  const { page, pageSize, sort, dir } = parsePagination(url, {
    defaultSort: "createdAt",
    defaultDir: "desc",
    allowedSorts: ["createdAt", "id", "committedAt"],
    idField: "id",
    defaultPageSize: DEFAULT_PAGE_SIZE
  });
  const orderBy = resolveOrderBy({ sort, dir, idField: "id" });
  const { rows: headers, paging } = await paginateQuery(prisma.sorting_tbl, {
    where: {},
    orderBy,
    page,
    pageSize,
    select: {
      id: true,
      createdAt: true,
      committedAt: true,
      ht: true,
      wastage: true
    },
    totalMode: "none"
  });
  const ids = headers.map((h) => String(h.id));
  let sums = [];
  if (ids.length) {
    sums = await prisma.stockLedger.groupBy({
      by: ["linkId"],
      where: {
        linkId: { in: ids },
        reason: "PROCESS",
        qtyDelta: { gt: 0 }
      },
      _sum: { qtyDelta: true }
    });
  }
  const outMap = new Map(sums.map((s) => [String(s.linkId), Number(s._sum.qtyDelta || 0)]));
  const toNum = (v) => v == null ? null : Number(v);
  const toISO = (d) => d ? new Date(d).toISOString() : null;
  const rows = headers.map((h) => ({
    createdAt: toISO(h.createdAt),
    id: h.id,
    qtyOutT: toNum(outMap.get(String(h.id)) || 0),
    ht: toNum(h.ht),
    wastage: toNum(h.wastage),
    committedAt: toISO(h.committedAt),
    status: h.committedAt ? "COMMITTED" : "PENDING"
  }));
  const envelope = makeEnvelope({
    meta: {
      reportId: "sorting",
      title: "Sorting Runs",
      defaultSort: { key: "createdAt", dir: "desc" }
    },
    schema: {
      columns: [
        { key: "createdAt", label: "Date", type: "datetime" },
        { key: "id", label: "ID" },
        { key: "qtyOutT", label: "Qty Out (t)", type: "number" },
        { key: "ht", label: "HT", type: "number" },
        { key: "wastage", label: "Wastage", type: "number" },
        { key: "committedAt", label: "Committed", type: "datetime" },
        { key: "status", label: "Status" }
      ]
    },
    rows,
    paging
  });
  return { envelope };
};
export {
  load
};
