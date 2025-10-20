import { f as fail } from './index-BL3bFNcc.js';
import { e as executeCancel, a as executeReceive, l as listInboundForMany } from './receiveService-DNgbaqPm.js';
import './stockEngine-jmqVw6zN.js';
import '@prisma/client';
import 'crypto';

const FROM_MMA = "PSS_SORTED";
const TO_MMA = "KEF_SORTED";
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
    if (toMmaCode !== TO_MMA) {
      return fail(400, { message: `Invalid toMmaCode for KEF Receive: ${toMmaCode}` });
    }
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
    if (toMmaCode && toMmaCode !== TO_MMA) {
      return fail(400, { message: `Invalid toMmaCode for KEF Cancel: ${toMmaCode}` });
    }
    try {
      await executeCancel({ transportId });
      return { ok: true };
    } catch (err) {
      console.error("[kef/cancel]", transportId, err?.message);
      return fail(400, { message: err?.message || "Cancel failed", transportId });
    }
  }
};

var _page_server = /*#__PURE__*/Object.freeze({
  __proto__: null,
  actions: actions,
  load: load
});

const index = 31;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-BPZHBOfy.js')).default;
const server_id = "src/routes/stations/kef/receive/+page.server.js";
const imports = ["_app/immutable/nodes/31.BhKtUUd_.js","_app/immutable/chunks/BCQUcm9Y.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/_-nIq06z.js","_app/immutable/chunks/D4gjX95n.js"];
const stylesheets = ["_app/immutable/assets/ReceiveTopLoop.B2MIk1yS.css","_app/immutable/assets/31.CMPRkU-U.css","_app/immutable/assets/tokens.soP3Z-cK.css"];
const fonts = [];

export { component, fonts, imports, index, _page_server as server, server_id, stylesheets };
//# sourceMappingURL=31-Bmq3vZ_X.js.map
