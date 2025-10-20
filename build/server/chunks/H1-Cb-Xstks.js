import { c as create_ssr_component, f as escape } from './ssr-YOuSP3iu.js';

const css = {
  code: ".page-title.svelte-pnbfac{text-align:center;color:var(--baseTextColor);margin:0.75rem 0 1rem;font-weight:600;letter-spacing:0.3px}",
  map: `{"version":3,"file":"H1.svelte","sources":["H1.svelte"],"sourcesContent":["\\n<script>\\n    export let text = '';\\n    export let size = '1.5rem'; // you can pass '2rem', '24px', etc.\\n  <\/script>\\n  \\n  <h1 class=\\"page-title\\" style=\\"font-size:{size};\\">{text}</h1>\\n  \\n  <style>\\n    .page-title {\\n      text-align: center;\\n      color: var(--baseTextColor);\\n      margin: 0.75rem 0 1rem;\\n      font-weight: 600;\\n      letter-spacing: 0.3px;\\n    }\\n  </style>\\n  "],"names":[],"mappings":"AASI,yBAAY,CACV,UAAU,CAAE,MAAM,CAClB,KAAK,CAAE,IAAI,eAAe,CAAC,CAC3B,MAAM,CAAE,OAAO,CAAC,CAAC,CAAC,IAAI,CACtB,WAAW,CAAE,GAAG,CAChB,cAAc,CAAE,KAClB"}`
};
const H1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { text = "" } = $$props;
  let { size = "1.5rem" } = $$props;
  if ($$props.text === void 0 && $$bindings.text && text !== void 0) $$bindings.text(text);
  if ($$props.size === void 0 && $$bindings.size && size !== void 0) $$bindings.size(size);
  $$result.css.add(css);
  return `<h1 class="page-title svelte-pnbfac" style="${"font-size:" + escape(size, true) + ";"}">${escape(text)}</h1>`;
});

export { H1 as H };
//# sourceMappingURL=H1-Cb-Xstks.js.map
