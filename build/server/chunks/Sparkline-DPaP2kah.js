import { c as create_ssr_component, d as add_attribute } from './ssr-YOuSP3iu.js';

const css = {
  code: "svg.svelte-ccrfcl{display:block}",
  map: '{"version":3,"file":"Sparkline.svelte","sources":["Sparkline.svelte"],"sourcesContent":["<script>\\n    // points: array of numbers\\n    export let points = [];\\n    export let width = 120;\\n    export let height = 36;\\n    export let strokeWidth = 2;\\n  \\n    const pad = 3; // visual padding inside svg\\n  \\n    $: min = points.length ? Math.min(...points) : 0;\\n    $: max = points.length ? Math.max(...points) : 0;\\n    $: span = Math.max(1e-6, max - min);\\n    $: stepX = points.length > 1 ? (width - pad * 2) / (points.length - 1) : 0;\\n  \\n    $: d = (() => {\\n      if (!points.length) return \'\';\\n      return points.map((v, i) => {\\n        const x = pad + i * stepX;\\n        const y = pad + (height - pad * 2) * (1 - (v - min) / span);\\n        return `${i ? \'L\' : \'M\'}${x.toFixed(2)},${y.toFixed(2)}`;\\n      }).join(\' \');\\n    })();\\n  \\n    $: last = points.length ? {\\n      x: pad + (points.length - 1) * stepX,\\n      y: pad + (height - pad * 2) * (1 - (points.at(-1) - min) / span)\\n    } : { x: 0, y: 0 };\\n  <\/script>\\n  \\n  <svg {width} {height} viewBox={`0 0 ${width} ${height}`} aria-hidden=\\"true\\">\\n    <path d={d} fill=\\"none\\" stroke=\\"var(--accent, #6ee7ff)\\" stroke-width={strokeWidth} stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\" />\\n    {#if points.length}\\n      <circle cx={last.x} cy={last.y} r={strokeWidth + 1.5} fill=\\"var(--accent, #6ee7ff)\\" />\\n    {/if}\\n  </svg>\\n  \\n  <style>\\n    svg { display: block; }\\n  </style>\\n  "],"names":[],"mappings":"AAqCI,iBAAI,CAAE,OAAO,CAAE,KAAO"}'
};
const pad = 3;
const Sparkline = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let min;
  let max;
  let span;
  let stepX;
  let d;
  let last;
  let { points = [] } = $$props;
  let { width = 120 } = $$props;
  let { height = 36 } = $$props;
  let { strokeWidth = 2 } = $$props;
  if ($$props.points === void 0 && $$bindings.points && points !== void 0) $$bindings.points(points);
  if ($$props.width === void 0 && $$bindings.width && width !== void 0) $$bindings.width(width);
  if ($$props.height === void 0 && $$bindings.height && height !== void 0) $$bindings.height(height);
  if ($$props.strokeWidth === void 0 && $$bindings.strokeWidth && strokeWidth !== void 0) $$bindings.strokeWidth(strokeWidth);
  $$result.css.add(css);
  min = points.length ? Math.min(...points) : 0;
  max = points.length ? Math.max(...points) : 0;
  span = Math.max(1e-6, max - min);
  stepX = points.length > 1 ? (width - pad * 2) / (points.length - 1) : 0;
  d = (() => {
    if (!points.length) return "";
    return points.map((v, i) => {
      const x = pad + i * stepX;
      const y = pad + (height - pad * 2) * (1 - (v - min) / span);
      return `${i ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(" ");
  })();
  last = points.length ? {
    x: pad + (points.length - 1) * stepX,
    y: pad + (height - pad * 2) * (1 - (points.at(-1) - min) / span)
  } : { x: 0, y: 0 };
  return `<svg${add_attribute("width", width, 0)}${add_attribute("height", height, 0)}${add_attribute("viewBox", `0 0 ${width} ${height}`, 0)} aria-hidden="true" class="svelte-ccrfcl"><path${add_attribute("d", d, 0)} fill="none" stroke="var(--accent, #6ee7ff)"${add_attribute("stroke-width", strokeWidth, 0)} stroke-linecap="round" stroke-linejoin="round"></path>${points.length ? `<circle${add_attribute("cx", last.x, 0)}${add_attribute("cy", last.y, 0)}${add_attribute("r", strokeWidth + 1.5, 0)} fill="var(--accent, #6ee7ff)"></circle>` : ``}</svg>`;
});

export { Sparkline as S };
//# sourceMappingURL=Sparkline-DPaP2kah.js.map
