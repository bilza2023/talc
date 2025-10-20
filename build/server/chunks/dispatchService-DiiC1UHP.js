import { s as stock } from './stockEngine-jmqVw6zN.js';

async function prepareDispatchForm({ url, lane, options = {} }) {
  const { fromMmaCode, toMmaCode } = lane;
  const requireSize = options.requireSize ?? true;
  const defaultSize = options.defaultSize ?? "ANY";
  const defaultQty = options.defaultQty ?? 1;
  const sp = url.searchParams;
  const supplierIdStr = sp.get("supplierId") ?? "";
  const supplierIdNum = supplierIdStr ? Number(supplierIdStr) : NaN;
  const shade = (sp.get("shade") ?? "").trim();
  const sizeParam = sp.get("size");
  const size = requireSize ? (sizeParam ?? "").trim() : sizeParam ?? defaultSize;
  const qtyParam = sp.get("qty");
  const qtyNum = Number.isFinite(Number(qtyParam)) && Number(qtyParam) > 0 ? Number(qtyParam) : defaultQty;
  const missing = !Number.isFinite(supplierIdNum) || supplierIdNum <= 0 || !shade || requireSize && !size;
  let onHand = 0;
  if (!missing) {
    try {
      onHand = await stock.onHand({
        mmaCode: fromMmaCode,
        supplierId: supplierIdNum,
        shade,
        size
      });
      onHand = Number(onHand ?? 0);
    } catch {
      onHand = 0;
    }
  }
  return {
    // for the form/component
    fromMmaCode,
    toMmaCode,
    supplierId: supplierIdNum,
    shade,
    size,
    qty: qtyNum,
    onHand,
    // UX helper message (null when OK)
    error: missing ? `Missing supplierId, shade, or size in URL. Open this from the ${fromMmaCode} slots page.` : null
  };
}
async function executeDispatch(payload) {
  const {
    fromMmaCode,
    toMmaCode,
    supplierId,
    shade,
    size,
    qty,
    amount = null,
    meta = null,
    transportId
  } = payload;
  return stock.dispatch({
    fromMmaCode,
    toMmaCode,
    supplierId: Number(supplierId),
    shade: String(shade),
    size: String(size ?? "ANY"),
    qty: Number(qty),
    amount: amount != null ? Number(amount) : null,
    meta,
    transportId
  });
}

export { executeDispatch as e, prepareDispatchForm as p };
//# sourceMappingURL=dispatchService-DiiC1UHP.js.map
