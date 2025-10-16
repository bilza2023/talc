import { c as create_ssr_component, v as validate_component, b as escape } from "../../../../../chunks/ssr.js";
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
  const { filters, options, kpis, leaderboard, detail } = data;
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
  const detCols = [
    {
      key: "mmaCode",
      label: "MMA",
      align: "left"
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
  if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
  return `${validate_component(ReportShell, "ReportShell").$$render(
    $$result,
    {
      title: "Procurement — Suppliers",
      dateRange: "Live Data",
      tabs
    },
    {},
    {
      default: () => {
        return `${validate_component(KPIBar, "KPIBar").$$render($$result, { items: kpis }, {}, {})} <div style="margin:1rem 0;">${validate_component(FacetPanel, "FacetPanel").$$render($$result, { facets }, {}, {})}</div> <h2 style="margin:1.25rem 0 .5rem;" data-svelte-h="svelte-143ieqz">Supplier Leaderboard (by Qty)</h2> ${validate_component(SmartTable, "SmartTable").$$render($$result, { columns: lbCols, rows: leaderboard }, {}, {})} ${detail?.supplier ? `<h2 style="margin:1.25rem 0 .5rem;">Purchases for Supplier: ${escape(detail.supplier.name)} (ID ${escape(detail.supplier.id)})</h2> ${validate_component(SmartTable, "SmartTable").$$render($$result, { columns: detCols, rows: detail.rows }, {}, {})}` : ``}`;
      }
    }
  )}`;
});
export {
  Page as default
};
