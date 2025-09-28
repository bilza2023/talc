// /src/lib/stationKit/facadeFactory.js
import { prisma } from '../stocks/index.js';
import { getMma } from './registry.js';
import { assertVerbAllowed, assertEdgeAllowed } from './guards.js';
import { familyToStock } from './familyMap.js';

// Map caller synonyms → Stock/Registry families (always RAW/PROCESSED/SORTED for registry)
function normalizeFamily(family) {
  const key = String(family || '').toUpperCase();

  // Canonical enum families everywhere
  const fam =
    key === 'UNSCREENED' ? 'RAW' :
    key === 'RAW'        ? 'RAW' :
    key === 'SCREENED'   ? 'SCREENED' :
    key === 'PROCESSED'  ? 'SCREENED' : // ← important: processed maps to SCREENED
    key === 'SORTED'     ? 'SORTED' :
    (() => { throw new Error(`Unknown family "${family}"`); })();

  // Use enum family for both stock + registry pathways
  return { stockFam: fam, registryFam: fam };
}

async function inferSupplierIdIfMissing(stock, transportId) {
  const T = prisma[stock.transportModel];
  const row = await T.findFirst({
    where: { transportId: String(transportId), type: 'DISPATCH' },
    select: { supplierId: true }
  });
  if (!row || !row.supplierId) throw new Error('Unable to infer supplierId from transport');
  return Number(row.supplierId);
}

export function makeFacade(stationCode) {
  return {
    code: stationCode,

    async purchase({ family, supplierId, shade, size, qty, amount, meta } = {}) {
      const { stockFam, registryFam } = normalizeFamily(family);
      assertVerbAllowed({ station: stationCode, family: registryFam, verb: 'purchase' });
      const mma = getMma(stationCode, registryFam);
      const stock = familyToStock(stockFam);
      return stock.deposit({
        toMmaCode: mma.mmaCode,
        supplierId: Number(supplierId),
        shade: String(shade),
        size: String(size),
        qty: Number(qty),
        amount: amount == null ? undefined : Number(amount),
        toStationCode: stationCode,
        meta: meta && typeof meta === 'object' ? meta : {}
      });
    },

    async dispatch({ fromFamily, toStation, toFamily, supplierId, shade, size, qty, amount, meta } = {}) {
      const { stockFam: fromStockFam, registryFam: fromRegFam } = normalizeFamily(fromFamily);
      const { registryFam: toRegFam } = normalizeFamily(toFamily);
      assertVerbAllowed({ station: stationCode, family: fromRegFam, verb: 'dispatch' });
      assertEdgeAllowed({ fromStation: stationCode, fromFamily: fromRegFam, toStation, toFamily: toRegFam });

      const fromMma = getMma(stationCode, fromRegFam);
      const toMma   = getMma(toStation,   toRegFam);
      const stock   = familyToStock(fromStockFam);

      return stock.dispatch({
        fromMmaCode: fromMma.mmaCode,
        toMmaCode: toMma.mmaCode,
        supplierId: Number(supplierId),
        shade: String(shade),
        size: String(size),
        qty: Number(qty),
        amount: amount == null ? undefined : Number(amount),
        fromStationCode: stationCode,
        toStationCode: toStation,
        meta: meta && typeof meta === 'object' ? meta : {}
      });
    },

    async receive({ toFamily, transportId, supplierId, qty, amount, shade, meta } = {}) {
      const { stockFam, registryFam } = normalizeFamily(toFamily);
      assertVerbAllowed({ station: stationCode, family: registryFam, verb: 'receive' });
      const toMma = getMma(stationCode, registryFam);
      const stock = familyToStock(stockFam);

      const sId = supplierId != null
        ? Number(supplierId)
        : await inferSupplierIdIfMissing(stock, transportId);

      return stock.receive({
        transportId: String(transportId),
        toMmaCode: toMma.mmaCode,
        supplierId: sId,
        qty:    qty    == null ? undefined : Number(qty),
        amount: amount == null ? undefined : Number(amount),
        shade:  shade  == null ? undefined : String(shade),
        toStationCode: stationCode,
        meta: meta && typeof meta === 'object' ? meta : {}
      });
    },

    async cancel({ toFamily, transportId, meta } = {}) {
      const { stockFam, registryFam } = normalizeFamily(toFamily);
      assertVerbAllowed({ station: stationCode, family: registryFam, verb: 'receive' });
      const stock = familyToStock(stockFam);
      return stock.cancel({
        transportId: String(transportId),
        meta: meta && typeof meta === 'object' ? meta : {}
      });
    },

    // Reads — thin wrappers over Stock
    async slots({ family, positiveOnly = true } = {}) {
      const { stockFam, registryFam } = normalizeFamily(family);
      const mma = getMma(stationCode, registryFam);
      const stock = familyToStock(stockFam);
      return stock.slots({ mmaCode: mma.mmaCode, positiveOnly });
    },

    async inbound({ family } = {}) {
      const { stockFam, registryFam } = normalizeFamily(family);
      const mma = getMma(stationCode, registryFam);
      const stock = familyToStock(stockFam);
      return stock.inbound({ mmaCode: mma.mmaCode });
    },

    async outbound({ family } = {}) {
      const { stockFam, registryFam } = normalizeFamily(family);
      const mma = getMma(stationCode, registryFam);
      const stock = familyToStock(stockFam);
      return stock.outbound({ mmaCode: mma.mmaCode });
    },

    async onHand({ family, supplierId, shade, size } = {}) {
      const { stockFam, registryFam } = normalizeFamily(family);
      const mma = getMma(stationCode, registryFam);
      const stock = familyToStock(stockFam);
      return stock.onHand({ mmaCode: mma.mmaCode, supplierId, shade, size });
    }
  };
}
