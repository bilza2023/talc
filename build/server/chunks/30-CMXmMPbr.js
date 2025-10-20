async function load({ fetch }) {
  const mmaCode = "KEF_SORTED";
  const res = await fetch(`/api/slots?mmaCode=${encodeURIComponent(mmaCode)}&positiveOnly=1`);
  const j = await res.json().catch(() => ({ ok: false, data: [] }));
  return {
    mmaCode,
    positiveOnly: true,
    slots: j.ok ? j.data : []
  };
}

var _page_server = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 30;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-B2a7xygj.js')).default;
const server_id = "src/routes/stations/kef/kef_sorted/+page.server.js";
const imports = ["_app/immutable/nodes/30.BHNCx4zp.js","_app/immutable/chunks/BCQUcm9Y.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/By1AYhr7.js","_app/immutable/chunks/D4gjX95n.js"];
const stylesheets = ["_app/immutable/assets/Slots.5f4pxOMV.css"];
const fonts = [];

export { component, fonts, imports, index, _page_server as server, server_id, stylesheets };
//# sourceMappingURL=30-CMXmMPbr.js.map
