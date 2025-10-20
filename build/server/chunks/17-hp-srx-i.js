import { p as prisma } from './stockEngine-jmqVw6zN.js';
import { p as parsePagination, r as resolveOrderBy } from './index2-BXOVw4v4.js';
import { p as paginateQuery, m as makeEnvelope } from './envelope-Dyxj18Ai.js';
import '@prisma/client';
import 'crypto';

const load = async ({ url }) => {
  const { page, pageSize, sort, dir } = parsePagination(url, {
    defaultSort: "createdAt",
    defaultDir: "desc",
    allowedSorts: ["createdAt", "id", "qtyT", "committedAt"],
    idField: "id"
  });
  const orderBy = resolveOrderBy({ sort, dir, idField: "id" });
  const { rows: rawRows, paging } = await paginateQuery(prisma.screening_tbl, {
    where: {},
    orderBy,
    page,
    pageSize,
    select: {
      id: true,
      createdAt: true,
      qtyT: true,
      // Prisma.Decimal -> convert below
      committedAt: true
    },
    totalMode: "none"
  });
  const toNum = (v) => v == null ? null : Number(v);
  const toISO = (d) => d ? new Date(d).toISOString() : null;
  const rows = rawRows.map((r) => ({
    createdAt: toISO(r.createdAt),
    id: r.id,
    qtyT: toNum(r.qtyT),
    committedAt: toISO(r.committedAt),
    status: r.committedAt ? "COMMITTED" : "PENDING"
  }));
  const envelope = makeEnvelope({
    meta: {
      reportId: "screening",
      title: "Screening Runs",
      defaultSort: { key: "createdAt", dir: "desc" }
    },
    schema: {
      columns: [
        { key: "createdAt", label: "Date", type: "datetime" },
        { key: "id", label: "ID" },
        { key: "qtyT", label: "Qty (t)", type: "number" },
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

const index = 17;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-Bs18efXX.js')).default;
const server_id = "src/routes/reports/screening/+page.server.js";
const imports = ["_app/immutable/nodes/17.8KDQW5lm.js","_app/immutable/chunks/BCQUcm9Y.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/CQr1oRp8.js","_app/immutable/chunks/D4gjX95n.js"];
const stylesheets = ["_app/immutable/assets/ListTable.BYIQk9lN.css","_app/immutable/assets/17.CLTIazQb.css","_app/immutable/assets/tokens.soP3Z-cK.css"];
const fonts = [];

export { component, fonts, imports, index, _page_server as server, server_id, stylesheets };
//# sourceMappingURL=17-hp-srx-i.js.map
