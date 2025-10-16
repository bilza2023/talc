import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '../../src/lib/stocks/stockEngine.js';
import { run as runRecon } from '../../src/lib/reports/reconciliation.js';
import { seedSuppliers, seedTransport, dt, mkUrl } from './_seed.js';

describe('Report: reconciliation', () => {
  beforeEach(async () => {
    await seedSuppliers([{ id: 1, name: 'A' }, { id: 2, name: 'B' }, { id: 3, name: 'C' }, { id: 4, name: 'D' }]);
    await seedTransport([
      // T1 equal
      { id: 501, createdAt: dt('2025-10-01T08:00:00Z'), type:'DISPATCH', transportId:'T1', fromMmaCode:'ABS_RAW', toMmaCode:'PSS_SCREENED', supplierId:1, shade:'WHITE', size:'LUMPS', qty:10, amount:1000 },
      { id: 502, createdAt: dt('2025-10-01T12:00:00Z'), type:'RECEIVE',  transportId:'T1', fromMmaCode:'ABS_RAW', toMmaCode:'PSS_SCREENED', supplierId:1, shade:'WHITE', size:'LUMPS', qty:10, amount:1000 },
      // T2 short
      { id: 503, createdAt: dt('2025-10-02T09:00:00Z'), type:'DISPATCH', transportId:'T2', fromMmaCode:'ABS_RAW', toMmaCode:'PSS_SCREENED', supplierId:2, shade:'GREY',  size:'CHIPS', qty:6,  amount:600  },
      { id: 504, createdAt: dt('2025-10-02T10:00:00Z'), type:'RECEIVE',  transportId:'T2', fromMmaCode:'ABS_RAW', toMmaCode:'PSS_SCREENED', supplierId:2, shade:'GREY',  size:'CHIPS', qty:5,  amount:500  },
      // T3 in transit
      { id: 505, createdAt: dt('2025-10-03T09:00:00Z'), type:'DISPATCH', transportId:'T3', fromMmaCode:'PSS_SCREENED', toMmaCode:'KEF_SORTED', supplierId:3, shade:'WHITE', size:'ANY',  qty:8, amount:800 },
      // T4 canceled
      { id: 506, createdAt: dt('2025-10-04T09:00:00Z'), type:'DISPATCH', transportId:'T4', fromMmaCode:'ABS_RAW', toMmaCode:'PSS_SCREENED', supplierId:4, shade:'WHITE', size:'ANY',  qty:2, amount:200 },
      { id: 507, createdAt: dt('2025-10-04T10:00:00Z'), type:'CANCEL',   transportId:'T4', fromMmaCode:'ABS_RAW', toMmaCode:'PSS_SCREENED', supplierId:4, shade:'WHITE', size:'ANY',  qty:0, amount:0   },
    ]);
  });

  it('summarizes latest status per transportId with deltas', async () => {
    const url = mkUrl({ page: 1, pageSize: 25, sort: 'createdAt', dir: 'desc' });
    const { envelope } = await runRecon({ prisma, url });

    const byId = Object.fromEntries(envelope.rows.map(r => [r.transportId, r]));
    expect(byId.T1.status).toBe('RECEIVED');
    expect(byId.T1.qtyDelta).toBe(0);

    expect(byId.T2.status).toBe('RECEIVED');
    expect(byId.T2.dispatchQty).toBe(6);
    expect(byId.T2.receiveQty).toBe(5);
    expect(byId.T2.qtyDelta).toBe(-1);

    expect(byId.T3.status).toBe('IN_TRANSIT');
    expect(byId.T3.receiveQty).toBeNull();

    expect(byId.T4.status).toBe('CANCELED');
    expect(byId.T4.receiveQty).toBeNull();
  });

  it('paginates deterministically (createdAt desc + id desc)', async () => {
    const url = mkUrl({ page: 1, pageSize: 2, sort: 'createdAt', dir: 'desc' });
    const { envelope } = await runRecon({ prisma, url });
    expect(envelope.rows.length).toBe(2);
    expect(envelope.paging.hasNext).toBe(true);
  });
});
