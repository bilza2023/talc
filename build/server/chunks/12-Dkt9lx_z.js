import { p as prisma } from './stockEngine-jmqVw6zN.js';
import { p as parsePagination, r as resolveOrderBy } from './index2-BXOVw4v4.js';
import { p as paginateQuery, m as makeEnvelope } from './envelope-Dyxj18Ai.js';
import '@prisma/client';
import 'crypto';

async function run({ prisma: prisma2, url, params = {} }) {
  const settled = await prisma2.stockTransport.findMany({
    where: { type: { in: ["RECEIVE", "CANCEL"] } },
    select: { transportId: true },
    distinct: ["transportId"]
  });
  const settledIds = settled.map((s) => s.transportId);
  const { page, pageSize, sort, dir } = parsePagination(url, {
    defaultSort: "createdAt",
    defaultDir: "desc",
    allowedSorts: ["createdAt", "id", "qty", "amount", "supplierId", "toMmaCode"],
    idField: "id"
  });
  const orderBy = resolveOrderBy({ sort, dir, idField: "id" });
  const where = {
    type: "DISPATCH",
    ...params.toMmaCode ? { toMmaCode: String(params.toMmaCode) } : {},
    ...params.supplierId ? { supplierId: Number(params.supplierId) } : {},
    transportId: { notIn: settledIds }
  };
  const { rows, paging } = await paginateQuery(prisma2.stockTransport, {
    where,
    orderBy,
    page,
    pageSize,
    select: {
      id: true,
      createdAt: true,
      fromMmaCode: true,
      toMmaCode: true,
      transportId: true,
      supplierId: true,
      shade: true,
      size: true,
      qty: true,
      amount: true
    },
    totalMode: "count"
  });
  const rowsOut = rows.map((r) => ({
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
    meta: { reportId: "inbound", title: "Inbound (In-Transit)", defaultSort: { key: "createdAt", dir: "desc" } },
    schema: {
      columns: [
        { key: "date", label: "Date", type: "datetime" },
        { key: "transportId", label: "Txn" },
        { key: "lane", label: "Lane" },
        { key: "supplierId", label: "Supplier" },
        { key: "shade", label: "Shade" },
        { key: "size", label: "Size" },
        { key: "qty", label: "Qty" },
        { key: "amount", label: "Amount" }
      ]
    },
    rows: rowsOut,
    paging
  });
  return { envelope };
}
const load = async () => {
  const { envelope } = await run({ prisma });
  const kpis = envelope?.kpis ?? {
    jobs: envelope?.rows?.length ?? 0,
    qty: (envelope?.rows ?? []).reduce((s, r) => s + Number(r.qty || 0), 0)
  };
  const laneMap = /* @__PURE__ */ new Map();
  for (const r of envelope.rows ?? []) {
    const key = r.lane;
    const row = laneMap.get(key) ?? { lane: key, jobs: 0, qty: 0 };
    row.jobs += 1;
    row.qty += Number(r.qty || 0);
    laneMap.set(key, row);
  }
  const lanes = [...laneMap.values()].sort((a, b) => b.qty - a.qty);
  const rows = envelope.rows ?? [];
  const supOpts = Array.from(new Set(rows.map((r) => String(r.supplierId)))).sort();
  const laneOpts = Array.from(new Set(rows.map((r) => r.lane))).sort();
  const shadeOpts = Array.from(new Set(rows.map((r) => r.shade))).sort();
  const sizeOpts = Array.from(new Set(rows.map((r) => r.size))).sort();
  const options = { supplierId: supOpts, lane: laneOpts, shade: shadeOpts, size: sizeOpts };
  return { envelope, lanes, options, kpis };
};

var _page_server = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 12;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-B16BYPXs.js')).default;
const server_id = "src/routes/reports/in-transit/+page.server.js";
const imports = ["_app/immutable/nodes/12.DAJKABzC.js","_app/immutable/chunks/BCQUcm9Y.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/CQr1oRp8.js","_app/immutable/chunks/D4gjX95n.js"];
const stylesheets = ["_app/immutable/assets/ListTable.BYIQk9lN.css","_app/immutable/assets/12.Byzt6yPk.css","_app/immutable/assets/tokens.soP3Z-cK.css"];
const fonts = [];

export { component, fonts, imports, index, _page_server as server, server_id, stylesheets };
//# sourceMappingURL=12-Dkt9lx_z.js.map
