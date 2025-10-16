import { c as create_ssr_component, a as add_attribute, b as escape, v as validate_component } from "../../../../chunks/ssr.js";
import { H as H1 } from "../../../../chunks/H1.js";
const css$1 = {
  code: ".card.svelte-1p0jse1{display:flex;flex-direction:column;align-items:center;justify-content:center;width:clamp(84px, 28vw, 112px);aspect-ratio:1 / 1;padding:var(--spaceSm, 10px);border:1px solid var(--borderColor, #2b3a36);border-radius:var(--radiusXl, 16px);background:color-mix(\n      in srgb,\n      var(--surfaceColor, #0f1a16) 70%,\n      transparent\n    );color:var(--primaryText, #e6ebf1);text-decoration:none;box-shadow:var(--shadowSm, 0 2px 8px rgba(0, 0, 0, 0.2));transition:transform 0.12s ease,\n      box-shadow 0.12s ease,\n      background 0.12s ease,\n      border-color 0.12s ease;-webkit-user-select:none;-moz-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent}.card.svelte-1p0jse1:hover{transform:translateY(-1px);box-shadow:var(--shadowMd, 0 6px 14px rgba(0, 0, 0, 0.25))}.card.svelte-1p0jse1:active{transform:translateY(0);box-shadow:var(--shadowSm, 0 2px 8px rgba(0, 0, 0, 0.2));background:color-mix(\n      in srgb,\n      var(--surfaceColor, #0f1a16) 85%,\n      transparent\n    )}.card.svelte-1p0jse1:focus-visible{outline:2px solid var(--focusColor, #66afe9);outline-offset:3px}.icon.svelte-1p0jse1{font-size:clamp(2.1rem, 8.5vw, 3rem);line-height:1;margin-bottom:var(--spaceXs, 6px);filter:drop-shadow(0 1px 0 rgba(0, 0, 0, 0.2))}.label.svelte-1p0jse1{font-size:clamp(1rem, 3vw, 0.95rem);text-align:center;color:var(--primaryColor, #0969da);font-weight:600;letter-spacing:0.2px}",
  map: '{"version":3,"file":"ImgCard.svelte","sources":["ImgCard.svelte"],"sourcesContent":["<script>\\n  export let icon = \\"⬤\\";\\n  export let label = \\"\\";\\n  export let href = \\"#\\";\\n<\/script>\\n\\n<a {href} class=\\"card\\" aria-label={label}>\\n  <div class=\\"icon\\" aria-hidden=\\"true\\">{icon}</div>\\n  <div class=\\"label\\">{label}</div>\\n</a>\\n\\n<style>\\n  .card {\\n    display: flex;\\n    flex-direction: column;\\n    align-items: center;\\n    justify-content: center;\\n\\n    width: clamp(84px, 28vw, 112px);\\n    aspect-ratio: 1 / 1;\\n\\n    padding: var(--spaceSm, 10px);\\n    border: 1px solid var(--borderColor, #2b3a36);\\n    border-radius: var(--radiusXl, 16px);\\n    background: color-mix(\\n      in srgb,\\n      var(--surfaceColor, #0f1a16) 70%,\\n      transparent\\n    );\\n    color: var(--primaryText, #e6ebf1);\\n    text-decoration: none;\\n    box-shadow: var(--shadowSm, 0 2px 8px rgba(0, 0, 0, 0.2));\\n\\n    transition:\\n      transform 0.12s ease,\\n      box-shadow 0.12s ease,\\n      background 0.12s ease,\\n      border-color 0.12s ease;\\n    -webkit-user-select: none;\\n       -moz-user-select: none;\\n            user-select: none;\\n    -webkit-tap-highlight-color: transparent;\\n  }\\n  .card:hover {\\n    transform: translateY(-1px);\\n    box-shadow: var(--shadowMd, 0 6px 14px rgba(0, 0, 0, 0.25));\\n  }\\n  .card:active {\\n    transform: translateY(0);\\n    box-shadow: var(--shadowSm, 0 2px 8px rgba(0, 0, 0, 0.2));\\n    background: color-mix(\\n      in srgb,\\n      var(--surfaceColor, #0f1a16) 85%,\\n      transparent\\n    );\\n  }\\n  .card:focus-visible {\\n    outline: 2px solid var(--focusColor, #66afe9);\\n    outline-offset: 3px;\\n  }\\n\\n  /* Bigger icon */\\n  .icon {\\n    font-size: clamp(2.1rem, 8.5vw, 3rem);\\n    line-height: 1;\\n    margin-bottom: var(--spaceXs, 6px);\\n    filter: drop-shadow(0 1px 0 rgba(0, 0, 0, 0.2));\\n  }\\n\\n  /* Brighter label using theme accent */\\n  .label {\\n    font-size: clamp(1rem, 3vw, 0.95rem);\\n    text-align: center;\\n    color: var(--primaryColor, #0969da);\\n    font-weight: 600;\\n    letter-spacing: 0.2px;\\n  }\\n</style>\\n"],"names":[],"mappings":"AAYE,oBAAM,CACJ,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,WAAW,CAAE,MAAM,CACnB,eAAe,CAAE,MAAM,CAEvB,KAAK,CAAE,MAAM,IAAI,CAAC,CAAC,IAAI,CAAC,CAAC,KAAK,CAAC,CAC/B,YAAY,CAAE,CAAC,CAAC,CAAC,CAAC,CAAC,CAEnB,OAAO,CAAE,IAAI,SAAS,CAAC,KAAK,CAAC,CAC7B,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,aAAa,CAAC,QAAQ,CAAC,CAC7C,aAAa,CAAE,IAAI,UAAU,CAAC,KAAK,CAAC,CACpC,UAAU,CAAE;AAChB,MAAM,EAAE,CAAC,IAAI;AACb,MAAM,IAAI,cAAc,CAAC,QAAQ,CAAC,CAAC,GAAG;AACtC,MAAM;AACN,KAAK,CACD,KAAK,CAAE,IAAI,aAAa,CAAC,QAAQ,CAAC,CAClC,eAAe,CAAE,IAAI,CACrB,UAAU,CAAE,IAAI,UAAU,CAAC,6BAA6B,CAAC,CAEzD,UAAU,CACR,SAAS,CAAC,KAAK,CAAC,IAAI;AAC1B,MAAM,UAAU,CAAC,KAAK,CAAC,IAAI;AAC3B,MAAM,UAAU,CAAC,KAAK,CAAC,IAAI;AAC3B,MAAM,YAAY,CAAC,KAAK,CAAC,IAAI,CACzB,mBAAmB,CAAE,IAAI,CACtB,gBAAgB,CAAE,IAAI,CACjB,WAAW,CAAE,IAAI,CACzB,2BAA2B,CAAE,WAC/B,CACA,oBAAK,MAAO,CACV,SAAS,CAAE,WAAW,IAAI,CAAC,CAC3B,UAAU,CAAE,IAAI,UAAU,CAAC,+BAA+B,CAC5D,CACA,oBAAK,OAAQ,CACX,SAAS,CAAE,WAAW,CAAC,CAAC,CACxB,UAAU,CAAE,IAAI,UAAU,CAAC,6BAA6B,CAAC,CACzD,UAAU,CAAE;AAChB,MAAM,EAAE,CAAC,IAAI;AACb,MAAM,IAAI,cAAc,CAAC,QAAQ,CAAC,CAAC,GAAG;AACtC,MAAM;AACN,KACE,CACA,oBAAK,cAAe,CAClB,OAAO,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,YAAY,CAAC,QAAQ,CAAC,CAC7C,cAAc,CAAE,GAClB,CAGA,oBAAM,CACJ,SAAS,CAAE,MAAM,MAAM,CAAC,CAAC,KAAK,CAAC,CAAC,IAAI,CAAC,CACrC,WAAW,CAAE,CAAC,CACd,aAAa,CAAE,IAAI,SAAS,CAAC,IAAI,CAAC,CAClC,MAAM,CAAE,YAAY,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAChD,CAGA,qBAAO,CACL,SAAS,CAAE,MAAM,IAAI,CAAC,CAAC,GAAG,CAAC,CAAC,OAAO,CAAC,CACpC,UAAU,CAAE,MAAM,CAClB,KAAK,CAAE,IAAI,cAAc,CAAC,QAAQ,CAAC,CACnC,WAAW,CAAE,GAAG,CAChB,cAAc,CAAE,KAClB"}'
};
const ImgCard = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { icon = "⬤" } = $$props;
  let { label = "" } = $$props;
  let { href = "#" } = $$props;
  if ($$props.icon === void 0 && $$bindings.icon && icon !== void 0) $$bindings.icon(icon);
  if ($$props.label === void 0 && $$bindings.label && label !== void 0) $$bindings.label(label);
  if ($$props.href === void 0 && $$bindings.href && href !== void 0) $$bindings.href(href);
  $$result.css.add(css$1);
  return `<a${add_attribute("href", href, 0)} class="card svelte-1p0jse1"${add_attribute("aria-label", label, 0)}><div class="icon svelte-1p0jse1" aria-hidden="true">${escape(icon)}</div> <div class="label svelte-1p0jse1">${escape(label)}</div> </a>`;
});
const css = {
  code: "body{background:var(--backgroundColor);color:var(--primaryText);margin:0}.stack.svelte-rphtcy{display:flex;flex-direction:column;align-items:center;gap:2rem;margin-top:2rem}.card{width:clamp(160px, 60vw, 220px);aspect-ratio:1 / 1;font-size:1.2rem}.card .icon{font-size:clamp(3rem, 12vw, 4rem)}@media(min-width: 640px){.stack.svelte-rphtcy{gap:3rem;margin-top:3rem}.card{width:240px}}",
  map: `{"version":3,"file":"+page.svelte","sources":["+page.svelte"],"sourcesContent":["<script>\\n  import ImgCard from '$lib/components/ImgCard.svelte';\\n  import H1 from '$lib/components/H1.svelte';\\n  export let data = {};\\n\\n  const stationCode = data.stationCode ?? 'ABS';\\n  const stationName = data.stationName ?? 'Abbottabad';\\n<\/script>\\n\\n<br/>\\n\\n<H1 text=\\"ABS\\" size=\\"2rem\\" />\\n\\n<!-- stacked icons -->\\n<div class=\\"stack\\">\\n  <ImgCard icon=\\"▦\\" label=\\"Screened\\" href=\\"/stations/abs/abs_screened\\" />\\n  <ImgCard icon=\\"⛰️\\" label=\\"Unscreened\\" href=\\"/stations/abs/abs_unscreened_raw\\" />\\n</div>\\n\\n<style>\\n  :global(body) {\\n    background: var(--backgroundColor);\\n    color: var(--primaryText);\\n    margin: 0;\\n  }\\n\\n\\n  /* stacked layout */\\n  .stack {\\n    display: flex;\\n    flex-direction: column;\\n    align-items: center;\\n    gap: 2rem;              /* space between icons */\\n    margin-top: 2rem;\\n  }\\n\\n  /* make the cards bigger */\\n  :global(.card) {\\n    width: clamp(160px, 60vw, 220px);\\n    aspect-ratio: 1 / 1;\\n    font-size: 1.2rem;\\n  }\\n\\n  /* enlarge emoji/icon inside the card */\\n  :global(.card .icon) {\\n    font-size: clamp(3rem, 12vw, 4rem);\\n  }\\n\\n  @media (min-width: 640px) {\\n    .stack {\\n      gap: 3rem;\\n      margin-top: 3rem;\\n    }\\n    :global(.card) {\\n      width: 240px;\\n    }\\n  }\\n</style>\\n"],"names":[],"mappings":"AAoBU,IAAM,CACZ,UAAU,CAAE,IAAI,iBAAiB,CAAC,CAClC,KAAK,CAAE,IAAI,aAAa,CAAC,CACzB,MAAM,CAAE,CACV,CAIA,oBAAO,CACL,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,WAAW,CAAE,MAAM,CACnB,GAAG,CAAE,IAAI,CACT,UAAU,CAAE,IACd,CAGQ,KAAO,CACb,KAAK,CAAE,MAAM,KAAK,CAAC,CAAC,IAAI,CAAC,CAAC,KAAK,CAAC,CAChC,YAAY,CAAE,CAAC,CAAC,CAAC,CAAC,CAAC,CACnB,SAAS,CAAE,MACb,CAGQ,WAAa,CACnB,SAAS,CAAE,MAAM,IAAI,CAAC,CAAC,IAAI,CAAC,CAAC,IAAI,CACnC,CAEA,MAAO,YAAY,KAAK,CAAE,CACxB,oBAAO,CACL,GAAG,CAAE,IAAI,CACT,UAAU,CAAE,IACd,CACQ,KAAO,CACb,KAAK,CAAE,KACT,CACF"}`
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data = {} } = $$props;
  data.stationCode ?? "ABS";
  data.stationName ?? "Abbottabad";
  if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
  $$result.css.add(css);
  return `<br> ${validate_component(H1, "H1").$$render($$result, { text: "ABS", size: "2rem" }, {}, {})}  <div class="stack svelte-rphtcy">${validate_component(ImgCard, "ImgCard").$$render(
    $$result,
    {
      icon: "▦",
      label: "Screened",
      href: "/stations/abs/abs_screened"
    },
    {},
    {}
  )} ${validate_component(ImgCard, "ImgCard").$$render(
    $$result,
    {
      icon: "⛰️",
      label: "Unscreened",
      href: "/stations/abs/abs_unscreened_raw"
    },
    {},
    {}
  )} </div>`;
});
export {
  Page as default
};
