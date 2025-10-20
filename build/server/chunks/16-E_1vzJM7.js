import { p as prisma } from './stockEngine-jmqVw6zN.js';
import { p as parsePagination, m as makeEnvelope } from './index2-BXOVw4v4.js';
import '@prisma/client';
import 'crypto';

const PAGE_SIZE = 25;
const load = async ({ url }) => {
  const { page } = parsePagination(url, {
    defaultSort: "createdAt",
    defaultDir: "desc",
    allowedSorts: ["createdAt"],
    defaultPage: 1,
    defaultPageSize: PAGE_SIZE,
    maxPageSize: PAGE_SIZE
  });
  const receiveIdList = await prisma.stockTransport.findMany({
    where: { type: "RECEIVE" },
    select: { transportId: true }
  }).then((r) => r.map((x) => x.transportId));
  const skip = (page - 1) * PAGE_SIZE;
  const take = PAGE_SIZE + 1;
  const dispatches = await prisma.stockTransport.findMany({
    where: { type: "DISPATCH", transportId: { in: receiveIdList } },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip,
    take,
    select: {
      transportId: true,
      createdAt: true,
      fromMmaCode: true,
      toMmaCode: true,
      qty: true,
      amount: true
    }
  });
  const hasNext = dispatches.length > PAGE_SIZE;
  const currentPageDispatches = hasNext ? dispatches.slice(0, PAGE_SIZE) : dispatches;
  const ids = currentPageDispatches.map((d) => d.transportId);
  const receives = ids.length ? await prisma.stockTransport.findMany({
    where: { transportId: { in: ids }, type: "RECEIVE" },
    select: { transportId: true, qty: true, amount: true }
  }) : [];
  const recMap = new Map(receives.map((r) => [r.transportId, r]));
  const rows = currentPageDispatches.filter((d) => recMap.has(d.transportId)).map((d) => {
    const r = recMap.get(d.transportId);
    return {
      date: d.createdAt,
      transportId: d.transportId,
      lane: `${d.fromMmaCode}→${d.toMmaCode}`,
      qtyDispatch: Number(d.qty ?? 0),
      qtyReceive: Number(r.qty ?? 0),
      amountDispatch: Number(d.amount ?? 0),
      amountReceive: Number(r.amount ?? 0),
      qtyDelta: Number(r.qty ?? 0) - Number(d.qty ?? 0),
      amountDelta: Number(r.amount ?? 0) - Number(d.amount ?? 0)
    };
  });
  const grandTotal = await prisma.stockTransport.count({
    where: { type: "DISPATCH", transportId: { in: receiveIdList } }
  });
  const totalPages = Math.max(1, Math.ceil(grandTotal / PAGE_SIZE));
  const schema = {
    columns: [
      { key: "date", label: "Date", type: "datetime" },
      { key: "transportId", label: "TID" },
      { key: "lane", label: "From → To" },
      { key: "qtyDispatch", label: "Qty Dispatch" },
      { key: "qtyReceive", label: "Qty Receive" },
      { key: "qtyDelta", label: "Δ Qty" },
      { key: "amountDispatch", label: "Amount D" },
      { key: "amountReceive", label: "Amount R" },
      { key: "amountDelta", label: "Δ Amount" }
    ]
  };
  const envelope = makeEnvelope({
    meta: { reportId: "reconciliation", title: "Reconciliation — Dispatch vs Receive" },
    kpis: {},
    schema,
    rows,
    paging: {
      page,
      pageSize: PAGE_SIZE,
      // 👈 always 25
      total: grandTotal,
      totalPages,
      hasPrev: page > 1,
      hasNext
    }
  });
  return { envelope, PAGE_SIZE };
};

var _page_server = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 16;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-DdNyS5QW.js')).default;
const server_id = "src/routes/reports/reconciliation/+page.server.js";
const imports = ["_app/immutable/nodes/16.DFWouCUa.js","_app/immutable/chunks/BCQUcm9Y.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/BO599IY8.js","_app/immutable/chunks/CRYz92Wr.js","_app/immutable/chunks/CCnCa0Il.js","_app/immutable/chunks/CQr1oRp8.js","_app/immutable/chunks/D4gjX95n.js"];
const stylesheets = ["_app/immutable/assets/ListTable.BYIQk9lN.css","_app/immutable/assets/16.BEfp2oR1.css"];
const fonts = [];

export { component, fonts, imports, index, _page_server as server, server_id, stylesheets };
//# sourceMappingURL=16-E_1vzJM7.js.map
