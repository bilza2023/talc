import * as server from '../entries/pages/stations/pss/dispatch_kef_sorted/_page.server.js';

export const index = 33;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/stations/pss/dispatch_kef_sorted/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/stations/pss/dispatch_kef_sorted/+page.server.js";
export const imports = ["_app/immutable/nodes/33.D9cTVrQz.js","_app/immutable/chunks/BCQUcm9Y.js","_app/immutable/chunks/CgU5AtxT.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/CBAbiM5a.js"];
export const stylesheets = ["_app/immutable/assets/Dispatch.DLogtm1j.css"];
export const fonts = [];
