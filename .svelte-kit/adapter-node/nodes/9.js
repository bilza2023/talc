

export const index = 9;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/mines/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/9.Nby2LeFe.js","_app/immutable/chunks/BCQUcm9Y.js","_app/immutable/chunks/IHki7fMi.js"];
export const stylesheets = [];
export const fonts = [];
