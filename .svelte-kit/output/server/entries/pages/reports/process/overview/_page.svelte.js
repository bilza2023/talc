import { c as create_ssr_component, v as validate_component } from "../../../../../chunks/ssr.js";
import { R as ReportShell, K as KPIBar, S as SmartTable } from "../../../../../chunks/SmartTable.js";
import { F as FacetPanel } from "../../../../../chunks/FacetPanel.js";
import "@sveltejs/kit/internal";
import "../../../../../chunks/exports.js";
import "../../../../../chunks/state.svelte.js";
function pretty(opt) {
  return opt === "" ? "All" : opt;
}
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  const tabs = [
    {
      label: "Overview",
      href: "/reports/process/overview"
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
  const cols = [
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
    {
      key: "wastagePct",
      label: "Wastage %",
      align: "right"
    },
    { key: "ht", label: "HT", align: "right" },
    {
      key: "status",
      label: "Status",
      align: "left"
    }
  ];
  const rows = (data.latest || []).map((r) => ({
    ...r,
    date: new Date(r.date).toISOString().slice(0, 10),
    wastagePct: r.wastagePct == null ? "—" : Number(r.wastagePct).toFixed(1),
    ht: r.ht == null ? "—" : Number(r.ht).toFixed(1)
  }));
  if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
  return `${validate_component(ReportShell, "ReportShell").$$render(
    $$result,
    {
      title: "Process — Overview",
      dateRange: "Live Data",
      tabs
    },
    {},
    {
      default: () => {
        return `${validate_component(KPIBar, "KPIBar").$$render($$result, { items: kpis }, {}, {})} <div style="margin:1rem 0;">${validate_component(FacetPanel, "FacetPanel").$$render($$result, { facets }, {}, {})}</div> ${validate_component(SmartTable, "SmartTable").$$render($$result, { columns: cols, rows }, {}, {})}`;
      }
    }
  )}`;
});
export {
  Page as default
};
