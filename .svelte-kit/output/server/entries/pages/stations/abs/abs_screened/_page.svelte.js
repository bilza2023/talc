import { c as create_ssr_component, v as validate_component } from "../../../../../chunks/ssr.js";
import { S as Slots } from "../../../../../chunks/Slots.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  const rows = data?.slots ?? [];
  const actions = [
    {
      label: "Dispatch ➜ PSS (Screened)",
      icon: "🚚",
      href: (r) => `/stations/abs/dispatch_pss_screened?supplierId=${r.supplierId}&shade=${r.shade}&size=${r.size}&qty=${r.qty}`
    }
  ];
  if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
  return `${validate_component(Slots, "Slots").$$render(
    $$result,
    {
      title: "ABS — Screened Slots",
      rows,
      actions
    },
    {},
    {}
  )}`;
});
export {
  Page as default
};
