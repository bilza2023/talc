import { describe, it, expect } from 'vitest';
import { buildDispatchUrl, buildReceiveUrl } from '../../src/lib/stationKit/url.js';

describe('StationKit — url helpers', () => {
  it('builds a dispatch URL with minimal params', () => {
    const url = buildDispatchUrl({
      fromStation: 'ABS', fromFamily: 'SCREENED',
      toStation: 'PSS', toFamily: 'SCREENED',
      supplierId: 861, shade: 'WHITE', size: 'CHIPS', qty: 12
    });
    expect(url).toBe('/actions/dispatch?fromStation=ABS&fromFamily=SCREENED&toStation=PSS&toFamily=SCREENED&supplierId=861&shade=WHITE&size=CHIPS&qty=12');
  });

  it('builds a receive URL', () => {
    const url = buildReceiveUrl({ toStation: 'PSS', toFamily: 'SCREENED', transportId: 'T-123' });
    expect(url).toBe('/actions/receive?toStation=PSS&toFamily=SCREENED&transportId=T-123');
  });

  it('serializes meta only when provided', () => {
    const withMeta = buildDispatchUrl({
      fromStation: 'PSS', fromFamily: 'SORTED',
      toStation: 'KEF', toFamily: 'SORTED',
      supplierId: 1, shade: 'WHITE', size: 'LUMPS', qty: 5, meta: { note: 'test' }
    });
    expect(withMeta).toContain('meta=%7B%22note%22%3A%22test%22%7D');

    const noMeta = buildDispatchUrl({
      fromStation: 'PSS', fromFamily: 'SORTED',
      toStation: 'KEF', toFamily: 'SORTED',
      supplierId: 1, shade: 'WHITE', size: 'LUMPS', qty: 5
    });
    expect(noMeta.includes('meta=')).toBe(false);
  });
});
