import { fail, redirect } from "@sveltejs/kit";
import { p as prepareDispatchForm, e as executeDispatch } from "../../../../../chunks/dispatchService.js";
const FROM_MMA = "ABS_SCREENED";
const TO_MMA = "PSS_SCREENED";
const TARGET_AFTER_SUCCESS = "/stations/abs/abs_screened";
async function load({ url }) {
  const base = await prepareDispatchForm({
    url,
    lane: { fromMmaCode: FROM_MMA, toMmaCode: TO_MMA },
    options: { requireSize: true }
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
    stationCode: "ABS",
    stationName: "Abbottabad (ABS)",
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
export {
  actions,
  load
};
