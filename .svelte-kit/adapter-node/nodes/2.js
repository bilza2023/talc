

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/reports/_layout.svelte.js')).default;
export const imports = ["_app/immutable/nodes/2.K1HFEffJ.js","_app/immutable/chunks/BCQUcm9Y.js","_app/immutable/chunks/IHki7fMi.js"];
export const stylesheets = ["_app/immutable/assets/2.9TZrNYny.css"];
export const fonts = [];
