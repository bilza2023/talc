
import { describe, it, expect } from 'vitest';
import { StationRegistry, getStation, getMma } from '../../src/lib/stationKit/registry.js';
import { RouteMatrix, findRoutesFrom, findEdge } from '../../src/lib/stationKit/routes.js';
import { STATION, FAMILY } from '../../src/lib/stationKit/constants.js';

describe('StationKit — registry & routes (contract)', () => {
  it('has ABS, PSS, KEF with expected families', () => {
    expect(Object.keys(StationRegistry)).toEqual(expect.arrayContaining([STATION.ABS, STATION.PSS, STATION.KEF]));
    expect(getMma(STATION.ABS, FAMILY.RAW)).toBeTruthy();
    expect(getMma(STATION.ABS, FAMILY.SCREENED)).toBeTruthy();
    expect(getMma(STATION.PSS, FAMILY.SCREENED)).toBeTruthy();
    expect(getMma(STATION.PSS, FAMILY.SORTED)).toBeTruthy();
    expect(getMma(STATION.KEF, FAMILY.SORTED)).toBeTruthy();
  });

  it('has enabled internal processes & transports we rely on', () => {
    // ABS RAW -> ABS SCREENED (process)
    expect(findEdge({
      fromStation: STATION.ABS, fromFamily: FAMILY.RAW,
      toStation: STATION.ABS, toFamily: FAMILY.SCREENED
    })?.enabled).toBe(true);

    // PSS SCREENED -> PSS SORTED (process)
    expect(findEdge({
      fromStation: STATION.PSS, fromFamily: FAMILY.SCREENED,
      toStation: STATION.PSS, toFamily: FAMILY.SORTED
    })?.enabled).toBe(true);

    // ABS SCREENED -> PSS SCREENED (transport)
    expect(findEdge({
      fromStation: STATION.ABS, fromFamily: FAMILY.SCREENED,
      toStation: STATION.PSS, toFamily: FAMILY.SCREENED
    })?.enabled).toBe(true);

    // PSS SORTED -> KEF SORTED (transport)
    expect(findEdge({
      fromStation: STATION.PSS, fromFamily: FAMILY.SORTED,
      toStation: STATION.KEF, toFamily: FAMILY.SORTED
    })?.enabled).toBe(true);
  });

  it('keeps experimental PSS SCREENED -> KEF SORTED edge disabled', () => {
    const edge = findEdge({
      fromStation: STATION.PSS, fromFamily: FAMILY.SCREENED,
      toStation: STATION.KEF, toFamily: FAMILY.SORTED
    });
    expect(edge?.enabled).toBe(false);
  });

  it('routesFrom filters by station/family', () => {
    const fromAbsScreened = findRoutesFrom(STATION.ABS, FAMILY.SCREENED);
    expect(fromAbsScreened.length).toBeGreaterThan(0);
    expect(fromAbsScreened.every(r => r.from.station === STATION.ABS && r.from.family === FAMILY.SCREENED)).toBe(true);
  });
});
