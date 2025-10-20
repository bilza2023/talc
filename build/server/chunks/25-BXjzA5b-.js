async function load({ fetch }) {
  const mmaCode = "ABS_RAW";
  const positiveOnly = true;
  const res = await fetch(`/api/slots?mmaCode=${encodeURIComponent(mmaCode)}&positiveOnly=1`);
  const j = await res.json().catch(() => ({ ok: false, data: [] }));
  return {
    mmaCode,
    positiveOnly,
    slots: j.ok ? j.data : []
  };
}

var _page_server = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 25;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-BbFSWpHs.js')).default;
const server_id = "src/routes/stations/abs/abs_unscreened_raw/+page.server.js";
const imports = ["_app/immutable/nodes/25.DtBoJQ1V.js","_app/immutable/chunks/BCQUcm9Y.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/By1AYhr7.js","_app/immutable/chunks/D4gjX95n.js"];
const stylesheets = ["_app/immutable/assets/Slots.5f4pxOMV.css"];
const fonts = [];

export { component, fonts, imports, index, _page_server as server, server_id, stylesheets };
//# sourceMappingURL=25-BXjzA5b-.js.map
