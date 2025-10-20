import { j as json } from './index-BL3bFNcc.js';
import { s as stock } from './stockEngine-jmqVw6zN.js';
import '@prisma/client';
import 'crypto';

async function POST({ url }) {
  try {
    const transportId = url.searchParams.get("transportId");
    const toMmaCode = url.searchParams.get("toMmaCode");
    const supplierId = Number(url.searchParams.get("supplierId"));
    if (!transportId || !toMmaCode || !supplierId) {
      return json({ ok: false, error: "Missing required params" }, { status: 400 });
    }
    const qtyParam = url.searchParams.get("qty");
    const amountParam = url.searchParams.get("amount");
    const shadeParam = url.searchParams.get("shade");
    const qty = qtyParam != null && qtyParam !== "" ? Number(qtyParam) : void 0;
    const amount = amountParam != null && amountParam !== "" ? Number(amountParam) : void 0;
    const shade = shadeParam != null && shadeParam !== "" ? String(shadeParam) : void 0;
    const data = await stock.receive({
      transportId,
      toMmaCode,
      supplierId,
      qty,
      amount,
      shade
    });
    return json({ ok: true, data });
  } catch (err) {
    return json({ ok: false, error: err.message }, { status: 500 });
  }
}

export { POST };
//# sourceMappingURL=_server-DPPVkCX9.js.map
