import { f as fail, r as redirect } from './index-BL3bFNcc.js';
import { e as executeDispatch, p as prepareDispatchForm } from './dispatchService-DiiC1UHP.js';
import './stockEngine-jmqVw6zN.js';
import '@prisma/client';
import 'crypto';

const FROM_MMA = "PSS_SORTED";
const TO_MMA = "KEF_SORTED";
const TARGET_AFTER_SUCCESS = "/stations/pss/pss_sorted";
async function load({ url }) {
  const base = await prepareDispatchForm({
    url,
    lane: { fromMmaCode: FROM_MMA, toMmaCode: TO_MMA },
    options: { requireSize: true }
    // sorted lanes require explicit size
  });
  const sp = url.searchParams;
  const fromUrl = {
    supplierId: sp.get("supplierId") ?? "",
    shade: sp.get("shade") ?? "",
    size: sp.get("size") ?? "",
    qty: sp.get("qty") ?? ""
  };
  const form = {
    ...base,
    from: base.fromMmaCode,
    to: base.toMmaCode,
    fromMma: base.fromMmaCode,
    toMma: base.toMmaCode,
    sourceMma: base.fromMmaCode,
    destinationMma: base.toMmaCode,
    laneFrom: base.fromMmaCode,
    laneTo: base.toMmaCode
  };
  return {
    stationCode: "PSS",
    stationName: "Peshawar (PSS)",
    fromUrl,
    form,
    lane: { from: base.fromMmaCode, to: base.toMmaCode }
  };
}
const actions = {
  default: async ({ request }) => {
    const fd = await request.formData();
    const pick = (names, def = "") => {
      for (const n of names) {
        const v = fd.get(n);
        if (v != null && String(v).trim() !== "") return String(v).trim();
      }
      return def;
    };
    const supplierId = pick(["supplierId", "supplier_id", "supplier"]);
    const shade = pick(["shade", "fromShade", "color"]);
    const size = pick(["size", "fromSize", "grade"], "ANY");
    const qty = pick(["qty", "quantity", "qty_tons"]);
    const amount = pick(["amount", "price", "amt"], "");
    try {
      await executeDispatch({
        fromMmaCode: FROM_MMA,
        toMmaCode: TO_MMA,
        supplierId,
        shade,
        size,
        qty,
        amount: amount === "" ? null : amount
      });
    } catch (err) {
      return fail(400, {
        message: err?.message || "Dispatch failed",
        supplierId,
        shade,
        size,
        qty,
        amount
      });
    }
    throw redirect(303, TARGET_AFTER_SUCCESS);
  }
};

var _page_server = /*#__PURE__*/Object.freeze({
  __proto__: null,
  actions: actions,
  load: load
});

const index = 33;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-B2tvckD3.js')).default;
const server_id = "src/routes/stations/pss/dispatch_kef_sorted/+page.server.js";
const imports = ["_app/immutable/nodes/33.D9cTVrQz.js","_app/immutable/chunks/BCQUcm9Y.js","_app/immutable/chunks/CgU5AtxT.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/CBAbiM5a.js"];
const stylesheets = ["_app/immutable/assets/Dispatch.DLogtm1j.css"];
const fonts = [];

export { component, fonts, imports, index, _page_server as server, server_id, stylesheets };
//# sourceMappingURL=33-CnXqvUKU.js.map
