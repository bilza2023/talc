// /src/routes/dashboard/transportation/+page.server.js
import prisma from '$lib/server/prisma.js';

// helpers
const toPosInt = (v, d) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : d;
};
const oneOf = (v, list, d) => (list.includes(String(v ?? '').toLowerCase()) ? String(v).toLowerCase() : d);

// unify edge row shape
function mapEdge(material, r) {
  return {
    material, // 'ore' | 'talc'
    id: r.id,
    truckNo: r.truckNo || null,
    fromStation: r.fromStation,
    toStation: r.toStation,
    gradeCode: r.dispatchGrade,
    dispatchWeight: Number(r.dispatchWeight || 0),
    receiveWeight: Number(r.receiveWeight || 0),
    status: r.status,               // 'in_transit' | 'received' | 'cancelled'
    dispatchedAt: r.dispatchedAt ? new Date(r.dispatchedAt) : null,
    receivedAt: r.receivedAt ? new Date(r.receivedAt) : null
  };
}

export async function load({ url }) {
  // URL params
  const limit    = Math.min(toPosInt(url.searchParams.get('limit'), 50), 200); // default 50, cap 200
  const material = oneOf(url.searchParams.get('material'), ['all', 'ore', 'talc'], 'all');
  const status   = oneOf(url.searchParams.get('status'), ['all', 'in_transit', 'received', 'cancelled'], 'all');
  const group    = oneOf(url.searchParams.get('group'), ['none', 'from', 'to'], 'none');
  const beforeIso = url.searchParams.get('before') || null;
  const before    = beforeIso ? new Date(beforeIso) : null;

  // base where (all edges; status optional; pagination optional)
  const baseWhere = {
    ...(status !== 'all' ? { status } : {}),
    ...(before ? { dispatchedAt: { lt: before } } : {})
  };

  // fetch from both edge tables (balanced) then merge + slice to limit
  const takeEach = limit;

  const [oreRaw, talcRaw] = await Promise.all([
    material !== 'talc'
      ? prisma.oreEdge.findMany({
          where: baseWhere,
          orderBy: [{ dispatchedAt: 'desc' }, { id: 'desc' }],
          select: {
            id: true, truckNo: true, fromStation: true, toStation: true,
            dispatchGrade: true, dispatchWeight: true, receiveWeight: true,
            status: true, dispatchedAt: true, receivedAt: true
          },
          take: takeEach
        })
      : Promise.resolve([]),
    material !== 'ore'
      ? prisma.talcEdge.findMany({
          where: baseWhere,
          orderBy: [{ dispatchedAt: 'desc' }, { id: 'desc' }],
          select: {
            id: true, truckNo: true, fromStation: true, toStation: true,
            dispatchGrade: true, dispatchWeight: true, receiveWeight: true,
            status: true, dispatchedAt: true, receivedAt: true
          },
          take: takeEach
        })
      : Promise.resolve([])
  ]);

  const oreRows  = oreRaw.map((r)  => mapEdge('ore', r));
  const talcRows = talcRaw.map((r) => mapEdge('talc', r));

  // merge newest→oldest; slice to limit
  const merged = [...oreRows, ...talcRows]
    .sort((a, b) =>
      (new Date(b.dispatchedAt || 0) - new Date(a.dispatchedAt || 0)) || (b.id - a.id)
    );

  const rows = merged.slice(0, limit);
  const nextBefore = rows.length ? rows[rows.length - 1].dispatchedAt?.toISOString() : null;
  const hasMore    = merged.length > rows.length;

  // optional grouping (on the page’s rows only, not whole DB)
  let grouped = null;
  if (group !== 'none') {
    const keyField = group === 'from' ? 'fromStation' : 'toStation';
    const map = new Map();
    for (const r of rows) {
      const key = r[keyField] || '';
      const cur = map.get(key) || {
        station: key,
        edges: 0,
        dispatchTon: 0,
        receiveTon: 0,
        byMaterial: { ore: 0, talc: 0 }
      };
      cur.edges += 1;
      cur.dispatchTon += r.dispatchWeight;
      cur.receiveTon += r.receiveWeight;
      cur.byMaterial[r.material] += r.dispatchWeight;
      map.set(key, cur);
    }
    grouped = [...map.values()]
      .sort((a, b) =>
        b.dispatchTon - a.dispatchTon ||
        b.edges - a.edges ||
        a.station.localeCompare(b.station)
      );
  }

  return {
    filters: { limit, material, status, group, before: beforeIso },
    page: { nextBefore, hasMore },
    rows,
    grouped
  };
}
