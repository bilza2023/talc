// Unified helpers for all reports: URL pagination, deterministic sorting, Prisma paging, envelope

// ----- parse pagination/sort from URL or plain object -----
function toSearchParams(input) {
    if (!input) return new URLSearchParams();
    if (input instanceof URL) return input.searchParams;
    if (input.searchParams instanceof URLSearchParams) return input.searchParams;
    if (typeof input === 'string') return new URL(input, 'http://x/').searchParams;
    if (input instanceof URLSearchParams) return input;
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(input)) if (v != null && v !== '') sp.set(k, String(v));
    return sp;
  }
  function numOr(def, v, { min, max } = {}) {
    const n = Number(v);
    if (!Number.isFinite(n)) return def;
    if (min != null && n < min) return min;
    if (max != null && n > max) return max;
    return n;
  }
  export function parsePagination(input, opts = {}) {
    const {
      defaultPage = 1,
      defaultPageSize = 25,
      maxPageSize = 200,
      defaultSort = 'createdAt',
      defaultDir = 'desc',
      allowedSorts = null,
      idField = 'id',
    } = opts;
  
    const sp = toSearchParams(input);
    const page     = numOr(defaultPage, sp.get('page'),     { min: 1 });
    const pageSize = numOr(defaultPageSize, sp.get('pageSize'), { min: 1, max: maxPageSize });
  
    let sort = sp.get('sort') || defaultSort;
    let dir  = (sp.get('dir') || defaultDir).toLowerCase();
    if (!['asc','desc'].includes(dir)) dir = defaultDir;
  
    if (Array.isArray(allowedSorts) && allowedSorts.length && !allowedSorts.includes(sort)) {
      sort = defaultSort;
    }
    return { page, pageSize, sort, dir, idField };
  }
  
  // ----- Prisma-friendly, deterministic orderBy -----
  export function resolveOrderBy({ sort, dir, idField = 'id' }) {
    const orderBy = [];
    if (sort) orderBy.push({ [sort]: dir });
    // stable tiebreaker
    if (!orderBy.find(o => Object.keys(o)[0] === idField)) orderBy.push({ [idField]: 'desc' });
    return orderBy;
  }
  
  // ----- Generic offset pagination (+1 fetch => hasNext) -----
  export async function paginateQuery(delegate, opts = {}) {
    const {
      where = {},
      orderBy = [{ createdAt: 'desc' }, { id: 'desc' }],
      page = 1,
      pageSize = 25,
      select,
      include,
      totalMode = 'none', // 'none' | 'count'
    } = opts;
  
    const skip = (page - 1) * pageSize;
    const take = pageSize + 1;
  
    const rowsPlus = await delegate.findMany({ where, orderBy, skip, take, select, include });
    const hasNext = rowsPlus.length > pageSize;
    const rows = hasNext ? rowsPlus.slice(0, pageSize) : rowsPlus;
  
    let total = null;
    if (totalMode === 'count') total = await delegate.count({ where });
  
    return {
      rows,
      paging: { page, pageSize, total, hasPrev: page > 1, hasNext }
    };
  }
  
  // ----- Standard envelope -----
  export function makeEnvelope({
    meta = { reportId: '', title: '', defaultSort: { key: 'createdAt', dir: 'desc' } },
    kpis = {},
    facets = {},
    schema = { columns: [] },
    rows = [],
    paging = { page: 1, pageSize: 25, total: null, hasPrev: false, hasNext: false },
  } = {}) {
    return { meta, kpis, facets, schema, rows, paging };
  }
  