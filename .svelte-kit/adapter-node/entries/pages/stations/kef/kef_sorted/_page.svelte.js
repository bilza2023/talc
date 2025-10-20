import { c as create_ssr_component, v as validate_component } from "../../../../../chunks/ssr.js";
import { S as Slots } from "../../../../../chunks/Slots.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  const rows = data?.slots ?? [];
  const actions = [];
  if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
  return `${validate_component(Slots, "Slots").$$render(
    $$result,
    {
      title: "KEF — Sorted Slots",
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
