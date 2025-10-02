import { stock } from './stockEngine.js';
import { getMma } from './registry.js'; // if you use station-aware mapping
// or import { assertValidMma } from '../mmaCatalog.js';

function normalizeFamily(fam) {
  const k = String(fam || '').toUpperCase();
  if (k === 'UNSCREENED' || k === 'RAW') return 'RAW';
  if (k === 'SCREENED' || k === 'PROCESSED') return 'SCREENED';
  if (k === 'SORTED') return 'SORTED';
  throw new Error(`Unknown family "${fam}"`);
}

export function makeFacade(stationCode) {
  return {
    code: stationCode,

    async purchase({ family, supplierId, shade, size, qty, amount, meta } = {}) {
      const fam = normalizeFamily(family);
      const { mmaCode } = getMma(stationCode, fam);
      return stock.deposit({
        toMmaCode: mmaCode,
        supplierId: Number(supplierId),
        shade: String(shade),
        size: String(size ?? 'ANY'),
        qty: Number(qty),
        amount: amount == null ? undefined : Number(amount),
        toStationCode: stationCode,
        meta: meta ?? null,
      });
    },

    async dispatch({ fromFamily, toStation, toFamily, supplierId, shade, size, qty, amount, meta } = {}) {
      const fromFam = normalizeFamily(fromFamily);
      const toFam   = normalizeFamily(toFamily);
      const { mmaCode: fromMma } = getMma(stationCode, fromFam);
      const { mmaCode: toMma }   = getMma(toStation,   toFam);
      return stock.dispatch({
        fromMmaCode: fromMma,
        toMmaCode: toMma,
        supplierId: Number(supplierId),
        shade: String(shade),
        size: String(size ?? 'ANY'),
        qty: Number(qty),
        amount: amount == null ? undefined : Number(amount),
        fromStationCode: stationCode,
        toStationCode: toStation,
        meta: meta ?? null,
      });
    },

    async receive({ toFamily, transportId, supplierId, qty, amount, shade, meta } = {}) {
      const fam = normalizeFamily(toFamily);
      const { mmaCode } = getMma(stationCode, fam);
      return stock.receive({
        transportId: String(transportId),
        toMmaCode: mmaCode,
        supplierId: Number(supplierId),
        qty:    qty    == null ? undefined : Number(qty),
        amount: amount == null ? undefined : Number(amount),
        shade:  shade  == null ? undefined : String(shade),
        toStationCode: stationCode,
        meta: meta ?? null,
      });
    },

    async cancel({ transportId, meta } = {}) {
      return stock.cancel({ transportId: String(transportId), meta: meta ?? null });
    },

    // Reads
    async onHand({ family, supplierId, shade, size } = {}) {
      const fam = normalizeFamily(family);
      const { mmaCode } = getMma(stationCode, fam);
      return stock.onHand({ mmaCode, supplierId, shade, size });
    },
    async inbound({ family }) {
      const fam = normalizeFamily(family);
      const { mmaCode } = getMma(stationCode, fam);
      return stock.inbound({ mmaCode });
    },
    async outbound({ family }) {
      const fam = normalizeFamily(family);
      const { mmaCode } = getMma(stationCode, fam);
      return stock.outbound({ mmaCode });
    },
    async slots({ family, positiveOnly = true }) {
      const fam = normalizeFamily(family);
      const { mmaCode } = getMma(stationCode, fam);
      return stock.slots({ mmaCode, positiveOnly });
    },
  };
}
