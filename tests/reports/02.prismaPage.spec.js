import { describe, it, expect } from 'vitest';
import { paginateQuery } from '../../src/lib/reportEngine/prismaPage.js';


// Minimal in-memory Prisma-like delegate
class FakeDelegate {
  constructor(rows) { this._rows = rows; }

  _filter(where) {
    return this._rows.filter(r => {
      if (!where) return true;
      for (const [k, v] of Object.entries(where)) {
        if (v == null) continue;
        // support simple equality and `{ in: [...] }`
        if (typeof v === 'object' && v.in) {
          if (!v.in.includes(r[k])) return false;
        } else if (r[k] !== v) {
          return false;
        }
      }
      return true;
    });
  }

  _order(rows, orderBy = []) {
    const arr = [...rows];
    for (let i = orderBy.length - 1; i >= 0; i--) {
      const spec = orderBy[i];
      const [k, dir] = Object.entries(spec)[0];
      arr.sort((a, b) => {
        const av = a[k], bv = b[k];
        if (av === bv) return 0;
        const cmp = av < bv ? -1 : 1;
        return dir === 'asc' ? cmp : -cmp;
      });
    }
    return arr;
  }

  async findMany({ where, orderBy, skip = 0, take, select } = {}) {
    let rows = this._filter(where);
    rows = this._order(rows, orderBy);
    if (skip) rows = rows.slice(skip);
    if (take != null) rows = rows.slice(0, take);
    if (select) {
      rows = rows.map(r => {
        const o = {};
        for (const k of Object.keys(select)) if (select[k]) o[k] = r[k];
        return o;
      });
    }
    return rows;
  }

  async count({ where } = {}) {
    return this._filter(where).length;
  }
}

const baseRows = [
  { id: 1,  createdAt: new Date('2025-10-10T00:00:00Z'), qty: 10, type: 'DISPATCH' },
  { id: 2,  createdAt: new Date('2025-10-11T00:00:00Z'), qty: 20, type: 'DISPATCH' },
  { id: 3,  createdAt: new Date('2025-10-12T00:00:00Z'), qty: 30, type: 'RECEIVE'  },
  { id: 4,  createdAt: new Date('2025-10-13T00:00:00Z'), qty: 40, type: 'DISPATCH' },
  { id: 5,  createdAt: new Date('2025-10-14T00:00:00Z'), qty: 50, type: 'CANCEL'   },
  { id: 6,  createdAt: new Date('2025-10-15T00:00:00Z'), qty: 60, type: 'DISPATCH' },
];

describe('reportEngine.paginateQuery (smoke)', () => {
  it('pages with +1 look-ahead and returns paging flags', async () => {
    const delegate = new FakeDelegate(baseRows);
    const { rows, paging } = await paginateQuery(delegate, {
      where: { type: 'DISPATCH' },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      page: 1,
      pageSize: 2,
      select: { id: true, qty: true, createdAt: true },
      totalMode: 'count'
    });

    // Expect the two newest DISPATCH rows (ids 6,4)
    expect(rows.map(r => r.id)).toEqual([6, 4]);
    expect(paging.page).toBe(1);
    expect(paging.pageSize).toBe(2);
    expect(paging.hasPrev).toBe(false);
    expect(paging.hasNext).toBe(true);
    expect(paging.total).toBe(4); // ids: 1,2,4,6
    expect(paging.totalPages).toBe(2);
  });

  it('second page shows remaining rows and hasPrev/hasNext flip', async () => {
    const delegate = new FakeDelegate(baseRows);
    const { rows, paging } = await paginateQuery(delegate, {
      where: { type: 'DISPATCH' },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      page: 2,
      pageSize: 2,
      select: { id: true }
    });
    expect(rows.map(r => r.id)).toEqual([2, 1]);
    expect(paging.hasPrev).toBe(true);
    expect(paging.hasNext).toBe(false);
  });
});
