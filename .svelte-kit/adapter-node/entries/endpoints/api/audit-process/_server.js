import { json } from "@sveltejs/kit";
import { s as stock } from "../../../../chunks/stockEngine.js";
async function GET({ url }) {
  try {
    const processId = url.searchParams.get("processId");
    const mmaCode = url.searchParams.get("mmaCode") || void 0;
    if (!processId) {
      return json({ ok: false, error: "processId is required" }, { status: 400 });
    }
    const data = await stock.auditProcess({ processId, mmaCode });
    return json({ ok: true, data });
  } catch (err) {
    return json({ ok: false, error: err.message }, { status: 500 });
  }
}
export {
  GET
};
