
// Station façade builder: standard verbs with guardrails & supplier inference.

import { prisma } from '../stocks/index.js';
import { getMma } from './registry.js';
import { assertVerbAllowed, assertEdgeAllowed } from './guards.js';
import { familyToStock } from './familyMap.js';

async function inferSupplierIdIfMissing(stock, transportId) {
  // Read supplierId from the DISPATCH event for this transport.
  const T = prisma[stock.transportModel];
  const row = await T.findFirst({
    where: { transportId, type: 'DISPATCH' },
    select: { supplierId: true }
  });
  if (!row || !row.supplierId) throw new Error('Unable to infer supplierId from transport');
  return Number(row.supplierId);
}

export function makeFacade(stationCode) {
  return {
    code: stationCode,

    // Purchase into a station's MMA (family)
    async purchase({ family, supplierId, shade, size, qty, amount, meta } = {}) {
      assertVerbAllowed({ station: stationCode, family, verb: 'purchase' });
      const mma = getMma(stationCode, family);
      const stock = familyToStock(family);
      return stock.deposit({
        toStationCode: stationCode,
        toMmaCode: mma.mmaCode,
        supplierId: Number(supplierId),
        shade: String(shade),
        size: String(size),
        qty: Number(qty),
        amount: amount == null ? undefined : Number(amount),
        meta: meta && typeof meta === 'object' ? meta : {}
      });
    },

    // Dispatch from this station/family to another station/family
    async dispatch({ fromFamily, toStation, toFamily, supplierId, shade, size, qty, amount, meta } = {}) {
      assertVerbAllowed({ station: stationCode, family: fromFamily, verb: 'dispatch' });
      assertEdgeAllowed({ fromStation: stationCode, fromFamily, toStation, toFamily });

      const fromMma = getMma(stationCode, fromFamily);
      const toMma = getMma(toStation, toFamily);
      const stock = familyToStock(fromFamily);

      return stock.dispatch({
        fromStationCode: stationCode,
        fromMmaCode: fromMma.mmaCode,
        toStationCode: toStation,
        toMmaCode: toMma.mmaCode,
        supplierId: Number(supplierId),
        shade: String(shade),
        size: String(size),
        qty: Number(qty),
        amount: amount == null ? undefined : Number(amount),
        meta: meta && typeof meta === 'object' ? meta : {}
      });
    },

    // Receive into this station/family for a given transport
    async receive({ toFamily, transportId, supplierId, qty, amount, shade, meta } = {}) {
      assertVerbAllowed({ station: stationCode, family: toFamily, verb: 'receive' });

      const toMma = getMma(stationCode, toFamily);
      const stock = familyToStock(toFamily);

      const sId = supplierId != null
        ? Number(supplierId)
        : await inferSupplierIdIfMissing(stock, String(transportId));

      return stock.receive({
        transportId: String(transportId),
        toStationCode: stationCode,
        toMmaCode: toMma.mmaCode,
        supplierId: sId,
        // Optional overrides (Stock will default from DISPATCH if omitted)
        qty: qty == null ? undefined : Number(qty),
        amount: amount == null ? undefined : Number(amount),
        shade: shade == null ? undefined : String(shade),
        meta: meta && typeof meta === 'object' ? meta : {}
      });
    },

    // Cancel a transport into this station/family
    async cancel({ toFamily, transportId, meta } = {}) {
      assertVerbAllowed({ station: stationCode, family: toFamily, verb: 'receive' }); // same permission gate
      const toMma = getMma(stationCode, toFamily);
      const stock = familyToStock(toFamily);
      return stock.cancel({
        transportId: String(transportId),
        toStationCode: stationCode,
        toMmaCode: toMma.mmaCode,
        meta: meta && typeof meta === 'object' ? meta : {}
      });
    }
  };
}
