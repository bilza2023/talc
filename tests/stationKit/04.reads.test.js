import { describe, it, expect } from 'vitest';
import { getStationOverview, getMmaOverview } from '../../src/lib/stationKit/reads.js';

describe('StationKit — reads', () => {
  it('returns a station overview with expected keys', async () => {
    const ov = await getStationOverview('ABS');
    expect(ov.station.code).toBe('ABS');
    expect(Array.isArray(ov.mmas)).toBe(true);
    for (const m of ov.mmas) {
      expect(m).toHaveProperty('mmaCode');
      expect(m).toHaveProperty('onHand');
      expect(m).toHaveProperty('slots');
      expect(m).toHaveProperty('inbound');
      expect(m).toHaveProperty('outbound');
      expect(m).toHaveProperty('transportAmounts');
    }
  });

  it('returns MMA overview for a specific family', async () => {
    const m = await getMmaOverview('PSS', 'SORTED');
    expect(m.family).toBe('SORTED');
    expect(m).toHaveProperty('onHand');
  });
});
