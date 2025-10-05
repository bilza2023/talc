
// /home/bilal-tariq/ab/src/lib/app/dispatchLoader.js

/**
 * Standard loader for dispatch pages.
 * Returns canonical keys expected by Dispatch.svelte.
 *
 * @param {{ url: URL, fetch: typeof fetch }} event
 * @param {{ fromMmaCode: string, toMmaCode: string }} lane
 * @param {{ requireSize?: boolean, defaultSize?: string, defaultQty?: number }} [opts]
 */
export async function loadDispatch(event, lane, opts = {}) {
    const { url, fetch } = event;
    const { fromMmaCode, toMmaCode } = lane;
  
    const requireSize = opts.requireSize ?? true;   // RAW lanes can set false
    const defaultSize = opts.defaultSize ?? 'ANY';  // used when requireSize=false
    const defaultQty  = opts.defaultQty ?? 1;
  
    const sp = url.searchParams;
  
    const supplierIdStr = sp.get('supplierId') ?? '';
    const supplierIdNum = supplierIdStr ? Number(supplierIdStr) : NaN;
  
    const shade = (sp.get('shade') ?? '').trim();
    const sizeParam = sp.get('size');
    const size = requireSize ? (sizeParam ?? '').trim() : (sizeParam ?? defaultSize);
  
    const qtyParam = sp.get('qty');
    const qtyNum = Number.isFinite(Number(qtyParam)) && Number(qtyParam) > 0
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
        const p = new URLSearchParams({
          mmaCode: fromMmaCode,
          supplierId: String(supplierIdNum),
          shade,
          size
        });
        const r = await fetch(`/api/onhand?${p.toString()}`);
        const j = await r.json();
        onHand = j?.ok ? Number(j.data ?? 0) : 0;
      } catch {
        onHand = 0;
      }
    }
  
    return {
      // for the form/component
      fromMmaCode: fromMmaCode,
      toMmaCode: toMmaCode,
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
  