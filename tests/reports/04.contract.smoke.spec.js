
import { describe, it, expect } from 'vitest';
import { paginateQuery } from '../../src/lib/reportEngine/prismaPage.js';
import { makeEnvelope } from '../../src/lib/reportEngine/envelope.js';
import { parsePagination, resolveOrderBy } from '../../src/lib/reportEngine/index.js';

// End-to-end “contract” smoke: parse → page → envelope
class FakeDelegate {
  constructor(rows){ this.rows = rows; }
  async count(){ return this.rows.length; }
  async findMany({ orderBy = [], skip = 0, take, select } = {}) {
    let out = [...this.rows];
    // order
    for (let i = orderBy.length - 1; i >= 0; i--) {
      const spec = orderBy[i];
      const [k, dir] = Object.entries(spec)[0];
      out.sort((a, b) => (dir === 'asc' ? (a[k] > b[k]) - (a[k] < b[k]) : (b[k] > a[k]) - (b[k] < a[k])));
    }
    if (skip) out = out.slice(skip);
    if (take != null) out = out.slice(0, take);
    if (select) out = out.map(r => Object.fromEntries(Object.keys(select).filter(k => select[k]).map(k => [k, r[k]])));
    return out;
  }
}

describe('reportEngine end-to-end contract', () => {
  it('produces a stable envelope ready for ListTable', async () => {
    const url = new URL('http://x.local?sort=createdAt&dir=desc&page=1&pageSize=3');
    const cfg = { defaultSort: 'createdAt', defaultDir: 'desc', allowedSorts: ['createdAt', 'qty'], idField: 'id' };
    const { page, pageSize, sort, dir } = parsePagination(url, cfg);
    const orderBy = resolveOrderBy({ sort, dir, idField: 'id' });

    const rows = [
      { id: 1, createdAt: new Date('2025-10-10T00:00:00Z'), qty: 10 },
      { id: 2, createdAt: new Date('2025-10-11T00:00:00Z'), qty: 20 },
      { id: 3, createdAt: new Date('2025-10-12T00:00:00Z'), qty: 30 },
      { id: 4, createdAt: new Date('2025-10-13T00:00:00Z'), qty: 40 },
    ];
    const delegate = new FakeDelegate(rows);

    const { rows: pageRows, paging } = await paginateQuery(delegate, {
      page, pageSize, orderBy, where: {}, select: { id: true, qty: true, createdAt: true }, totalMode: 'count'
    });

    const envelope = makeEnvelope({
      meta: { reportId: 'contract', title: 'Contract Smoke' },
      schema: { columns: [{ key: 'id', label: 'ID' }, { key: 'qty', label: 'Qty' }, { key: 'createdAt', label: 'Created' }] },
      rows: pageRows,
      paging
    });

    expect(envelope.meta.reportId).toBe('contract');
    expect(envelope.schema.columns.length).toBe(3);
    expect(envelope.rows.length).toBe(3);
    expect(envelope.rows.map(r => r.id)).toEqual([4, 3, 2]); // desc createdAt + id
    expect(envelope.paging.total).toBe(4);
    expect(envelope.paging.hasNext).toBe(true);
  });
});
