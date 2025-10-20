const load = async ({ url }) => {
  return {
    stationCode: "KEF",
    stationName: "Karachi Export Facility",
    fromUrl: Object.fromEntries(url.searchParams.entries())
  };
};

var _layout_server = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 5;
let component_cache;
const component = async () => component_cache ??= (await import('./layout.svelte-Cye_K3ii.js')).default;
const server_id = "src/routes/stations/kef/+layout.server.js";
const imports = ["_app/immutable/nodes/5.GUTSrxyQ.js","_app/immutable/chunks/DxWQ_7jq.js","_app/immutable/chunks/BCQUcm9Y.js","_app/immutable/chunks/IHki7fMi.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _layout_server as server, server_id, stylesheets };
//# sourceMappingURL=5-BjOffL7v.js.map
