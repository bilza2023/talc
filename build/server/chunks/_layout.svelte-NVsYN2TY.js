import { c as create_ssr_component } from './ssr-YOuSP3iu.js';

const css = {
  code: ".reports-layout.svelte-mnogp1{background:var(--backgroundColor, #0b0b0c);color:var(--primaryText, #e9e9ea);min-height:100vh}",
  map: '{"version":3,"file":"+layout.svelte","sources":["+layout.svelte"],"sourcesContent":["<script>\\n    export let data;\\n  <\/script>\\n  \\n  <div class=\\"reports-layout\\">\\n    <slot />\\n  </div>\\n  \\n  <style>\\n    .reports-layout {\\n      background: var(--backgroundColor, #0b0b0c);\\n      color: var(--primaryText, #e9e9ea);\\n      min-height: 100vh;\\n    }\\n  </style>\\n  "],"names":[],"mappings":"AASI,6BAAgB,CACd,UAAU,CAAE,IAAI,iBAAiB,CAAC,QAAQ,CAAC,CAC3C,KAAK,CAAE,IAAI,aAAa,CAAC,QAAQ,CAAC,CAClC,UAAU,CAAE,KACd"}'
};
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
  $$result.css.add(css);
  return `<div class="reports-layout svelte-mnogp1">${slots.default ? slots.default({}) : ``} </div>`;
});

export { Layout as default };
//# sourceMappingURL=_layout.svelte-NVsYN2TY.js.map
