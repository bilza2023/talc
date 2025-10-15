// ---------- Helpers ----------
export function toSearchParams(input) {
  if (!input) return new URLSearchParams();
  if (input instanceof URL) return input.searchParams;
  if (input.searchParams instanceof URLSearchParams) return input.searchParams;
  if (typeof input === 'string') {
    const q = input.startsWith('?') ? input : `?${input}`;
    return new URL(q, 'http://x/').searchParams;
  }
  if (input instanceof URLSearchParams) return input;
  // plain object
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(input)) if (v != null && v !== '') sp.set(k, String(v));
  return sp;
}

export function numOr(defaultVal, v, { min, max } = {}) {
  // key: treat null/empty as "no value" → use default
  if (v == null || v === '') return defaultVal;
  const n = Number(v);
  if (!Number.isFinite(n)) return defaultVal;
  let out = n;
  if (min != null && out < min) out = min;
  if (max != null && out > max) out = max;
  return out;
}

// ---------- Public API ----------
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
  if (!['asc', 'desc'].includes(dir)) dir = defaultDir;

  if (Array.isArray(allowedSorts) && allowedSorts.length && !allowedSorts.includes(sort)) {
    sort = defaultSort;
  }
  return { page, pageSize, sort, dir, idField };
}

export function resolveOrderBy({ sort, dir, idField = 'id' }) {
  const orderBy = [];
  if (sort) orderBy.push({ [sort]: dir });
  // deterministic tie-break
  if (!orderBy.find(o => Object.keys(o)[0] === idField)) orderBy.push({ [idField]: 'desc' });
  return orderBy;
}
