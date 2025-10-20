import { p as prisma } from './stockEngine-jmqVw6zN.js';
import '@prisma/client';
import 'crypto';

const load = async () => {
  const totalOnHand = await prisma.stockLedger.aggregate({ _sum: { qtyDelta: true } });
  const settledIds = await prisma.stockTransport.findMany({
    where: { type: { in: ["RECEIVE", "CANCEL"] } },
    select: { transportId: true }
  });
  const inTransitCount = await prisma.stockTransport.count({
    where: { type: "DISPATCH", transportId: { notIn: settledIds.map((x) => x.transportId) } }
  });
  const purchases = await prisma.stockLedger.aggregate({
    _sum: { qtyDelta: true },
    where: { reason: "DIRECT" }
  });
  let avgWastage = 0;
  try {
    const ag = await prisma.screening_tbl.aggregate({ _avg: { wastage: true } });
    avgWastage = Number(ag._avg.wastage ?? 0);
  } catch {
    avgWastage = 0;
  }
  const slotRows = await prisma.stockLedger.groupBy({
    by: ["mmaCode"],
    _sum: { qtyDelta: true },
    orderBy: { _sum: { qtyDelta: "desc" } },
    take: 10
  });
  return {
    kpis: [
      { label: "On-Hand", value: `${Number(totalOnHand._sum.qtyDelta ?? 0).toFixed(1)} t`, icon: "📦" },
      { label: "In-Transit", value: `${inTransitCount}`, icon: "🚛" },
      { label: "Purchases", value: `${Number(purchases._sum.qtyDelta ?? 0).toFixed(1)} t`, icon: "🧾" },
      { label: "Avg Wastage", value: `${avgWastage.toFixed(1)}%`, icon: "⚙️" }
    ],
    slots: slotRows.map((r) => ({
      mmaCode: r.mmaCode,
      qty: Number(r._sum.qtyDelta ?? 0)
      // keep numeric for table sorting
    }))
  };
};

var _page_server = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 11;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-pcM0Iyq3.js')).default;
const server_id = "src/routes/reports/+page.server.js";
const imports = ["_app/immutable/nodes/11.CVr7IIGM.js","_app/immutable/chunks/BCQUcm9Y.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/L2kH7WuS.js","_app/immutable/chunks/D4gjX95n.js","_app/immutable/chunks/CCnCa0Il.js"];
const stylesheets = ["_app/immutable/assets/SmartTable.C-wTpi7Y.css"];
const fonts = [];

export { component, fonts, imports, index, _page_server as server, server_id, stylesheets };
//# sourceMappingURL=11-B_uHkl4B.js.map
