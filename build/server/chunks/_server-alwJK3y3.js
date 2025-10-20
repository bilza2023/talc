import { j as json } from './index-BL3bFNcc.js';
import { s as stock } from './stockEngine-jmqVw6zN.js';
import '@prisma/client';
import 'crypto';

async function POST({ url }) {
  try {
    const fromMmaCode = url.searchParams.get("fromMmaCode");
    const toMmaCode = url.searchParams.get("toMmaCode");
    const supplierId = Number(url.searchParams.get("supplierId"));
    const shade = url.searchParams.get("shade");
    const size = url.searchParams.get("size") || "ANY";
    const qty = Number(url.searchParams.get("qty"));
    const amountParam = url.searchParams.get("amount");
    const amount = amountParam != null ? Number(amountParam) : null;
    if (!fromMmaCode || !toMmaCode || !supplierId || !shade || !qty) {
      return json({ ok: false, error: "Missing required params" }, { status: 400 });
    }
    const data = await stock.dispatch({
      fromMmaCode,
      toMmaCode,
      supplierId,
      shade,
      size,
      qty,
      amount
    });
    return json({ ok: true, data });
  } catch (err) {
    return json({ ok: false, error: err.message }, { status: 500 });
  }
}

export { POST };
//# sourceMappingURL=_server-alwJK3y3.js.map
