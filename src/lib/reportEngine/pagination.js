// Core pagination + sorting param parsing (URL or plain object)

function toSearchParams(input) {
    if (!input) return new URLSearchParams();
    if (input instanceof URL) return input.searchParams;
    if (input.searchParams instanceof URLSearchParams) return input.searchParams;
    if (typeof input === 'string') return new URL(input, 'http://x/').searchParams;
    if (input instanceof URLSearchParams) return input;
    // plain object
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(input)) {
      if (v != null && v !== '') sp.set(k, String(v));
    }
    return sp;
  }
  
  function numOr(defaultVal, v, { min, max } = {}) {
    const n = Number(v);
    if (!Number.isFinite(n)) return defaultVal;
    if (min != null && n < min) return min;
    if (max != null && n > max) return max;
    return n;
  }
  
  export function parsePagination(input, opts = {}) {
    const {
      defaultPage = 1,
      defaultPageSize = 25,
      maxPageSize = 500,
      defaultSort = 'createdAt',
      defaultDir = 'desc',
      allowedSorts = null, // e.g., ['createdAt','ageHrs','qty','id']
      idField = 'id',
    } = opts;
  
    const sp = toSearchParams(input);
  
    const page = numOr(defaultPage, sp.get('page'), { min: 1 });
    const pageSize = numOr(defaultPageSize, sp.get('pageSize'), { min: 1, max: maxPageSize });
  
    let sort = sp.get('sort') || defaultSort;
    let dir = (sp.get('dir') || defaultDir).toLowerCase();
    if (dir !== 'asc' && dir !== 'desc') dir = defaultDir;
  
    if (Array.isArray(allowedSorts) && allowedSorts.length) {
      if (!allowedSorts.includes(sort)) sort = defaultSort;
    }
  
    return { page, pageSize, sort, dir, idField };
  }
  
  // Prisma-friendly deterministic orderBy
  export function resolveOrderBy({ sort, dir, idField = 'id' }) {
    const orderBy = [];
    if (sort) orderBy.push({ [sort]: dir });
    // deterministic tiebreaker
    if (!orderBy.find((o) => Object.keys(o)[0] === idField)) {
      orderBy.push({ [idField]: 'desc' });
    }
    return orderBy;
  }
  