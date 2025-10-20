import { s as stock, p as prisma } from './stockEngine-jmqVw6zN.js';
import '@prisma/client';
import 'crypto';

const MMA_CODES = [
  "ABS_RAW",
  "ABS_SCREENED",
  "PSS_SCREENED",
  "PSS_SORTED",
  "KEF_SORTED"
];
async function load() {
  const perMma = await Promise.all(
    MMA_CODES.map(async (mmaCode) => {
      const rows = await stock.slots({ mmaCode, positiveOnly: true });
      return rows;
    })
  );
  const itemsRaw = perMma.flat();
  const supplierIds = Array.from(new Set(itemsRaw.map((r) => Number(r.supplierId)).filter(Boolean)));
  const suppliers = supplierIds.length ? await prisma.supplier.findMany({
    where: { id: { in: supplierIds } },
    select: { id: true, name: true, code: true }
  }) : [];
  const supplierMap = new Map(suppliers.map((s) => [Number(s.id), String(s.name || s.code || s.id)]));
  const items = itemsRaw.map((r) => ({
    id: `${r.mmaCode}::${r.supplierId}::${r.shade}::${r.size}`,
    mmaCode: r.mmaCode,
    supplierId: Number(r.supplierId),
    supplierName: supplierMap.get(Number(r.supplierId)) || `#${r.supplierId}`,
    shade: String(r.shade),
    size: String(r.size),
    qty: Number(r.qty)
  })).sort(
    (a, b) => a.mmaCode.localeCompare(b.mmaCode) || b.qty - a.qty || a.supplierName.localeCompare(b.supplierName)
  );
  return {
    title: "Stock — Slots by MMA",
    items
  };
}

var _page_server = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 18;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-BjqRxeFV.js')).default;
const server_id = "src/routes/reports/slot/+page.server.js";
const imports = ["_app/immutable/nodes/18.DMwXVUA9.js","_app/immutable/chunks/BCQUcm9Y.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/CQr1oRp8.js","_app/immutable/chunks/D4gjX95n.js"];
const stylesheets = ["_app/immutable/assets/ListTable.BYIQk9lN.css","_app/immutable/assets/18.DogMAnDB.css","_app/immutable/assets/tokens.soP3Z-cK.css"];
const fonts = [];

export { component, fonts, imports, index, _page_server as server, server_id, stylesheets };
//# sourceMappingURL=18-C_e48wII.js.map
