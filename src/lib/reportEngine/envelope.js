// Uniform response envelope for all reports

export function makeEnvelope({
    meta = { reportId: '', title: '', defaultSort: { key: 'createdAt', dir: 'desc' } },
    kpis = {},
    facets = {},
    schema = { columns: [] }, // [{ key, label, type?, fmt? }]
    rows = [],
    paging = { page: 1, pageSize: 25, total: null, hasPrev: false, hasNext: false },
  } = {}) {
    return {
      meta,
      kpis,
      facets,
      schema,
      rows,
      paging,
    };
  }
  