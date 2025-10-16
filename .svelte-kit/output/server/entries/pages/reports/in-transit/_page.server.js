import { p as prisma } from "../../../../chunks/stockEngine.js";
import { p as parsePagination, r as resolveOrderBy } from "../../../../chunks/index2.js";
async function paginateQuery(delegate, opts = {}) {
  const {
    where = {},
    orderBy = [{ createdAt: "desc" }, { id: "desc" }],
    page = 1,
    pageSize = 25,
    select = void 0,
    include = void 0,
    totalMode = "none"
    // 'none' | 'count'
  } = opts;
  const skip = (page - 1) * pageSize;
  const take = pageSize + 1;
  const rowsPlus = await delegate.findMany({ where, orderBy, skip, take, select, include });
  const hasNext = rowsPlus.length > pageSize;
  const rows = hasNext ? rowsPlus.slice(0, pageSize) : rowsPlus;
  let total = null;
  if (totalMode === "count") {
    total = await delegate.count({ where });
  }
  const paging = {
    page,
    pageSize,
    total,
    // null when totalMode='none'
    totalPages: total == null ? void 0 : Math.max(1, Math.ceil(total / pageSize)),
    hasPrev: page > 1,
    hasNext
  };
  return { rows, paging };
}
function makeEnvelope({
  meta = { reportId: "", title: "", defaultSort: { key: "createdAt", dir: "desc" } },
  kpis = {},
  facets = {},
  schema = { columns: [] },
  // [{ key, label, type?, fmt? }]
  rows = [],
  paging = { page: 1, pageSize: 25, total: null, hasPrev: false, hasNext: false }
} = {}) {
  return {
    meta,
    kpis,
    facets,
    schema,
    rows,
    paging
  };
}
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
export {
  load
};
