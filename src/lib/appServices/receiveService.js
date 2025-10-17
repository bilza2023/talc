// Lane-aware receive service (multi-MMA)
// Source of truth: stock_transport via stock.inbound({ mmaCode })
import { stock } from '$lib/stocks/stockEngine.js';

/**
 * Back-compat: single-lane fetch (from → to)
 * Shapes rows straight from stock_transport (dispatch defaults included).
 *
 * @param {{ toMmaCode:string, fromMmaCode?:string }} lane
 */
export async function listInboundFor(lane) {
  const { toMmaCode, fromMmaCode } = lane ?? {};
  if (!toMmaCode) return { fromMmaCode: fromMmaCode || '(any)', toMmaCode: '', rows: [] };

  // Unsettled DISPATCH records headed to this MMA
  const inboundAll = (await stock.inbound({ mmaCode: toMmaCode })) ?? [];

  // Optional lane narrow
  const filtered = fromMmaCode
    ? inboundAll.filter(t => t.fromMmaCode === fromMmaCode && t.toMmaCode === toMmaCode)
    : inboundAll.filter(t => t.toMmaCode === toMmaCode);

  // Shape rows (keep dispatch defaults to allow "blank = inherit" at receive)
  const rows = filtered.map(t => ({
    transportId : t.transportId,
    fromMmaCode : t.fromMmaCode,
    toMmaCode   : t.toMmaCode,
    supplierId  : t.supplierId,
    shade       : t.shade ?? null,
    size        : t.size ?? null,
    qty         : Number(t.qty ?? 0),
    amount      : t.amount != null ? Number(t.amount) : null,
    createdAt   : t.createdAt
  }));

  return { fromMmaCode: fromMmaCode || '(any)', toMmaCode, rows };
}

/**
 * Multi-lane fetch for a station Receive page.
 * Loops the provided lane list, merges, de-dupes, and sorts by MMA.
 *
 * @param {{ lanes: Array<{ fromMmaCode:string, toMmaCode:string }> }} arg
 * @returns {Promise<{ lanes: Array<{fromMmaCode:string,toMmaCode:string}>, rows: Array<any> }>}
 */
export async function listInboundForMany({ lanes = [] } = {}) {
  if (!Array.isArray(lanes) || lanes.length === 0) return { lanes: [], rows: [] };

  // 1) Pull inbound per distinct "toMmaCode"
  const byTo = groupByToMma(lanes);
  const pulls = await Promise.all(
    Object.keys(byTo).map(async (toMmaCode) => {
      const inboundAll = (await stock.inbound({ mmaCode: toMmaCode })) ?? [];
      // Restrict to fromMmaCodes that are actually allowed for this toMmaCode (if any given)
      const allowFrom = new Set(byTo[toMmaCode].map(l => l.fromMmaCode).filter(Boolean));
      const filtered = allowFrom.size
        ? inboundAll.filter(t => allowFrom.has(t.fromMmaCode) && t.toMmaCode === toMmaCode)
        : inboundAll.filter(t => t.toMmaCode === toMmaCode);

      return filtered.map(t => ({
        transportId : t.transportId,
        fromMmaCode : t.fromMmaCode,
        toMmaCode   : t.toMmaCode,
        supplierId  : t.supplierId,
        shade       : t.shade ?? null,
        size        : t.size ?? null,
        qty         : Number(t.qty ?? 0),
        amount      : t.amount != null ? Number(t.amount) : null,
        createdAt   : t.createdAt
      }));
    })
  );

  // 2) Merge & de-dupe by transportId
  const merged = [].concat(...pulls);
  const seen = new Set();
  const deduped = [];
  for (const r of merged) {
    if (seen.has(r.transportId)) continue;
    seen.add(r.transportId);
    deduped.push(r);
  }

  // 3) Sort: toMmaCode ↑, fromMmaCode ↑, createdAt ↓, transportId ↓
  deduped.sort((a, b) => {
    if (a.toMmaCode !== b.toMmaCode) return a.toMmaCode.localeCompare(b.toMmaCode);
    if (a.fromMmaCode !== b.fromMmaCode) return a.fromMmaCode.localeCompare(b.fromMmaCode);
    const ad = new Date(a.createdAt).getTime();
    const bd = new Date(b.createdAt).getTime();
    if (ad !== bd) return bd - ad;
    return String(b.transportId).localeCompare(String(a.transportId));
  });

  return { lanes, rows: deduped };
}

function groupByToMma(lanes) {
  const map = {};
  for (const l of lanes) {
    if (!l || !l.toMmaCode) continue;
    const key = l.toMmaCode;
    (map[key] ||= []).push({ fromMmaCode: l.fromMmaCode || null, toMmaCode: key });
  }
  return map;
}

/**
 * Receive a single transport.
 * qty/amount/shade/size are optional overrides (blank = inherit dispatch defaults).
 *
 * @param {{ transportId:string, toMmaCode:string, supplierId:number, qty?:number, amount?:number, shade?:string, size?:string, meta?:any }} payload
 */
export async function executeReceive(payload) {
  const {
    transportId, toMmaCode, supplierId,
    qty, amount, shade, size, meta
  } = payload ?? {};

  return stock.receive({
    transportId : String(transportId),
    toMmaCode   : String(toMmaCode),
    supplierId  : Number(supplierId),
    qty         : qty != null ? Number(qty) : undefined,
    amount      : amount != null ? Number(amount) : undefined,
    shade       : shade != null ? String(shade) : undefined,
    size        : size != null ? String(size) : undefined,
    meta
  });
}
