import { c as create_ssr_component, v as validate_component } from "../../../../chunks/ssr.js";
import { C as Card } from "../../../../chunks/Card.js";
import { H as H1 } from "../../../../chunks/H1.js";
const css = {
  code: "body{background:var(--backgroundColor);color:var(--primaryText)}.stack.svelte-d4xzb6{display:flex;flex-direction:column;align-items:center;gap:2rem;margin-top:2rem}.card{width:100%;max-width:140px;min-height:90px;text-align:center}",
  map: `{"version":3,"file":"+page.svelte","sources":["+page.svelte"],"sourcesContent":["<script>\\n  import Card from '$lib/components/Card.svelte';\\n  import H1 from '$lib/components/H1.svelte';\\n  export let data;\\n\\n  const stationCode = data.stationCode ?? 'KEF';\\n  const stationName = data.stationName ?? 'Karachi Export Facility';\\n\\n  // Hard-coded single MMA\\n  const MMA1 = { code: 'KEF_SORTED', label: 'Sorted' };\\n<\/script>\\n\\n<H1 text=\\"KEF\\" size=\\"2rem\\" />\\n\\n\\n<section style=\\"margin-top:1rem;\\">\\n\\n  <!-- No loops: two explicit cards -->\\n  <div class=\\"stack\\">\\n    <Card href=\\"/stations/kef/receive\\" icon=\\"📥\\" label=\\"Receive\\" />\\n    <Card href=\\"/stations/kef/kef_sorted\\"         icon=\\"📦\\" label=\\"Sorted\\" />\\n  </div>\\n</section>\\n\\n<style>\\n  :global(body) {\\n    background: var(--backgroundColor);\\n    color: var(--primaryText);\\n  }\\n\\n  /* stacked layout */\\n  .stack {\\n    display: flex;\\n    flex-direction: column;\\n    align-items: center;\\n    gap: 2rem;              /* space between icons */\\n    margin-top: 2rem;\\n  }\\n\\n  :global(.card) {\\n    width: 100%;\\n    max-width: 140px;\\n    min-height: 90px;\\n    text-align: center;\\n  }\\n</style>\\n"],"names":[],"mappings":"AAyBU,IAAM,CACZ,UAAU,CAAE,IAAI,iBAAiB,CAAC,CAClC,KAAK,CAAE,IAAI,aAAa,CAC1B,CAGA,oBAAO,CACL,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,WAAW,CAAE,MAAM,CACnB,GAAG,CAAE,IAAI,CACT,UAAU,CAAE,IACd,CAEQ,KAAO,CACb,KAAK,CAAE,IAAI,CACX,SAAS,CAAE,KAAK,CAChB,UAAU,CAAE,IAAI,CAChB,UAAU,CAAE,MACd"}`
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  data.stationCode ?? "KEF";
  data.stationName ?? "Karachi Export Facility";
  if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
  $$result.css.add(css);
  return `${validate_component(H1, "H1").$$render($$result, { text: "KEF", size: "2rem" }, {}, {})} <section style="margin-top:1rem;"> <div class="stack svelte-d4xzb6">${validate_component(Card, "Card").$$render(
    $$result,
    {
      href: "/stations/kef/receive",
      icon: "📥",
      label: "Receive"
    },
    {},
    {}
  )} ${validate_component(Card, "Card").$$render(
    $$result,
    {
      href: "/stations/kef/kef_sorted",
      icon: "📦",
      label: "Sorted"
    },
    {},
    {}
  )}</div> </section>`;
});
export {
  Page as default
};
