import * as server from '../entries/pages/stations/kef/receive/_page.server.js';

export const index = 31;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/stations/kef/receive/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/stations/kef/receive/+page.server.js";
export const imports = ["_app/immutable/nodes/31.BhKtUUd_.js","_app/immutable/chunks/BCQUcm9Y.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/_-nIq06z.js","_app/immutable/chunks/D4gjX95n.js"];
export const stylesheets = ["_app/immutable/assets/ReceiveTopLoop.B2MIk1yS.css","_app/immutable/assets/31.CMPRkU-U.css","_app/immutable/assets/tokens.soP3Z-cK.css"];
export const fonts = [];
