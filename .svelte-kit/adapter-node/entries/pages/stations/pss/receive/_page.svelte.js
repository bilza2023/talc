import { c as create_ssr_component, v as validate_component } from "../../../../../chunks/ssr.js";
import { R as ReceiveTopLoop } from "../../../../../chunks/ReceiveTopLoop.js";
const css = {
  code: ".page.svelte-1ahwd9q{max-width:1100px;margin-inline:auto;padding:var(--spaceMd, 16px);display:grid;gap:var(--spaceMd, 16px)}",
  map: `{"version":3,"file":"+page.svelte","sources":["+page.svelte"],"sourcesContent":["<script>\\n  // Minimal page: no global CSS imports; tokens/forms already loaded app-wide.\\n  import ReceiveTopLoop from '$lib/components/ReceiveTopLoop.svelte';\\n\\n  export let data;\\n  const lanes = data?.lanes ?? [];\\n  const rows  = data?.rows  ?? [];\\n<\/script>\\n\\n<section class=\\"page\\">\\n  <ReceiveTopLoop {lanes} {rows} />\\n</section>\\n\\n<style>\\n  .page {\\n    max-width: 1100px;\\n    margin-inline: auto;\\n    padding: var(--spaceMd, 16px);\\n    display: grid;\\n    gap: var(--spaceMd, 16px);\\n  }\\n</style>\\n"],"names":[],"mappings":"AAcE,oBAAM,CACJ,SAAS,CAAE,MAAM,CACjB,aAAa,CAAE,IAAI,CACnB,OAAO,CAAE,IAAI,SAAS,CAAC,KAAK,CAAC,CAC7B,OAAO,CAAE,IAAI,CACb,GAAG,CAAE,IAAI,SAAS,CAAC,KAAK,CAC1B"}`
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  const lanes = data?.lanes ?? [];
  const rows = data?.rows ?? [];
  if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
  $$result.css.add(css);
  return `<section class="page svelte-1ahwd9q">${validate_component(ReceiveTopLoop, "ReceiveTopLoop").$$render($$result, { lanes, rows }, {}, {})} </section>`;
});
export {
  Page as default
};
