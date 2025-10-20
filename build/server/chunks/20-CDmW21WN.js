import { s as stock } from './stockEngine-jmqVw6zN.js';
import '@prisma/client';
import 'crypto';

const MMA_CODES = [
  "ABS_RAW",
  "ABS_SCREENED",
  "PSS_SCREENED",
  "PSS_SORTED",
  "KEF_SORTED"
];
const MMA_TO_CATEGORY = {
  ABS_RAW: "Unscreened",
  ABS_SCREENED: "Screened",
  PSS_SCREENED: "Screened",
  PSS_SORTED: "Sorted",
  KEF_SORTED: "Sorted"
};
const COLUMNS = ["Unscreened", "Screened", "Sorted", "Product"];
const load = async () => {
  const rows = [];
  for (const mmaCode of MMA_CODES) {
    const onhand = await stock.onHand({ mmaCode });
    const qty = typeof onhand === "number" ? onhand : Number(onhand?.qty ?? 0);
    const cat = MMA_TO_CATEGORY[mmaCode];
    const row = { mmaCode, Unscreened: 0, Screened: 0, Sorted: 0, Product: 0 };
    row[cat] = qty;
    rows.push(row);
  }
  return {
    title: "MMA Stock Totals",
    columns: COLUMNS,
    rows
  };
};

var _page_server = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 20;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-DgnsJD1L.js')).default;
const server_id = "src/routes/reports/stock/+page.server.js";
const imports = ["_app/immutable/nodes/20.CXW7qXDG.js","_app/immutable/chunks/BCQUcm9Y.js","_app/immutable/chunks/D4gjX95n.js","_app/immutable/chunks/IHki7fMi.js"];
const stylesheets = ["_app/immutable/assets/20.DFlyf0vl.css"];
const fonts = [];

export { component, fonts, imports, index, _page_server as server, server_id, stylesheets };
//# sourceMappingURL=20-CDmW21WN.js.map
