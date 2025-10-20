import { p as prisma } from './stockEngine-jmqVw6zN.js';
import { p as parsePagination, r as resolveOrderBy } from './index2-BXOVw4v4.js';
import { p as paginateQuery, m as makeEnvelope } from './envelope-Dyxj18Ai.js';
import '@prisma/client';
import 'crypto';

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

var _page_server = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 19;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-Bbh4b9Ix.js')).default;
const server_id = "src/routes/reports/sorting/+page.server.js";
const imports = ["_app/immutable/nodes/19.BhNzy4w7.js","_app/immutable/chunks/BCQUcm9Y.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/CQr1oRp8.js","_app/immutable/chunks/D4gjX95n.js"];
const stylesheets = ["_app/immutable/assets/ListTable.BYIQk9lN.css","_app/immutable/assets/17.CLTIazQb.css","_app/immutable/assets/tokens.soP3Z-cK.css"];
const fonts = [];

export { component, fonts, imports, index, _page_server as server, server_id, stylesheets };
//# sourceMappingURL=19-H_iKud_Y.js.map
