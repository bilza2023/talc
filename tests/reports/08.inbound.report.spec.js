import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '../../src/lib/stocks/stockEngine.js';
import { run as runInbound } from '../../src/lib/reports/inbound.js';
import { seedSuppliers, seedTransport, dt, mkUrl } from './_seed.js';

describe('Report: inbound (in-transit)', () => {
  beforeEach(async () => {
    await seedSuppliers([{ id: 1, name: 'A' }, { id: 2, name: 'B' }, { id: 3, name: 'C' }]);
    await seedTransport([
      // settled
      { id: 401, createdAt: dt('2025-10-01T08:00:00Z'), type:'DISPATCH', transportId:'T1', fromMmaCode:'ABS_RAW', toMmaCode:'PSS_SCREENED', supplierId:1, shade:'WHITE', size:'LUMPS', qty:10, amount:1000 },
      { id: 402, createdAt: dt('2025-10-01T12:00:00Z'), type:'RECEIVE',  transportId:'T1', fromMmaCode:'ABS_RAW', toMmaCode:'PSS_SCREENED', supplierId:1, shade:'WHITE', size:'LUMPS', qty:10, amount:1000 },
      { id: 403, createdAt: dt('2025-10-02T09:00:00Z'), type:'DISPATCH', transportId:'T2', fromMmaCode:'ABS_RAW', toMmaCode:'PSS_SCREENED', supplierId:2, shade:'GREY',  size:'CHIPS', qty:5,  amount:500  },
      { id: 404, createdAt: dt('2025-10-02T10:00:00Z'), type:'CANCEL',   transportId:'T2', fromMmaCode:'ABS_RAW', toMmaCode:'PSS_SCREENED', supplierId:2, shade:'GREY',  size:'CHIPS', qty:0,  amount:0    },
      // inbound
      { id: 405, createdAt: dt('2025-10-03T09:00:00Z'), type:'DISPATCH', transportId:'T3', fromMmaCode:'ABS_RAW', toMmaCode:'PSS_SCREENED', supplierId:3, shade:'WHITE', size:'ANY',   qty:8,  amount:800  },
    ]);
  });

  it('lists ONLY unsettled DISPATCH (no RECEIVE/CANCEL)', async () => {
    const url = mkUrl({ page: 1, pageSize: 25, sort: 'createdAt', dir: 'desc' });
    const { envelope } = await runInbound({ prisma, url });
    expect(envelope.meta.reportId).toBe('inbound');
    expect(envelope.rows.map(r => r.transportId)).toEqual(['T3']);
    expect(envelope.rows[0].lane).toBe('ABS_RAW→PSS_SCREENED');
  });

  it('allows filtering by toMmaCode and supplierId', async () => {
    const url = mkUrl();
    const { envelope } = await runInbound({ prisma, url, params: { toMmaCode:'PSS_SCREENED', supplierId:3 } });
    expect(envelope.rows.map(r => r.transportId)).toEqual(['T3']);
  });
});
