import * as server from '../entries/pages/suppliers/_page.server.js';

export const index = 38;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/suppliers/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/suppliers/+page.server.js";
export const imports = ["_app/immutable/nodes/38.CBZXNUu3.js","_app/immutable/chunks/BCQUcm9Y.js","_app/immutable/chunks/D4gjX95n.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/B8JI30u4.js"];
export const stylesheets = ["_app/immutable/assets/H1.BAUvzhtN.css","_app/immutable/assets/38.BT553QCA.css"];
export const fonts = [];
