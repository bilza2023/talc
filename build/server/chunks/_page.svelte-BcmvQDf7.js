import { c as create_ssr_component, v as validate_component } from './ssr-YOuSP3iu.js';
import { S as Slots } from './Slots-DMFfDedt.js';

const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  const rows = data?.slots ?? [];
  const actions = [
    {
      label: "Dispatch ➜ KEF (Sorted)",
      icon: "🚚",
      href: (r) => `/stations/pss/dispatch_kef_sorted?supplierId=${r.supplierId}&shade=${r.shade}&size=${r.size}&qty=${r.qty}`
    }
  ];
  if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
  return `${validate_component(Slots, "Slots").$$render(
    $$result,
    {
      title: "PSS — Sorted Slots",
      rows,
      actions
    },
    {},
    {}
  )}`;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-BcmvQDf7.js.map
