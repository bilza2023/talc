
import { describe, it, expect } from 'vitest';
import { StationRegistry } from '../../src/lib/stationKit/registry.js';
import { RouteMatrix } from '../../src/lib/stationKit/routes.js';
import { zStationRegistry, zRouteMatrix } from '../../src/lib/stationKit/schema.js';

describe('StationKit — schema shape', () => {
  it('StationRegistry matches schema', () => {
    const parsed = zStationRegistry.safeParse(StationRegistry);
    expect(parsed.success).toBe(true);
  });

  it('RouteMatrix matches schema', () => {
    const parsed = zRouteMatrix.safeParse(RouteMatrix);
    expect(parsed.success).toBe(true);
  });
});
