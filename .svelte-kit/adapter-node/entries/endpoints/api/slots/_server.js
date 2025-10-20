import { json } from "@sveltejs/kit";
import { s as stock } from "../../../../chunks/stockEngine.js";
function toBool(v, def = true) {
  if (v == null) return def;
  const s = String(v).toLowerCase();
  return s === "1" || s === "true" || s === "yes" || s === "on";
}
async function GET({ url }) {
  try {
    const mmaCode = url.searchParams.get("mmaCode");
    if (!mmaCode) return json({ ok: false, error: "mmaCode is required" }, { status: 400 });
    const positiveOnly = toBool(url.searchParams.get("positiveOnly"), true);
    const rows = await stock.slots({ mmaCode, positiveOnly });
    return json({ ok: true, data: rows });
  } catch (err) {
    return json({ ok: false, error: err.message }, { status: 500 });
  }
}
export {
  GET
};
