import { describe, it, expect } from 'vitest';
import { makeEnvelope } from '../../src/lib/reportEngine/envelope.js';


describe('reportEngine.makeEnvelope', () => {
  it('wraps meta/schema/rows/paging and keeps optional kpis/facets', () => {
    const envelope = makeEnvelope({
      meta: { reportId: 'demo', title: 'Demo Report' },
      kpis: { total: 3 },
      facets: { shade: ['WHITE'] },
      schema: { columns: [{ key: 'id', label: 'ID' }] },
      rows: [{ id: 1 }, { id: 2 }, { id: 3 }],
      paging: { page: 1, pageSize: 25, hasPrev: false, hasNext: false, total: 3, totalPages: 1 }
    });
    expect(envelope.meta.title).toBe('Demo Report');
    expect(envelope.schema.columns[0].key).toBe('id');
    expect(envelope.rows.length).toBe(3);
    expect(envelope.kpis.total).toBe(3);
    expect(envelope.facets.shade).toEqual(['WHITE']);
    expect(envelope.paging.total).toBe(3);
  });
});
