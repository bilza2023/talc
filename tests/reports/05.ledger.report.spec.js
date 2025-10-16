import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '../../src/lib/stocks/stockEngine.js';
import { run as runLedger } from '../../src/lib/reports/ledger.js';
import { seedSuppliers, seedLedger, dt, mkUrl } from './_seed.js';

describe('Report: ledger', () => {
  beforeEach(async () => {
    await seedSuppliers([{ id: 1, name: 'Alpha' }, { id: 2, name: 'Beta' }]);
    await seedLedger([
      { id: 101, createdAt: dt('2025-10-01T10:00:00Z'), mmaCode:'ABS_RAW',      supplierId:1, shade:'WHITE', size:'ANY',    qtyDelta: 10, reason:'PROCESS',  linkId:'p1' },
      // reason changed to a valid enum value
      { id: 102, createdAt: dt('2025-10-02T10:00:00Z'), mmaCode:'ABS_RAW',      supplierId:2, shade:'GREY',  size:'LUMPS',  qtyDelta: -2, reason:'PROCESS',  linkId:'w1' },
      { id: 103, createdAt: dt('2025-10-02T10:00:00Z'), mmaCode:'PSS_SCREENED', supplierId:1, shade:'WHITE', size:'CHIPS',  qtyDelta:  5, reason:'PROCESS',  linkId:'p2' },
    ]);
  });

  it('paginates with stable ordering and returns envelope', async () => {
    const url = mkUrl({ page: 1, pageSize: 2, sort: 'createdAt', dir: 'desc' });
    const { envelope } = await runLedger({ prisma, url });

    expect(envelope.meta.reportId).toBe('ledger');
    expect(envelope.rows.map(r => r.id)).toEqual([103, 102]); // tie-break by id desc
    expect(envelope.paging).toMatchObject({ page: 1, hasPrev: false, hasNext: true });
  });

  it('applies filters', async () => {
    const url = mkUrl({ page: 1, pageSize: 50 });
    const { envelope } = await runLedger({
      prisma,
      url,
      // "to" must be end-of-day; otherwise lte('2025-10-01T00:00:00Z') excludes the 10:00Z row
      params: { supplierId: 1, shade: 'WHITE', size: 'ANY', mmaCode: 'ABS_RAW', from:'2025-10-01', to:'2025-10-01T23:59:59.999Z' }
    });
    expect(envelope.rows.map(r => r.id)).toEqual([101]);
  });
});
