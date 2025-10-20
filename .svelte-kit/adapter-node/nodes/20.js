import * as server from '../entries/pages/reports/stock/_page.server.js';

export const index = 20;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/reports/stock/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/reports/stock/+page.server.js";
export const imports = ["_app/immutable/nodes/20.CXW7qXDG.js","_app/immutable/chunks/BCQUcm9Y.js","_app/immutable/chunks/D4gjX95n.js","_app/immutable/chunks/IHki7fMi.js"];
export const stylesheets = ["_app/immutable/assets/20.DFlyf0vl.css"];
export const fonts = [];
