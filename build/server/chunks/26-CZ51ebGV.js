async function loadDispatch(event, lane, opts = {}) {
  const { url, fetch } = event;
  const { fromMmaCode, toMmaCode } = lane;
  const requireSize = opts.requireSize ?? true;
  const defaultSize = opts.defaultSize ?? "ANY";
  const defaultQty = opts.defaultQty ?? 1;
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
const FROM_MMA = "ABS_SCREENED";
const TO_MMA = "KEF_SCREENED";
async function load(event) {
  return loadDispatch(event, { fromMmaCode: FROM_MMA, toMmaCode: TO_MMA }, { requireSize: true });
}

var _page_server = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 26;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-Ci7qfLF6.js')).default;
const server_id = "src/routes/stations/abs/dispatch_kef_screened/+page.server.js";
const imports = ["_app/immutable/nodes/26.DWHOhqdX.js","_app/immutable/chunks/BCQUcm9Y.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/CBAbiM5a.js"];
const stylesheets = ["_app/immutable/assets/Dispatch.DLogtm1j.css"];
const fonts = [];

export { component, fonts, imports, index, _page_server as server, server_id, stylesheets };
//# sourceMappingURL=26-CZ51ebGV.js.map
