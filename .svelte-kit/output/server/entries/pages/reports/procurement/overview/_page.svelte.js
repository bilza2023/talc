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
      value: filters.days || "30"
    }
  ];
  facets.forEach((f) => f.options = f.options.map(pretty));
  const heatCols = [
    {
      key: "station",
      label: "Station",
      align: "left"
    },
    ...(data.families || []).map((f) => ({ key: f, label: f, align: "right" })),
    {
      key: "total",
      label: "Total (t)",
      align: "right"
    }
  ];
  const heatRows = data.heatRows || [];
  const lbCols = [
    {
      key: "supplierName",
      label: "Supplier",
      align: "left"
    },
    {
      key: "supplierId",
      label: "ID",
      align: "right",
      width: "80px"
    },
    {
      key: "qty",
      label: "Qty (t)",
      align: "right"
    }
  ];
  const leaderboard = data.leaderboard || [];
  const recentCols = [
    {
      key: "date",
      label: "Date",
      align: "left"
    },
    {
      key: "mmaCode",
      label: "MMA",
      align: "left"
    },
    {
      key: "supplierId",
      label: "Supplier",
      align: "right",
      width: "90px"
    },
    {
      key: "shade",
      label: "Shade",
      align: "left"
    },
    {
      key: "size",
      label: "Size",
      align: "left"
    },
    {
      key: "qty",
      label: "Qty (t)",
      align: "right"
    }
  ];
  const recentRows = (data.recent || []).map((r) => ({
    ...r,
    date: new Date(r.date).toISOString().slice(0, 10)
  }));
  if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
  return `${validate_component(ReportShell, "ReportShell").$$render(
    $$result,
    {
      title: "Procurement — Overview",
      dateRange: "Live Data",
      tabs
    },
    {},
    {
      default: () => {
        return `${validate_component(KPIBar, "KPIBar").$$render($$result, { items: kpis }, {}, {})} <div style="margin:1rem 0;">${validate_component(FacetPanel, "FacetPanel").$$render($$result, { facets }, {}, {})}</div> <h2 style="margin:1.25rem 0 .5rem;" data-svelte-h="svelte-ldcoiw">Station × Family (Purchases in Period)</h2> ${validate_component(SmartTable, "SmartTable").$$render($$result, { columns: heatCols, rows: heatRows }, {}, {})} <h2 style="margin:1.25rem 0 .5rem;" data-svelte-h="svelte-1v0fk1v">Supplier Leaderboard (Period)</h2> ${validate_component(SmartTable, "SmartTable").$$render($$result, { columns: lbCols, rows: leaderboard }, {}, {})} <h2 style="margin:1.25rem 0 .5rem;" data-svelte-h="svelte-a4jkeb">Recent Purchases</h2> ${validate_component(SmartTable, "SmartTable").$$render($$result, { columns: recentCols, rows: recentRows }, {}, {})}`;
      }
    }
  )}`;
});
export {
  Page as default
};
