
import { describe, it, expect } from 'vitest';
import { assertVerbAllowed, assertEdgeAllowed } from '../../src/lib/stationKit/guards.js';
import { STATION, FAMILY } from '../../src/lib/stationKit/constants.js';

describe('StationKit — guards', () => {
  it('allows a valid verb at a valid station/family', () => {
    expect(() => assertVerbAllowed({ station: STATION.PSS, family: FAMILY.SCREENED, verb: 'purchase' }))
      .not.toThrow();
  });

  it('rejects a verb not allowed at that family', () => {
    // e.g., purchase at PSS/SORTED is not allowed in registry
    expect(() => assertVerbAllowed({ station: STATION.PSS, family: FAMILY.SORTED, verb: 'purchase' }))
      .toThrow(/Verb "purchase" not allowed/);
  });

  it('allows a permitted edge', () => {
    expect(() =>
      assertEdgeAllowed({
        fromStation: STATION.PSS, fromFamily: FAMILY.SORTED,
        toStation: STATION.KEF, toFamily: FAMILY.SORTED
      })
    ).not.toThrow();
  });

  it('rejects a disabled/non-existent edge', () => {
    expect(() =>
      assertEdgeAllowed({
        fromStation: STATION.PSS, fromFamily: FAMILY.SCREENED,
        toStation: STATION.KEF, toFamily: FAMILY.SORTED
      })
    ).toThrow(/Edge not allowed/);
  });
});
