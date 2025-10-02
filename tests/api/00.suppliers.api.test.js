import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { resetDb, seedSupplier, disconnect } from './_util.js';
import * as Suppliers from '../../src/routes/api/suppliers/+server.js';

describe('API: GET /api/suppliers', () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await disconnect();
  });

  it('lists suppliers (sorted by name)', async () => {
    await seedSupplier('Wahid Khan');
    await seedSupplier('Talwar Khan');

    const res = await Suppliers.GET({ url: new URL('http://localhost/api/suppliers') });
    const body = await res.json();

    expect(body.ok).toBe(true);
    expect(body.data.map(s => s.name)).toEqual(['Talwar Khan', 'Wahid Khan']); // asc
  });

  it('filters by q substring (name/code)', async () => {
    await seedSupplier('Acme Minerals');
    await seedSupplier('Bravo Ore');

    const res = await Suppliers.GET({ url: new URL('http://localhost/api/suppliers?q=acm') });
    const body = await res.json();

    expect(body.ok).toBe(true);
    expect(body.data.length).toBe(1);
    expect(body.data[0].name).toBe('Acme Minerals');
  });
});
