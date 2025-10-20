import * as server from '../entries/pages/reports/_page.server.js';

export const index = 11;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/reports/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/reports/+page.server.js";
export const imports = ["_app/immutable/nodes/11.CVr7IIGM.js","_app/immutable/chunks/BCQUcm9Y.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/L2kH7WuS.js","_app/immutable/chunks/D4gjX95n.js","_app/immutable/chunks/CCnCa0Il.js"];
export const stylesheets = ["_app/immutable/assets/SmartTable.C-wTpi7Y.css"];
export const fonts = [];
