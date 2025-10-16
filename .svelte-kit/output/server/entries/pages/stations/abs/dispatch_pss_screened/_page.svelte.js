import { c as create_ssr_component, v as validate_component } from "../../../../../chunks/ssr.js";
import { D as Dispatch } from "../../../../../chunks/Dispatch.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  const lane = {
    fromMmaCode: data.fromMmaCode,
    // 'ABS_SCREENED'
    toMmaCode: data.toMmaCode,
    // 'PSS_SCREENED'
    redirectTo: "/stations/abs/abs_screened"
    // after success
  };
  if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
  return `${validate_component(Dispatch, "Dispatch").$$render(
    $$result,
    {
      lane,
      onHand: data.available ?? null,
      showAmount: false
    },
    {},
    {}
  )}`;
});
export {
  Page as default
};
