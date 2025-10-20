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
export {
  makeEnvelope as m,
  paginateQuery as p
};
