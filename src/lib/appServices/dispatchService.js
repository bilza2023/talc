// /home/bilal-tariq/ab/src/lib/appServices/dispatchService.js
import { stock } from '$lib/stocks/stockEngine.js';

/**
 * Prepare data for a Dispatch form (same output shape as the old loader),
 * but calls Stock.onHand() directly (no internal HTTP).
 *
 * @param {Object} opts
 * @param {URL} opts.url
 * @param {{ fromMmaCode:string, toMmaCode:string }} opts.lane
 * @param {{ requireSize?:boolean, defaultSize?:string, defaultQty?:number }} [opts.options]
 */
export async function prepareDispatchForm({ url, lane, options = {} }) {
  const { fromMmaCode, toMmaCode } = lane;

  const requireSize = options.requireSize ?? true;   // RAW lanes can set false
  const defaultSize = options.defaultSize ?? 'ANY';  // used when requireSize=false
  const defaultQty  = options.defaultQty ?? 1;

  const sp = url.searchParams;

  const supplierIdStr = sp.get('supplierId') ?? '';
  const supplierIdNum = supplierIdStr ? Number(supplierIdStr) : NaN;

  const shade = (sp.get('shade') ?? '').trim();
  const sizeParam = sp.get('size');
  const size = requireSize ? (sizeParam ?? '').trim() : (sizeParam ?? defaultSize);

  const qtyParam = sp.get('qty');
  const qtyNum =
    Number.isFinite(Number(qtyParam)) && Number(qtyParam) > 0
      ? Number(qtyParam)
      : defaultQty;

  const missing =
    !Number.isFinite(supplierIdNum) ||
    supplierIdNum <= 0 ||
    !shade ||
    (requireSize && !size);

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
    error: missing
      ? `Missing supplierId, shade, or size in URL. Open this from the ${fromMmaCode} slots page.`
      : null
  };
}

/**
 * Execute a dispatch (thin pass-through to domain).
 * @param {{ fromMmaCode:string, toMmaCode:string, supplierId:number, shade:string, size:string, qty:number, amount?:number, meta?:any, transportId?:string }} payload
 */
export async function executeDispatch(payload) {
  const {
    fromMmaCode, toMmaCode, supplierId, shade, size, qty,
    amount = null, meta = null, transportId
  } = payload;

  return stock.dispatch({
    fromMmaCode,
    toMmaCode,
    supplierId: Number(supplierId),
    shade: String(shade),
    size: String(size ?? 'ANY'),
    qty: Number(qty),
    amount: amount != null ? Number(amount) : null,
    meta,
    transportId
  });
}
