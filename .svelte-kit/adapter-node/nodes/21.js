import * as server from '../entries/pages/reports/supplier_ledger/_page.server.js';

export const index = 21;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/reports/supplier_ledger/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/reports/supplier_ledger/+page.server.js";
export const imports = ["_app/immutable/nodes/21.CPwBIc32.js","_app/immutable/chunks/BCQUcm9Y.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/CQr1oRp8.js","_app/immutable/chunks/D4gjX95n.js","_app/immutable/chunks/B8JI30u4.js"];
export const stylesheets = ["_app/immutable/assets/ListTable.BYIQk9lN.css","_app/immutable/assets/H1.BAUvzhtN.css","_app/immutable/assets/21.BGevb8oL.css"];
export const fonts = [];
