import { json } from "@sveltejs/kit";
import { s as stock } from "../../../../chunks/stockEngine.js";
async function GET({ url }) {
  try {
    const mmaCode = url.searchParams.get("mmaCode") || void 0;
    const supplier = url.searchParams.get("supplierId");
    const supplierId = supplier != null && supplier !== "" ? Number(supplier) : void 0;
    const shade = url.searchParams.get("shade") || void 0;
    const size = url.searchParams.get("size") || void 0;
    const value = await stock.onHand({ mmaCode, supplierId, shade, size });
    return json({ ok: true, data: value });
  } catch (err) {
    return json({ ok: false, error: err.message }, { status: 500 });
  }
}
export {
  GET
};
