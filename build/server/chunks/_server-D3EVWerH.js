import { j as json } from './index-BL3bFNcc.js';
import { s as stock } from './stockEngine-jmqVw6zN.js';
import '@prisma/client';
import 'crypto';

async function POST({ url }) {
  try {
    const fromMmaCode = url.searchParams.get("fromMmaCode");
    const supplierId = Number(url.searchParams.get("supplierId"));
    const shade = url.searchParams.get("shade");
    const size = url.searchParams.get("size") || "ANY";
    const qty = Number(url.searchParams.get("qty"));
    const processId = url.searchParams.get("processId");
    if (!fromMmaCode || !supplierId || !shade || !qty || !processId) {
      return json({ ok: false, error: "Missing required params" }, { status: 400 });
    }
    const data = await stock.withdraw({
      fromMmaCode,
      supplierId,
      shade,
      size,
      qty,
      processId
    });
    return json({ ok: true, data });
  } catch (err) {
    return json({ ok: false, error: err.message }, { status: 500 });
  }
}

export { POST };
//# sourceMappingURL=_server-D3EVWerH.js.map
