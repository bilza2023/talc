import * as server from '../entries/pages/stations/kef/_layout.server.js';

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/layout.svelte.js')).default;
export { server };
export const server_id = "src/routes/stations/kef/+layout.server.js";
export const imports = ["_app/immutable/nodes/5.GUTSrxyQ.js","_app/immutable/chunks/DxWQ_7jq.js","_app/immutable/chunks/BCQUcm9Y.js","_app/immutable/chunks/IHki7fMi.js"];
export const stylesheets = [];
export const fonts = [];
