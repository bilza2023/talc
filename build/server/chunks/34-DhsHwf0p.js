async function load({ fetch }) {
  const mmaCode = "PSS_SCREENED";
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

const index = 34;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-DntLxK8_.js')).default;
const server_id = "src/routes/stations/pss/pss_screened/+page.server.js";
const imports = ["_app/immutable/nodes/34.BWA-FGDn.js","_app/immutable/chunks/BCQUcm9Y.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/By1AYhr7.js","_app/immutable/chunks/D4gjX95n.js"];
const stylesheets = ["_app/immutable/assets/Slots.5f4pxOMV.css"];
const fonts = [];

export { component, fonts, imports, index, _page_server as server, server_id, stylesheets };
//# sourceMappingURL=34-DhsHwf0p.js.map
