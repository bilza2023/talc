import { c as create_ssr_component, v as validate_component } from "../../../../../chunks/ssr.js";
import { R as ReportShell, K as KPIBar, S as SmartTable } from "../../../../../chunks/SmartTable.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  const tabs = [
    {
      label: "Overview",
      href: "/reports/stocks/overview"
    },
    {
      label: "Slots",
      href: "/reports/stocks/slots"
    },
    {
      label: "Suppliers",
      href: "/reports/stocks/suppliers"
    }
  ];
  const kpis = data.kpis ?? [];
  const heatCols = [
    {
      key: "station",
      label: "Station",
      align: "left"
    },
    ...(data.families ?? []).map((f) => ({ key: f, label: f, align: "right" })),
    {
      key: "total",
      label: "Total (t)",
      align: "right"
    }
  ];
  const heatRows = (data.heatRows ?? []).map((r) => {
    const obj = { ...r };
    return obj;
  });
  const slotCols = [
    {
      key: "mmaCode",
      label: "MMA",
      align: "left"
    },
    {
      key: "supplierId",
      label: "Supplier",
      align: "right"
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
  const topSlots = data.topSlots ?? [];
  if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
  return `${validate_component(ReportShell, "ReportShell").$$render(
    $$result,
    {
      title: "Stocks — Overview",
      dateRange: "Live Data",
      tabs
    },
    {},
    {
      default: () => {
        return `${validate_component(KPIBar, "KPIBar").$$render($$result, { items: kpis }, {}, {})} <h2 style="margin:1.25rem 0 .5rem;" data-svelte-h="svelte-18028qf">Station × Family</h2> ${validate_component(SmartTable, "SmartTable").$$render($$result, { columns: heatCols, rows: heatRows }, {}, {})} <h2 style="margin:1.25rem 0 .5rem;" data-svelte-h="svelte-8otd9h">Top 25 Slots</h2> ${validate_component(SmartTable, "SmartTable").$$render($$result, { columns: slotCols, rows: topSlots }, {}, {})}`;
      }
    }
  )}`;
});
export {
  Page as default
};
