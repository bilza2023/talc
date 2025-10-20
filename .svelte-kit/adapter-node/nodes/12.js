import * as server from '../entries/pages/reports/in-transit/_page.server.js';

export const index = 12;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/reports/in-transit/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/reports/in-transit/+page.server.js";
export const imports = ["_app/immutable/nodes/12.DAJKABzC.js","_app/immutable/chunks/BCQUcm9Y.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/CQr1oRp8.js","_app/immutable/chunks/D4gjX95n.js"];
export const stylesheets = ["_app/immutable/assets/ListTable.BYIQk9lN.css","_app/immutable/assets/12.Byzt6yPk.css","_app/immutable/assets/tokens.soP3Z-cK.css"];
export const fonts = [];
