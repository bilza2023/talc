import { c as create_ssr_component, v as validate_component } from "../../../../../chunks/ssr.js";
import { R as Receive } from "../../../../../chunks/Receive.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  const lane = {
    fromMmaCode: data.fromMmaCode,
    // 'PSS_SORTED'
    toMmaCode: data.toMmaCode
    // 'KEF_SORTED'
  };
  if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
  return `${validate_component(Receive, "Receive").$$render($$result, { lane, rows: data.rows, showAmount: true }, {}, {})}`;
});
export {
  Page as default
};
