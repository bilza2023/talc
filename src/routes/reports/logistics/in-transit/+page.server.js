// Logistics → In-Transit (URL-paginated, filterable)
// Shows unsettled DISPATCH rows only, with KPIs and lane roll-up.
import { prisma } from '$lib/stocks/stockEngine.js';
import { parsePagination, makeEnvelope } from '$lib/reportEngine/index.js';

function readFilters(url) {
  const u = new URL(url);
  return {
    from: u.searchParams.get('from') || '',           // exact fromMmaCode
    to: u.searchParams.get('to') || '',               // exact toMmaCode
    supplierId: u.searchParams.get('supplierId') || '',
    shade: u.searchParams.get('shade') || '',
    size: u.searchParams.get('size') || '',
    ageHrsMin: u.searchParams.get('ageHrsMin') || '', // numeric string, e.g. "48"
  };
}

export const load = async ({ url }) => {
  // 1) pagination & sort (ageHrs is derived → sort in JS)
  const { page, pageSize, sort, dir } = parsePagination(url, {
    defaultSort: 'ageHrs', // oldest on top
    defaultDir: 'desc',
    allowedSorts: ['ageHrs', 'createdAt', 'qty', 'fromMmaCode', 'toMmaCode', 'supplierId'],
    idField: 'id'
  });

  // 2) filters
  const filters = readFilters(url);
  const whereDispatch = {
    type: 'DISPATCH',
    ...(filters.from ? { fromMmaCode: filters.from } : {}),
    ...(filters.to ? { toMmaCode: filters.to } : {}),
    ...(filters.supplierId ? { supplierId: Number(filters.supplierId) } : {}),
    ...(filters.shade ? { shade: filters.shade } : {}),
    ...(filters.size ? { size: filters.size } : {}),
  };

  // 3) pull candidate dispatches (we’ll filter unsettled in-memory)
  const dispatches = await prisma.stockTransport.findMany({
    where: whereDispatch,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    select: {
      id: true, transportId: true, createdAt: true,
      fromMmaCode: true, toMmaCode: true,
      supplierId: true, shade: true, size: true, qty: true, amount: true
    }
  });

  // 4) compute "unsettled" (no RECEIVE/CANCEL for same transportId)
  const ids = dispatches.map(d => d.transportId);
  const settlements = ids.length
    ? await prisma.stockTransport.findMany({
        where: { transportId: { in: ids }, type: { in: ['RECEIVE', 'CANCEL'] } },
        select: { transportId: true }
      })
    : [];
  const settled = new Set(settlements.map(s => s.transportId));

  const now = new Date();
  let unsettled = dispatches
    .filter(d => !settled.has(d.transportId))
    .map(d => {
      const ageHrs = (now.getTime() - new Date(d.createdAt).getTime()) / (1000 * 60 * 60);
      return {
        ...d,
        qty: Number(d.qty ?? 0),
        ageHrs: Number(ageHrs.toFixed(1))
      };
    });

  if (filters.ageHrsMin) {
    const min = Number(filters.ageHrsMin) || 0;
    unsettled = unsettled.filter(r => r.ageHrs >= min);
  }

  // 5) KPIs (unpaged)
  const jobs = unsettled.length;
  const qtySum = unsettled.reduce((s, r) => s + r.qty, 0);
  const oldest = jobs ? Math.max(...unsettled.map(r => r.ageHrs)) : 0;
  const overdue48 = unsettled.filter(r => r.ageHrs >= 48).length;

  const kpis = {
    jobs, qty: qtySum, oldestHrs: oldest, overdue48
  };

  // 6) Lane roll-up (unpaged, unsettled scope)
  const laneMap = new Map();
  for (const r of unsettled) {
    const key = `${r.fromMmaCode}→${r.toMmaCode}`;
    const row = laneMap.get(key) ?? { from: r.fromMmaCode, to: r.toMmaCode, jobs: 0, qty: 0 };
    row.jobs += 1;
    row.qty += r.qty;
    laneMap.set(key, row);
  }
  const lanes = [...laneMap.values()].sort((a, b) => b.qty - a.qty);

  // 7) Facet options (from the filtered unsettled set → compact & relevant)
  const fromOpts  = Array.from(new Set(unsettled.map(r => r.fromMmaCode))).sort();
  const toOpts    = Array.from(new Set(unsettled.map(r => r.toMmaCode))).sort();
  const supOpts   = Array.from(new Set(unsettled.map(r => String(r.supplierId)))).sort();
  const shadeOpts = Array.from(new Set(unsettled.map(r => r.shade))).sort();
  const sizeOpts  = Array.from(new Set(unsettled.map(r => r.size))).sort();
  const ageOpts   = ['', '24', '48', '72'];

  // 8) sort & paginate in-memory (because ageHrs is derived)
  const cmp = (a, b, key) => {
    const av = a[key], bv = b[key];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    if (av < bv) return -1;
    if (av > bv) return 1;
    return 0;
  };
  const sorted = [...unsettled].sort((a, b) => {
    const primary = cmp(a, b, sort);
    if (primary !== 0) return dir === 'asc' ? primary : -primary;
    // tiebreaker (newest first, deterministic)
    return b.id - a.id;
  });

  const start = (page - 1) * pageSize;
  const paged = sorted.slice(start, start + pageSize);
  const hasNext = sorted.length > (start + pageSize);

  // 9) schema & envelope
  const schema = {
    columns: [
      { key: 'createdAt',    label: 'Date/Time', type: 'datetime' },
      { key: 'transportId',  label: 'TID' },
      { key: 'fromMmaCode',  label: 'From' },
      { key: 'toMmaCode',    label: 'To' },
      { key: 'supplierId',   label: 'Supplier' },
      { key: 'shade',        label: 'Shade' },
      { key: 'size',         label: 'Size' },
      { key: 'qty',          label: 'Qty (t)' },
      { key: 'ageHrs',       label: 'Age (hrs)' },
      { key: 'amount',       label: 'Amount' },
    ]
  };

  const envelope = makeEnvelope({
    meta: {
      reportId: 'logistics_in_transit',
      title: 'Logistics — In-Transit',
      defaultSort: { key: 'ageHrs', dir: 'desc' }
    },
    kpis,
    facets: {
      from: fromOpts, to: toOpts, supplierId: supOpts, shade: shadeOpts, size: sizeOpts, ageHrsMin: ageOpts
    },
    schema,
    rows: paged,
    paging: { page, pageSize, total: null, hasPrev: page > 1, hasNext }
  });

  return {
    envelope,
    lanes,
    filters,
    options: { fromOpts, toOpts, supOpts, shadeOpts, sizeOpts, ageOpts }
  };
};
