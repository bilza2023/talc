import { c as create_ssr_component, a as add_attribute, e as each, b as escape, v as validate_component } from "../../../../../chunks/ssr.js";
import { R as ReportShell, K as KPIBar, S as SmartTable } from "../../../../../chunks/SmartTable.js";
import { F as FacetPanel } from "../../../../../chunks/FacetPanel.js";
import { S as Sparkline } from "../../../../../chunks/Sparkline.js";
import "@sveltejs/kit/internal";
import "../../../../../chunks/exports.js";
import "../../../../../chunks/state.svelte.js";
const css = {
  code: ".wrap.svelte-dkuf8{display:grid;grid-template-columns:var(--size) 1fr;gap:.75rem;align-items:center}@media(max-width: 600px){.wrap.svelte-dkuf8{grid-template-columns:1fr;justify-items:center}}.total.svelte-dkuf8{fill:var(--primaryText, #e9e9ea);font-size:1rem;opacity:.9}.legend.svelte-dkuf8{width:100%}.row.svelte-dkuf8{display:grid;grid-template-columns:14px auto auto;gap:.5rem .75rem;align-items:center;padding:.25rem 0}.sw.svelte-dkuf8{width:14px;height:14px;border-radius:3px;border:1px solid color-mix(in oklab, black 20%, transparent)}.lab.svelte-dkuf8{color:var(--mutedText, #a3a3a3)}.val.svelte-dkuf8{justify-self:end}",
  map: '{"version":3,"file":"Donut.svelte","sources":["Donut.svelte"],"sourcesContent":["<script>\\n    // segments: [{ label, value }]\\n    export let segments = [];\\n    export let size = 140;\\n    export let thickness = 14;\\n    export let showTotal = true;\\n  \\n    $: total = segments.reduce((s, x) => s + Number(x.value || 0), 0);\\n    $: radius = (size - thickness) / 2;\\n    $: circ = 2 * Math.PI * radius;\\n  \\n    // assign hues deterministically\\n    $: palette = segments.map((_, i) => `hsl(${(i * 57) % 360} 80% 60%)`);\\n  \\n    $: withOffsets = (() => {\\n      let acc = 0;\\n      return segments.map((s) => {\\n        const frac = total ? (s.value / total) : 0;\\n        const len = frac * circ;\\n        const from = acc;\\n        acc += len;\\n        return { ...s, len, from };\\n      });\\n    })();\\n  <\/script>\\n  \\n  <div class=\\"wrap\\" style={`--size:${size}px; --th:${thickness}px`}>\\n    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label=\\"Donut chart\\">\\n      <g transform={`translate(${size/2},${size/2}) rotate(-90)`}>\\n        {#each withOffsets as s, i}\\n          <circle\\n            r={radius}\\n            cx=\\"0\\" cy=\\"0\\"\\n            fill=\\"none\\"\\n            stroke={palette[i]}\\n            stroke-width={thickness}\\n            stroke-dasharray={`${s.len} ${circ - s.len}`}\\n            stroke-dashoffset={-s.from}\\n            pathLength={circ}\\n          />\\n        {/each}\\n        <!-- background ring -->\\n        <circle r={radius} cx=\\"0\\" cy=\\"0\\" fill=\\"none\\" stroke=\\"color-mix(in oklab, white 4%, transparent)\\" stroke-width={thickness} opacity=\\"0.25\\"/>\\n      </g>\\n      {#if showTotal}\\n        <text x=\\"50%\\" y=\\"50%\\" dominant-baseline=\\"middle\\" text-anchor=\\"middle\\" class=\\"total\\">\\n          {total.toLocaleString()}\\n        </text>\\n      {/if}\\n    </svg>\\n  \\n    {#if segments?.length}\\n      <div class=\\"legend\\">\\n        {#each segments as s, i}\\n          <div class=\\"row\\">\\n            <span class=\\"sw\\" style={`background:${palette[i]}`}></span>\\n            <span class=\\"lab\\">{s.label}</span>\\n            <span class=\\"val\\">{s.value?.toLocaleString?.() ?? s.value}</span>\\n          </div>\\n        {/each}\\n      </div>\\n    {/if}\\n  </div>\\n  \\n  <style>\\n    .wrap {\\n      display: grid;\\n      grid-template-columns: var(--size) 1fr;\\n      gap: .75rem;\\n      align-items: center;\\n    }\\n    @media (max-width: 600px) {\\n      .wrap { grid-template-columns: 1fr; justify-items: center; }\\n    }\\n    .total {\\n      fill: var(--primaryText, #e9e9ea);\\n      font-size: 1rem;\\n      opacity: .9;\\n    }\\n    .legend { width: 100%; }\\n    .row {\\n      display: grid;\\n      grid-template-columns: 14px auto auto;\\n      gap: .5rem .75rem;\\n      align-items: center;\\n      padding: .25rem 0;\\n    }\\n    .sw {\\n      width: 14px; height: 14px; border-radius: 3px;\\n      border: 1px solid color-mix(in oklab, black 20%, transparent);\\n    }\\n    .lab { color: var(--mutedText, #a3a3a3); }\\n    .val { justify-self: end; }\\n  </style>\\n  "],"names":[],"mappings":"AAiEI,kBAAM,CACJ,OAAO,CAAE,IAAI,CACb,qBAAqB,CAAE,IAAI,MAAM,CAAC,CAAC,GAAG,CACtC,GAAG,CAAE,MAAM,CACX,WAAW,CAAE,MACf,CACA,MAAO,YAAY,KAAK,CAAE,CACxB,kBAAM,CAAE,qBAAqB,CAAE,GAAG,CAAE,aAAa,CAAE,MAAQ,CAC7D,CACA,mBAAO,CACL,IAAI,CAAE,IAAI,aAAa,CAAC,QAAQ,CAAC,CACjC,SAAS,CAAE,IAAI,CACf,OAAO,CAAE,EACX,CACA,oBAAQ,CAAE,KAAK,CAAE,IAAM,CACvB,iBAAK,CACH,OAAO,CAAE,IAAI,CACb,qBAAqB,CAAE,IAAI,CAAC,IAAI,CAAC,IAAI,CACrC,GAAG,CAAE,KAAK,CAAC,MAAM,CACjB,WAAW,CAAE,MAAM,CACnB,OAAO,CAAE,MAAM,CAAC,CAClB,CACA,gBAAI,CACF,KAAK,CAAE,IAAI,CAAE,MAAM,CAAE,IAAI,CAAE,aAAa,CAAE,GAAG,CAC7C,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,UAAU,EAAE,CAAC,KAAK,CAAC,CAAC,KAAK,CAAC,GAAG,CAAC,CAAC,WAAW,CAC9D,CACA,iBAAK,CAAE,KAAK,CAAE,IAAI,WAAW,CAAC,QAAQ,CAAG,CACzC,iBAAK,CAAE,YAAY,CAAE,GAAK"}'
};
const Donut = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let total;
  let radius;
  let circ;
  let palette;
  let withOffsets;
  let { segments = [] } = $$props;
  let { size = 140 } = $$props;
  let { thickness = 14 } = $$props;
  let { showTotal = true } = $$props;
  if ($$props.segments === void 0 && $$bindings.segments && segments !== void 0) $$bindings.segments(segments);
  if ($$props.size === void 0 && $$bindings.size && size !== void 0) $$bindings.size(size);
  if ($$props.thickness === void 0 && $$bindings.thickness && thickness !== void 0) $$bindings.thickness(thickness);
  if ($$props.showTotal === void 0 && $$bindings.showTotal && showTotal !== void 0) $$bindings.showTotal(showTotal);
  $$result.css.add(css);
  total = segments.reduce((s, x) => s + Number(x.value || 0), 0);
  radius = (size - thickness) / 2;
  circ = 2 * Math.PI * radius;
  palette = segments.map((_, i) => `hsl(${i * 57 % 360} 80% 60%)`);
  withOffsets = (() => {
    let acc = 0;
    return segments.map((s) => {
      const frac = total ? s.value / total : 0;
      const len = frac * circ;
      const from = acc;
      acc += len;
      return { ...s, len, from };
    });
  })();
  return `<div class="wrap svelte-dkuf8"${add_attribute("style", `--size:${size}px; --th:${thickness}px`, 0)}><svg${add_attribute("width", size, 0)}${add_attribute("height", size, 0)}${add_attribute("viewBox", `0 0 ${size} ${size}`, 0)} aria-label="Donut chart"><g${add_attribute("transform", `translate(${size / 2},${size / 2}) rotate(-90)`, 0)}>${each(withOffsets, (s, i) => {
    return `<circle${add_attribute("r", radius, 0)} cx="0" cy="0" fill="none"${add_attribute("stroke", palette[i], 0)}${add_attribute("stroke-width", thickness, 0)}${add_attribute("stroke-dasharray", `${s.len} ${circ - s.len}`, 0)}${add_attribute("stroke-dashoffset", -s.from, 0)}${add_attribute("pathLength", circ, 0)}></circle>`;
  })}<circle${add_attribute("r", radius, 0)} cx="0" cy="0" fill="none" stroke="color-mix(in oklab, white 4%, transparent)"${add_attribute("stroke-width", thickness, 0)} opacity="0.25"></circle></g>${showTotal ? `<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" class="total svelte-dkuf8">${escape(total.toLocaleString())}</text>` : ``}</svg> ${segments?.length ? `<div class="legend svelte-dkuf8">${each(segments, (s, i) => {
    return `<div class="row svelte-dkuf8"><span class="sw svelte-dkuf8"${add_attribute("style", `background:${palette[i]}`, 0)}></span> <span class="lab svelte-dkuf8">${escape(s.label)}</span> <span class="val svelte-dkuf8">${escape(s.value?.toLocaleString?.() ?? s.value)}</span> </div>`;
  })}</div>` : ``} </div>`;
});
function pretty(opt) {
  return opt === "" ? "All" : opt;
}
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  const tabs = [
    {
      label: "Overview",
      href: "/reports/procurement/overview"
    },
    {
      label: "Suppliers",
      href: "/reports/procurement/suppliers"
    },
    {
      label: "Trends",
      href: "/reports/procurement/trends"
    }
  ];
  const { filters, options, kpis } = data;
  const facets = [
    {
      key: "station",
      label: "Station",
      type: "chips",
      options: [""].concat(options.stations || []),
      value: filters.station
    },
    {
      key: "family",
      label: "Family",
      type: "chips",
      options: [""].concat(options.families || []),
      value: filters.family
    },
    {
      key: "shade",
      label: "Shade",
      type: "select",
      options: [""].concat(options.shades || []),
      value: filters.shade
    },
    {
      key: "size",
      label: "Size",
      type: "select",
      options: [""].concat(options.sizes || []),
      value: filters.size
    },
    {
      key: "supplierId",
      label: "Supplier",
      type: "select",
      options: [""].concat(options.supOpts || []),
      value: filters.supplierId
    },
    {
      key: "days",
      label: "Lookback",
      type: "chips",
      options: options.daysOpts || [],
      value: filters.days || "90"
    },
    {
      key: "group",
      label: "Group By",
      type: "chips",
      options: options.groupOpts || ["day", "week", "month"],
      value: filters.group || "week"
    }
  ];
  facets.forEach((f) => {
    f.options = (f.options || []).map(pretty);
  });
  const trendCols = [
    {
      key: "label",
      label: "Period",
      align: "left"
    },
    {
      key: "qty",
      label: "Qty (t)",
      align: "right"
    }
  ];
  const trendRows = (data.series || []).map((r) => ({ label: r.label, qty: r.qty }));
  const segments = data.shadeMix || [];
  const points = data.points || [];
  if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
  return `${validate_component(ReportShell, "ReportShell").$$render(
    $$result,
    {
      title: "Procurement — Trends",
      dateRange: "Live Data",
      tabs
    },
    {},
    {
      default: () => {
        return `${validate_component(KPIBar, "KPIBar").$$render($$result, { items: kpis }, {}, {})} <div style="margin:1rem 0;">${validate_component(FacetPanel, "FacetPanel").$$render($$result, { facets }, {}, {})}</div> <h2 style="margin:1.25rem 0 .5rem;" data-svelte-h="svelte-1lju595">Purchases Over Time</h2> <div style="padding:.5rem; border:1px solid var(--borderColor, #2a2a2e); border-radius:12px; background:var(--panelBg, #151518);">${validate_component(Sparkline, "Sparkline").$$render($$result, { points }, {}, {})}</div> <h2 style="margin:1.25rem 0 .5rem;" data-svelte-h="svelte-n622sj">Period Rollup</h2> ${validate_component(SmartTable, "SmartTable").$$render($$result, { columns: trendCols, rows: trendRows }, {}, {})} <h2 style="margin:1.25rem 0 .5rem;" data-svelte-h="svelte-v2k18w">Shade Mix (in period)</h2> ${validate_component(Donut, "Donut").$$render($$result, { segments }, {}, {})}`;
      }
    }
  )}`;
});
export {
  Page as default
};
