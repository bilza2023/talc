
// Canonical, UI-ready reads built only from Stock APIs.

import { familyToStock } from './familyMap.js';
import { getStation } from './registry.js';

async function overviewForMma(mma) {
  const stock = familyToStock(mma.family);

  const [onHand, slots, inbound, outbound, transportAmounts] = await Promise.all([
    stock.onHand({ mmaCode: mma.mmaCode }),
    stock.slots({ mmaCode: mma.mmaCode, positiveOnly: true }),
    stock.inbound({ mmaCode: mma.mmaCode }),
    stock.outbound({ mmaCode: mma.mmaCode }),
    stock.transportAmounts({ mmaCode: mma.mmaCode })
  ]);

  return {
    family: mma.family,
    mmaCode: mma.mmaCode,
    label: mma.label,
    onHand,
    slots,
    inbound,
    outbound,
    transportAmounts
  };
}

export async function getStationOverview(stationCode) {
  const st = getStation(stationCode);
  const mmas = st.mmas ? Object.values(st.mmas) : [];
  const details = await Promise.all(mmas.map(overviewForMma));

  return {
    station: { code: st.code, label: st.label },
    mmas: details
  };
}

export async function getMmaOverview(stationCode, family) {
  const st = getStation(stationCode);
  const mma = st.mmas?.[family];
  if (!mma) throw new Error(`No MMA for ${stationCode}/${family}`);
  return overviewForMma(mma);
}
