import { describe, it, expect } from 'vitest';
import { makeFacade } from '../../src/lib/stationKit/facadeFactory.js';
import { familyToStock } from '../../src/lib/stationKit/familyMap.js';
import { getMma } from '../../src/lib/stationKit/registry.js';
import { STATION, FAMILY } from '../../src/lib/stationKit/constants.js';

describe('StationKit — facade (ABS SCREENED -> PSS SCREENED)', () => {
  it('dispatches from ABS/SCREENED and receives into PSS/SCREENED with supplier inference', async () => {
    const abs = makeFacade(STATION.ABS);
    const pss = makeFacade(STATION.PSS);

    // Seed: put some screened stock at ABS so we can dispatch.
    const absScreened = getMma(STATION.ABS, FAMILY.SCREENED);
    const screenedStock = familyToStock(FAMILY.SCREENED);

    await screenedStock.deposit({
      toStationCode: STATION.ABS,
      toMmaCode: absScreened.mmaCode,
      supplierId: 861,
      shade: 'WHITE',
      size: 'CHIPS',
      qty: 10
    });

    // Dispatch ABS SCREENED -> PSS SCREENED
    const dispatch = await abs.dispatch({
      fromFamily: FAMILY.SCREENED,
      toStation: STATION.PSS,
      toFamily: FAMILY.SCREENED,
      supplierId: 861,
      shade: 'WHITE',
      size: 'CHIPS',
      qty: 7
    });
    expect(dispatch.transportId).toBeTruthy();

    // Receive at PSS with NO supplierId (should be inferred from the DISPATCH row)
    const recv = await pss.receive({
      toFamily: FAMILY.SCREENED,
      transportId: dispatch.transportId
      // no supplierId here on purpose
    });

    // Basic invariants: inbound cleared, onHand increased on PSS/SCREENED
    const pssScreened = getMma(STATION.PSS, FAMILY.SCREENED);
    const inbound = await screenedStock.inbound({ mmaCode: pssScreened.mmaCode });
    expect(inbound.find(t => t.transportId === dispatch.transportId)).toBeFalsy();

    const onHand = await screenedStock.onHand({ mmaCode: pssScreened.mmaCode });
    expect(onHand).toBeGreaterThanOrEqual(7);

    // Sanity: ABS/SCREENED onHand should be <= initial - qty
    const absOnHand = await screenedStock.onHand({ mmaCode: absScreened.mmaCode });
    expect(absOnHand).toBeLessThanOrEqual(3);
  });
});
