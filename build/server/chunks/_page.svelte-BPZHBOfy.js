import { c as create_ssr_component, v as validate_component } from './ssr-YOuSP3iu.js';
import { R as ReceiveTopLoop } from './ReceiveTopLoop-BeUbJsvB.js';

const css = {
  code: ".page-title.svelte-9kre9b{margin:0 0 var(--spaceMd, 16px) 0;color:var(--primaryText, #e6ebf1);font-size:clamp(18px, 3.4vw, 24px);font-weight:650;line-height:1.25}",
  map: `{"version":3,"file":"+page.svelte","sources":["+page.svelte"],"sourcesContent":["<script>\\n  import '$lib/styles/tokens.css';\\n  import ReceiveTopLoop from '$lib/components/ReceiveTopLoop.svelte';\\n  export let data;\\n\\n  const lanes = data?.lanes ?? [];\\n  const rows  = data?.rows ?? [];\\n<\/script>\\n\\n<h1 class=\\"page-title\\">KEF — Receive</h1>\\n\\n<ReceiveTopLoop {lanes} {rows} />\\n\\n<style>\\n  .page-title {\\n    margin: 0 0 var(--spaceMd, 16px) 0;\\n    color: var(--primaryText, #e6ebf1);\\n    font-size: clamp(18px, 3.4vw, 24px);\\n    font-weight: 650;\\n    line-height: 1.25;\\n  }\\n</style>\\n"],"names":[],"mappings":"AAcE,yBAAY,CACV,MAAM,CAAE,CAAC,CAAC,CAAC,CAAC,IAAI,SAAS,CAAC,KAAK,CAAC,CAAC,CAAC,CAClC,KAAK,CAAE,IAAI,aAAa,CAAC,QAAQ,CAAC,CAClC,SAAS,CAAE,MAAM,IAAI,CAAC,CAAC,KAAK,CAAC,CAAC,IAAI,CAAC,CACnC,WAAW,CAAE,GAAG,CAChB,WAAW,CAAE,IACf"}`
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  const lanes = data?.lanes ?? [];
  const rows = data?.rows ?? [];
  if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
  $$result.css.add(css);
  return `<h1 class="page-title svelte-9kre9b" data-svelte-h="svelte-1bh24h4">KEF — Receive</h1> ${validate_component(ReceiveTopLoop, "ReceiveTopLoop").$$render($$result, { lanes, rows }, {}, {})}`;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-BPZHBOfy.js.map
