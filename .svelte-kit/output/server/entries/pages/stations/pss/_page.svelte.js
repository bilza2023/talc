import { c as create_ssr_component, v as validate_component } from "../../../../chunks/ssr.js";
import { C as Card } from "../../../../chunks/Card.js";
import { H as H1 } from "../../../../chunks/H1.js";
const css = {
  code: "body{background:var(--backgroundColor);color:var(--primaryText)}.stack.svelte-1e1ca3a{display:flex;flex-direction:column;align-items:center;gap:2rem;margin-top:2rem}.card{flex:0 1 120px;max-width:140px;min-height:90px;text-align:center}",
  map: `{"version":3,"file":"+page.svelte","sources":["+page.svelte"],"sourcesContent":["<script>\\n  import Card from '$lib/components/Card.svelte';\\n  import H1 from '$lib/components/H1.svelte';\\n  export let data;\\n\\n  const stationCode = data.stationCode ?? 'PSS';\\n  const stationName = data.stationName ?? 'Peshawar (PSS)';\\n\\n  // PSS hard-coded MMAs (no loops)\\n  const MMA1 = { code: 'PSS_SCREENED', label: 'Screened' };\\n  const MMA2 = { code: 'PSS_SORTED',   label: 'Sorted'   };\\n<\/script>\\n\\n<br/>\\n\\n<H1 text=\\"PSS\\" size=\\"2rem\\" />\\n\\n<section style=\\"margin-top:1rem;\\">\\n\\n  <!-- No loops: three explicit cards -->\\n  <div class=\\"stack\\">\\n    <Card href=\\"/stations/pss/receive_abs_screened\\" icon=\\"📥\\" label=\\"Receive\\" />\\n    <Card href=\\"/stations/pss/pss_screened\\"         icon=\\"📦\\" label=\\"Screened\\" />\\n    <Card href=\\"/stations/pss/pss_sorted\\"           icon=\\"📦\\" label=\\"Sorted\\" />\\n  </div>\\n</section>\\n\\n<style>\\n  :global(body) {\\n    background: var(--backgroundColor);\\n    color: var(--primaryText);\\n  }\\n\\n  /* stacked layout */\\n  .stack {\\n    display: flex;\\n    flex-direction: column;\\n    align-items: center;\\n    gap: 2rem;              /* space between icons */\\n    margin-top: 2rem;\\n  }\\n\\n\\n\\n  /* FLEX version of actions container */\\n  .actions-flex {\\n    display: flex;\\n    flex-wrap: wrap;\\n    justify-content: center;\\n    gap: 0.75rem;\\n    padding: 0 0.5rem;\\n  }\\n\\n  /* Ensure each Card stays compact and centered */\\n  :global(.card) {\\n    flex: 0 1 120px;\\n    max-width: 140px;\\n    min-height: 90px;\\n    text-align: center;\\n  }\\n</style>\\n"],"names":[],"mappings":"AA4BU,IAAM,CACZ,UAAU,CAAE,IAAI,iBAAiB,CAAC,CAClC,KAAK,CAAE,IAAI,aAAa,CAC1B,CAGA,qBAAO,CACL,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,WAAW,CAAE,MAAM,CACnB,GAAG,CAAE,IAAI,CACT,UAAU,CAAE,IACd,CAcQ,KAAO,CACb,IAAI,CAAE,CAAC,CAAC,CAAC,CAAC,KAAK,CACf,SAAS,CAAE,KAAK,CAChB,UAAU,CAAE,IAAI,CAChB,UAAU,CAAE,MACd"}`
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  data.stationCode ?? "PSS";
  data.stationName ?? "Peshawar (PSS)";
  if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
  $$result.css.add(css);
  return `<br> ${validate_component(H1, "H1").$$render($$result, { text: "PSS", size: "2rem" }, {}, {})} <section style="margin-top:1rem;"> <div class="stack svelte-1e1ca3a">${validate_component(Card, "Card").$$render(
    $$result,
    {
      href: "/stations/pss/receive_abs_screened",
      icon: "📥",
      label: "Receive"
    },
    {},
    {}
  )} ${validate_component(Card, "Card").$$render(
    $$result,
    {
      href: "/stations/pss/pss_screened",
      icon: "📦",
      label: "Screened"
    },
    {},
    {}
  )} ${validate_component(Card, "Card").$$render(
    $$result,
    {
      href: "/stations/pss/pss_sorted",
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
