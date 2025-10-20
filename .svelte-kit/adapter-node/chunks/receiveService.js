import { s as stock } from "./stockEngine.js";
async function listInboundForMany({ lanes = [] } = {}) {
  if (!Array.isArray(lanes) || lanes.length === 0) return { lanes: [], rows: [] };
  const byTo = groupByToMma(lanes);
  const pulls = await Promise.all(
    Object.keys(byTo).map(async (toMmaCode) => {
      const inboundAll = await stock.inbound({ mmaCode: toMmaCode }) ?? [];
      const active = inboundAll.filter((t) => !isCancelled(t));
      const allowFrom = new Set(byTo[toMmaCode].map((l) => l.fromMmaCode).filter(Boolean));
      const filtered = allowFrom.size ? active.filter((t) => allowFrom.has(t.fromMmaCode) && t.toMmaCode === toMmaCode) : active.filter((t) => t.toMmaCode === toMmaCode);
      return filtered.map((t) => ({
        transportId: t.transportId,
        fromMmaCode: t.fromMmaCode,
        toMmaCode: t.toMmaCode,
        supplierId: t.supplierId,
        shade: t.shade ?? null,
        size: t.size ?? null,
        qty: Number(t.qty ?? 0),
        amount: t.amount != null ? Number(t.amount) : null,
        createdAt: t.createdAt
      }));
    })
  );
  const merged = [].concat(...pulls);
  const seen = /* @__PURE__ */ new Set();
  const deduped = [];
  for (const r of merged) {
    if (seen.has(r.transportId)) continue;
    seen.add(r.transportId);
    deduped.push(r);
  }
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
async function executeReceive(payload) {
  const {
    transportId,
    toMmaCode,
    supplierId,
    qty,
    amount,
    shade,
    size,
    meta
  } = payload ?? {};
  return stock.receive({
    transportId: String(transportId),
    toMmaCode: String(toMmaCode),
    supplierId: Number(supplierId),
    qty: qty != null ? Number(qty) : void 0,
    amount: amount != null ? Number(amount) : void 0,
    shade: shade != null ? String(shade) : void 0,
    size: size != null ? String(size) : void 0,
    meta
  });
}
async function executeCancel({ transportId }) {
  return stock.cancel({
    transportId: String(transportId),
    meta: { intent: "cancel" }
  });
}
function isCancelled(r) {
  const m = r?.meta;
  return m?.intent === "cancel" || m?.cancelled === true || r?.status === "CANCELLED";
}
export {
  executeReceive as a,
  executeCancel as e,
  listInboundForMany as l
};
