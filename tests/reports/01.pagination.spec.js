import { describe, it, expect } from 'vitest';
import { parsePagination, resolveOrderBy } from '../../src/lib/reportEngine/index.js';

function u(q = '') {
  return new URL('http://x.local' + (q.startsWith('?') ? q : `?${q}`));
}

describe('reportEngine.parsePagination', () => {
  it('applies defaults and clamps bad inputs', () => {
    const { page, pageSize, sort, dir } = parsePagination(u(''), {
      defaultPage: 1,
      defaultPageSize: 25,
      maxPageSize: 100,
      defaultSort: 'createdAt',
      defaultDir: 'desc',
      allowedSorts: ['createdAt', 'qty'],
      idField: 'id'
    });
    expect(page).toBe(1);
    expect(pageSize).toBe(25);
    expect(sort).toBe('createdAt');
    expect(dir).toBe('desc');
  });

  it('honors allowed sorts and lower-cases dir', () => {
    const { sort, dir } = parsePagination(u('?sort=qty&dir=ASC'), {
      defaultSort: 'createdAt',
      defaultDir: 'desc',
      allowedSorts: ['createdAt', 'qty'],
      idField: 'id'
    });
    expect(sort).toBe('qty');
    expect(dir).toBe('asc');
  });

  it('falls back when sort not allowed, and clamps page/pageSize', () => {
    const { page, pageSize, sort } = parsePagination(u('?page=-9&pageSize=9999&sort=hack'), {
      defaultPage: 1,
      defaultPageSize: 25,
      maxPageSize: 50,
      defaultSort: 'createdAt',
      defaultDir: 'desc',
      allowedSorts: ['createdAt', 'qty'],
      idField: 'id'
    });
    expect(page).toBe(1);
    expect(pageSize).toBe(50);
    expect(sort).toBe('createdAt');
  });
});

describe('reportEngine.resolveOrderBy', () => {
  it('builds stable orderBy with tie-breaker id', () => {
    const orderBy = resolveOrderBy({ sort: 'createdAt', dir: 'desc', idField: 'id' });
    expect(orderBy).toEqual([{ createdAt: 'desc' }, { id: 'desc' }]);
  });

  it('handles asc ordering', () => {
    const orderBy = resolveOrderBy({ sort: 'qty', dir: 'asc', idField: 'id' });
    expect(orderBy).toEqual([{ qty: 'asc' }, { id: 'desc' }]); // stable tie-break
  });
});
