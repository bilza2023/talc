const load = async ({ url }) => {
  return {
    stationCode: "ABS",
    stationName: "Abbottabad (ABS)",
    fromUrl: Object.fromEntries(url.searchParams.entries())
  };
};

var _layout_server = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 4;
let component_cache;
const component = async () => component_cache ??= (await import('./layout.svelte-Cye_K3ii.js')).default;
const server_id = "src/routes/stations/abs/+layout.server.js";
const imports = ["_app/immutable/nodes/4.GUTSrxyQ.js","_app/immutable/chunks/DxWQ_7jq.js","_app/immutable/chunks/BCQUcm9Y.js","_app/immutable/chunks/IHki7fMi.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _layout_server as server, server_id, stylesheets };
//# sourceMappingURL=4-dGd2r4l3.js.map
