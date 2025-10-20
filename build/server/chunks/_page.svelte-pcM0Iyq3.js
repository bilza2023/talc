import { c as create_ssr_component, v as validate_component } from './ssr-YOuSP3iu.js';
import { R as ReportShell, K as KPIBar, S as SmartTable } from './SmartTable-Caql84_B.js';
import './index-Dpohf66W.js';

const Page = create_ssr_component(($$result, $$props, $$bindings, slots$1) => {
  let { data } = $$props;
  const { kpis = [], slots = [] } = data;
  const columns = [
    {
      key: "mmaCode",
      label: "MMA",
      align: "left"
    },
    {
      key: "qty",
      label: "Qty (t)",
      align: "right"
    }
  ];
  if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
  return `  ${validate_component(ReportShell, "ReportShell").$$render(
    $$result,
    {
      title: "Reports Dashboard",
      dateRange: "Live Data"
    },
    {},
    {
      default: () => {
        return `${validate_component(KPIBar, "KPIBar").$$render($$result, { items: kpis }, {}, {})} <h2 style="margin-top:1.5rem;" data-svelte-h="svelte-182lmm4">Top MMAs by On-Hand</h2> ${validate_component(SmartTable, "SmartTable").$$render($$result, { columns, rows: slots }, {}, {})}`;
      }
    }
  )}`;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-pcM0Iyq3.js.map
