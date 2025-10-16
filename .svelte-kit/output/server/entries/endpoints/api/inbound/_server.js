import { p as prisma } from "../../../../chunks/stockEngine.js";
import { p as parsePagination, m as makeEnvelope } from "../../../../chunks/index2.js";
const PAGE_SIZE = 25;
async function makeInboundEnvelope(url) {
  const sp = url instanceof URL ? url.searchParams : new URL(url, "http://x/").searchParams;
  const mmaCode = sp.get("mmaCode") || void 0;
  const { page } = parsePagination(url, {
    defaultSort: "createdAt",
    defaultDir: "desc",
    allowedSorts: ["createdAt"],
    defaultPage: 1,
    defaultPageSize: PAGE_SIZE,
    maxPageSize: PAGE_SIZE
  });
  const dispatchWhere = {
    type: "DISPATCH",
    ...mmaCode ? { toMmaCode: mmaCode } : {}
  };
  const dispatchRows = await prisma.stockTransport.findMany({
    where: dispatchWhere,
    select: {
      id: true,
      createdAt: true,
      transportId: true,
      fromMmaCode: true,
      toMmaCode: true,
      supplierId: true,
      shade: true,
      size: true,
      qty: true,
      amount: true
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }]
  });
  const latestByTid = /* @__PURE__ */ new Map();
  for (const d of dispatchRows) {
    const tid = String(d.transportId);
    if (!latestByTid.has(tid)) latestByTid.set(tid, d);
  }
  const latest = Array.from(latestByTid.values());
  const tids = latest.map((r) => String(r.transportId));
  let unsettled = latest;
  if (tids.length) {
    const settlements = await prisma.stockTransport.findMany({
      where: { transportId: { in: tids }, type: { in: ["RECEIVE", "CANCEL"] } },
      select: { transportId: true }
    });
    const settledSet = new Set(settlements.map((s) => String(s.transportId)));
    unsettled = latest.filter((r) => !settledSet.has(String(r.transportId)));
  }
  const total = unsettled.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const pageRows = unsettled.slice(start, end);
  const rows = pageRows.map((d) => ({
    date: d.createdAt,
    transportId: String(d.transportId),
    lane: `${d.fromMmaCode}→${d.toMmaCode}`,
    supplierId: d.supplierId,
    shade: d.shade,
    size: d.size,
    qty: Number(d.qty ?? 0),
    amount: Number(d.amount ?? 0)
  }));
  const schema = {
    columns: [
      { key: "date", label: "Date", type: "datetime" },
      { key: "transportId", label: "TID" },
      { key: "lane", label: "From → To" },
      { key: "supplierId", label: "Supplier" },
      { key: "shade", label: "Shade" },
      { key: "size", label: "Size" },
      { key: "qty", label: "Qty" },
      { key: "amount", label: "Amount" }
    ]
  };
  return makeEnvelope({
    meta: { reportId: "in_transit", title: "Logistics — Inbound (Unsettled)" },
    schema,
    rows,
    paging: {
      page,
      pageSize: PAGE_SIZE,
      total,
      totalPages,
      hasPrev: page > 1,
      hasNext: page < totalPages
    }
  });
}
async function GET({ url }) {
  const envelope = await makeInboundEnvelope(url);
  return new Response(JSON.stringify({ ok: true, data: envelope.rows }), {
    headers: { "content-type": "application/json" }
  });
}
const load = async ({ url }) => ({ envelope: await makeInboundEnvelope(url) });
export {
  GET,
  load
};
