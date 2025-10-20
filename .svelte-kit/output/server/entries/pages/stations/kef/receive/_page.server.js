import { fail } from "@sveltejs/kit";
import { l as listInboundForMany, e as executeCancel, a as executeReceive } from "../../../../../chunks/receiveService.js";
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
export {
  actions,
  load
};
