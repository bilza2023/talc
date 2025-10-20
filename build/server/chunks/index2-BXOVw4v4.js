function toSearchParams(input) {
  if (!input) return new URLSearchParams();
  if (input instanceof URL) return input.searchParams;
  if (input.searchParams instanceof URLSearchParams) return input.searchParams;
  if (typeof input === "string") return new URL(input.startsWith("?") ? input : `?${input}`, "http://x/").searchParams;
  if (input instanceof URLSearchParams) return input;
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(input)) if (v != null && v !== "") sp.set(k, String(v));
  return sp;
}
function numOr(def, v, { min, max } = {}) {
  if (v == null || v === "") return def;
  const n = Number(v);
  if (!Number.isFinite(n)) return def;
  let out = n;
  if (min != null && out < min) out = min;
  if (max != null && out > max) out = max;
  return out;
}
function parsePagination(input, opts = {}) {
  const {
    defaultPage = 1,
    defaultPageSize = 25,
    maxPageSize = 200,
    defaultSort = "createdAt",
    defaultDir = "desc",
    allowedSorts = null,
    idField = "id"
  } = opts;
  const sp = toSearchParams(input);
  const page = numOr(defaultPage, sp.get("page"), { min: 1 });
  const pageSize = numOr(defaultPageSize, sp.get("pageSize"), { min: 1, max: maxPageSize });
  let sort = sp.get("sort") || defaultSort;
  let dir = (sp.get("dir") || defaultDir).toLowerCase();
  if (!["asc", "desc"].includes(dir)) dir = defaultDir;
  if (Array.isArray(allowedSorts) && allowedSorts.length && !allowedSorts.includes(sort)) {
    sort = defaultSort;
  }
  return { page, pageSize, sort, dir, idField };
}
function resolveOrderBy({ sort, dir, idField = "id" }) {
  const orderBy = [];
  if (sort) orderBy.push({ [sort]: dir });
  if (!orderBy.find((o) => Object.keys(o)[0] === idField)) orderBy.push({ [idField]: "desc" });
  return orderBy;
}
function makeEnvelope({
  meta = { reportId: "", title: "", defaultSort: { key: "createdAt", dir: "desc" } },
  kpis = {},
  facets = {},
  schema = { columns: [] },
  rows = [],
  paging = { page: 1, pageSize: 25, total: null, totalPages: null, hasPrev: false, hasNext: false }
} = {}) {
  return { meta, kpis, facets, schema, rows, paging };
}

export { makeEnvelope as m, parsePagination as p, resolveOrderBy as r };
//# sourceMappingURL=index2-BXOVw4v4.js.map
