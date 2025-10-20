import { c as create_ssr_component, v as validate_component } from './ssr-YOuSP3iu.js';
import { R as ReportShell, K as KPIBar, S as SmartTable } from './SmartTable-Caql84_B.js';
import { F as FacetPanel } from './FacetPanel-BlLkts7Q.js';
import { S as Sparkline } from './Sparkline-DPaP2kah.js';
import './exports-DKuYoYKl.js';
import './state.svelte-ChAriFL2.js';
import './index-Dpohf66W.js';

function pretty(opt) {
  return opt === "" ? "All" : opt;
}
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  const tabs = [
    {
      label: "Overview",
      href: "/reports/process/overview"
    },
    {
      label: "Screening",
      href: "/reports/process/screening"
    }
  ];
  const { filters, kpis } = data;
  const facets = [
    {
      key: "days",
      label: "Lookback",
      type: "chips",
      options: ["", "7", "30", "90", "180", "365"],
      value: filters.days || "30"
    }
  ];
  facets.forEach((f) => f.options = f.options.map(pretty));
  const trendCols = [
    {
      key: "label",
      label: "Date",
      align: "left"
    },
    {
      key: "qty",
      label: "Qty (t)",
      align: "right"
    }
  ];
  const trendRows = data.series || [];
  const points = data.points || [];
  const latestCols = [
    {
      key: "date",
      label: "Date",
      align: "left"
    },
    {
      key: "id",
      label: "Run ID",
      align: "right",
      width: "100px"
    },
    {
      key: "qty",
      label: "Qty (t)",
      align: "right"
    },
    { key: "ht", label: "HT", align: "right" },
    {
      key: "status",
      label: "Status",
      align: "left"
    }
  ];
  const latestRows = (data.latest || []).map((r) => ({
    ...r,
    date: new Date(r.date).toISOString().slice(0, 10),
    ht: r.ht == null ? "—" : Number(r.ht).toFixed(1)
  }));
  if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
  return `${validate_component(ReportShell, "ReportShell").$$render(
    $$result,
    {
      title: "Process — Screening",
      dateRange: "Live Data",
      tabs
    },
    {},
    {
      default: () => {
        return `${validate_component(KPIBar, "KPIBar").$$render($$result, { items: kpis }, {}, {})} <div style="margin:1rem 0;">${validate_component(FacetPanel, "FacetPanel").$$render($$result, { facets }, {}, {})}</div> <h2 style="margin:1.25rem 0 .5rem;" data-svelte-h="svelte-334vdq">Screened Qty Over Time</h2> <div style="padding:.5rem; border:1px solid var(--borderColor, #2a2a2e); border-radius:12px; background:var(--panelBg, #151518);">${validate_component(Sparkline, "Sparkline").$$render($$result, { points }, {}, {})}</div> <h2 style="margin:1.25rem 0 .5rem;" data-svelte-h="svelte-1yvc164">Daily Totals</h2> ${validate_component(SmartTable, "SmartTable").$$render($$result, { columns: trendCols, rows: trendRows }, {}, {})} <h2 style="margin:1.25rem 0 .5rem;" data-svelte-h="svelte-1udnr7p">Latest Screening Runs</h2> ${validate_component(SmartTable, "SmartTable").$$render($$result, { columns: latestCols, rows: latestRows }, {}, {})}`;
      }
    }
  )}`;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-B6PdciX3.js.map
