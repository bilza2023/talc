const load = async ({ url }) => {
  return {
    stationCode: "PSS",
    stationName: "Peshawar (PSS)",
    fromUrl: Object.fromEntries(url.searchParams.entries())
  };
};

var _layout_server = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 6;
let component_cache;
const component = async () => component_cache ??= (await import('./layout.svelte-Cye_K3ii.js')).default;
const server_id = "src/routes/stations/pss/+layout.server.js";
const imports = ["_app/immutable/nodes/6.GUTSrxyQ.js","_app/immutable/chunks/DxWQ_7jq.js","_app/immutable/chunks/BCQUcm9Y.js","_app/immutable/chunks/IHki7fMi.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _layout_server as server, server_id, stylesheets };
//# sourceMappingURL=6-Bp6xx15p.js.map
