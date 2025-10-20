import * as server from '../entries/pages/procurement/_page.server.js';

export const index = 10;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/procurement/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/procurement/+page.server.js";
export const imports = ["_app/immutable/nodes/10.CNhhB61d.js","_app/immutable/chunks/BCQUcm9Y.js","_app/immutable/chunks/D4gjX95n.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/B8JI30u4.js"];
export const stylesheets = ["_app/immutable/assets/H1.BAUvzhtN.css","_app/immutable/assets/10.CfrbyOyf.css"];
export const fonts = [];
