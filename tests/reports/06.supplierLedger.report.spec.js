import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '../../src/lib/stocks/stockEngine.js';
import { run as runSupplier } from '../../src/lib/reports/supplierLedger.js';
import { seedSuppliers, seedLedger, dt, mkUrl } from './_seed.js';

describe('Report: supplierLedger', () => {
  beforeEach(async () => {
    await seedSuppliers([{ id: 9, name: 'Niner' }, { id: 2, name: 'Two' }]);
    await seedLedger([
      { id: 201, createdAt: dt('2025-10-01T10:00:00Z'), mmaCode:'ABS_RAW',      supplierId:9, shade:'WHITE', size:'ANY',    qtyDelta: 7,  reason:'PROCESS',  linkId:'p1' },
      // changed reason to a valid enum
      { id: 202, createdAt: dt('2025-10-02T10:00:00Z'), mmaCode:'PSS_SCREENED', supplierId:9, shade:'GREY',  size:'LUMPS',  qtyDelta: -3, reason:'PROCESS',  linkId:'w1' },
      { id: 203, createdAt: dt('2025-10-03T10:00:00Z'), mmaCode:'ABS_RAW',      supplierId:2, shade:'WHITE', size:'ANY',    qtyDelta: 1,  reason:'PROCESS',  linkId:'p2' },
    ]);
  });

  it('scopes strictly to supplierId', async () => {
    const url = mkUrl({ page: 1, pageSize: 25, sort: 'createdAt', dir: 'asc' });
    const { envelope } = await runSupplier({ prisma, url, params: { supplierId: 9 } });

    expect(envelope.meta.reportId).toBe('supplier_ledger');
    expect(envelope.rows.map(r => r.id)).toEqual([201, 202]);
    expect(envelope.paging).toMatchObject({ hasPrev: false, hasNext: false });
  });

  it('rejects when supplierId missing', async () => {
    const url = mkUrl();
    await expect(runSupplier({ prisma, url })).rejects.toThrow();
  });
});
