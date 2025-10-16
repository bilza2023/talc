import { c as create_ssr_component, v as validate_component } from "../../../../../chunks/ssr.js";
import { D as Dispatch } from "../../../../../chunks/Dispatch.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  const lane = {
    fromMmaCode: data.fromMmaCode,
    // 'PSS_SORTED'
    toMmaCode: data.toMmaCode,
    // 'KEF_SORTED'
    redirectTo: "/stations/pss/pss_sorted"
  };
  if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
  return `${validate_component(Dispatch, "Dispatch").$$render(
    $$result,
    {
      lane,
      onHand: data.onHand ?? null,
      showAmount: true
    },
    {},
    {}
  )}`;
});
export {
  Page as default
};
