import { f as fail } from './index-BL3bFNcc.js';
import { e as executeCancel, a as executeReceive, l as listInboundForMany } from './receiveService-DNgbaqPm.js';
import './stockEngine-jmqVw6zN.js';
import '@prisma/client';
import 'crypto';

const FROM_MMA = "ABS_SCREENED";
const TO_MMA = "PSS_SCREENED";
const load = async () => {
  const lanes = [{ fromMmaCode: FROM_MMA, toMmaCode: TO_MMA }];
  const { rows } = await listInboundForMany({ lanes });
  return { lanes, rows };
};
const actions = {
  receive: async ({ request }) => {
    const form = await request.formData();
    const transportId = String(form.get("transportId") ?? "").trim();
    const toMmaCode = String(form.get("toMmaCode") ?? "").trim();
    const supplierId = Number(form.get("supplierId") ?? "");
    const qty = form.get("qty");
    const amount = form.get("amount");
    const shade = form.get("shade");
    const size = form.get("size");
    if (!transportId) return fail(400, { message: "Missing transportId" });
    if (toMmaCode !== TO_MMA) return fail(400, { message: `Invalid toMmaCode for PSS Receive: ${toMmaCode}` });
    if (!Number.isFinite(supplierId) || supplierId <= 0) {
      return fail(400, { message: "Invalid supplierId" });
    }
    try {
      await executeReceive({
        transportId,
        toMmaCode,
        supplierId,
        qty: qty === "" ? void 0 : Number(qty),
        amount: amount === "" ? void 0 : Number(amount),
        shade: shade === "" ? void 0 : String(shade),
        size: size === "" ? void 0 : String(size)
      });
      return { ok: true };
    } catch (err) {
      return fail(400, { message: err?.message || "Receive failed", transportId, toMmaCode });
    }
  },
  cancel: async ({ request }) => {
    const form = await request.formData();
    const transportId = String(form.get("transportId") ?? "").trim();
    const toMmaCode = String(form.get("toMmaCode") ?? "").trim();
    if (!transportId) return fail(400, { message: "Missing transportId" });
    const TO_MMA2 = "PSS_SCREENED";
    if (toMmaCode && toMmaCode !== TO_MMA2) {
      return fail(400, { message: `Invalid toMmaCode for PSS Cancel: ${toMmaCode}` });
    }
    try {
      await executeCancel({ transportId });
      return { ok: true };
    } catch (err) {
      console.error("[cancel]", transportId, err?.message);
      return fail(400, { message: err?.message || "Cancel failed", transportId });
    }
  }
};

var _page_server = /*#__PURE__*/Object.freeze({
  __proto__: null,
  actions: actions,
  load: load
});

const index = 36;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-tHipburp.js')).default;
const server_id = "src/routes/stations/pss/receive/+page.server.js";
const imports = ["_app/immutable/nodes/36.0C2s-6sf.js","_app/immutable/chunks/BCQUcm9Y.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/_-nIq06z.js","_app/immutable/chunks/D4gjX95n.js"];
const stylesheets = ["_app/immutable/assets/ReceiveTopLoop.B2MIk1yS.css","_app/immutable/assets/36.XaOOsIub.css"];
const fonts = [];

export { component, fonts, imports, index, _page_server as server, server_id, stylesheets };
//# sourceMappingURL=36-CyKDnDRC.js.map
