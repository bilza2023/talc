import { p as prisma } from './stockEngine-jmqVw6zN.js';
import '@prisma/client';
import 'crypto';

async function load() {
  const rows = await prisma.purchase_tbl.findMany({
    include: { supplier: { select: { id: true, name: true, code: true } } },
    orderBy: [
      { docDate: "asc" },
      { supplier: { name: "asc" } },
      { toMmaCode: "asc" },
      { createdAt: "asc" }
    ]
  });
  const items = rows.map((r) => ({
    id: r.id,
    // cuid (unique rowKey)
    docDate: r.docDate ? r.docDate.toISOString() : null,
    // ISO for kind:'date'
    supplierName: r.supplier?.name || r.supplier?.code || String(r.supplierId),
    toMmaCode: r.toMmaCode,
    // e.g., ABS_RAW
    shade: String(r.shade),
    size: String(r.size),
    quantity: Number(r.quantity),
    // commercials (numbers or null)
    ratePerMt: r.ratePerMt ?? null,
    freightPerMt: r.freightPerMt ?? null,
    supplierFreight: r.supplierFreight ?? null,
    roadExp: r.roadExp ?? null,
    cashPaid: r.cashPaid ?? null,
    // light text
    paymentMode: r.paymentMode ?? "",
    remarks: r.remarks ?? ""
  }));
  return {
    title: "Supplier Ledger",
    items
  };
}

var _page_server = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 21;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-DMJIyT-M.js')).default;
const server_id = "src/routes/reports/supplier_ledger/+page.server.js";
const imports = ["_app/immutable/nodes/21.CPwBIc32.js","_app/immutable/chunks/BCQUcm9Y.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/CQr1oRp8.js","_app/immutable/chunks/D4gjX95n.js","_app/immutable/chunks/B8JI30u4.js"];
const stylesheets = ["_app/immutable/assets/ListTable.BYIQk9lN.css","_app/immutable/assets/H1.BAUvzhtN.css","_app/immutable/assets/21.BGevb8oL.css"];
const fonts = [];

export { component, fonts, imports, index, _page_server as server, server_id, stylesheets };
//# sourceMappingURL=21-DYxXnQ_M.js.map
