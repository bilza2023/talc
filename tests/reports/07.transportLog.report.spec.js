import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '../../src/lib/stocks/stockEngine.js';
import { run as runTransport } from '../../src/lib/reports/transportLog.js';
import { seedSuppliers, seedTransport, dt, mkUrl } from './_seed.js';

describe('Report: transportLog', () => {
  beforeEach(async () => {
    await seedSuppliers([{ id: 1, name: 'A' }, { id: 2, name: 'B' }]);
    await seedTransport([
      { id: 301, createdAt: dt('2025-10-01T08:00:00Z'), type:'DISPATCH', transportId:'T1', fromMmaCode:'ABS_RAW',      toMmaCode:'PSS_SCREENED', supplierId:1, shade:'WHITE', size:'LUMPS', qty:10, amount:1000 },
      { id: 302, createdAt: dt('2025-10-01T12:00:00Z'), type:'RECEIVE',  transportId:'T1', fromMmaCode:'ABS_RAW',      toMmaCode:'PSS_SCREENED', supplierId:1, shade:'WHITE', size:'LUMPS', qty:10, amount:1000 },
      { id: 303, createdAt: dt('2025-10-02T09:00:00Z'), type:'DISPATCH', transportId:'T2', fromMmaCode:'PSS_SCREENED', toMmaCode:'KEF_SORTED',   supplierId:2, shade:'GREY',  size:'CHIPS', qty:5,  amount:500  },
    ]);
  });

  it('returns decorated rows with lane and proper paging', async () => {
    const url = mkUrl({ page: 1, pageSize: 2, sort: 'createdAt', dir: 'desc' });
    const { envelope } = await runTransport({ prisma, url });
    expect(envelope.meta.reportId).toBe('transport_log');
    expect(envelope.rows.length).toBe(2);
    expect(envelope.rows[0].lane).toMatch(/→/);
    expect(envelope.paging.hasNext).toBe(true);
  });

  it('filters by type/from/to/supplier/date', async () => {
    const url = mkUrl();
    const { envelope } = await runTransport({
      prisma, url,
      // Make "to" end-of-day so lte includes the 08:00Z dispatch
      params: { type:'DISPATCH', fromMmaCode:'ABS_RAW', toMmaCode:'PSS_SCREENED', supplierId:1, from:'2025-10-01', to:'2025-10-01T23:59:59.999Z' }
    });
    expect(envelope.rows.map(r => r.id)).toEqual([301]);
  });
});
