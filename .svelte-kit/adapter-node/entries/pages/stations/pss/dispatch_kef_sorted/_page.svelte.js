import { c as create_ssr_component, v as validate_component } from "../../../../../chunks/ssr.js";
import { D as Dispatch } from "../../../../../chunks/Dispatch.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  const form = data?.form ?? {};
  const lane = data?.lane ?? {
    from: form.fromMmaCode ?? form.fromMma ?? form.from ?? "",
    to: form.toMmaCode ?? form.toMma ?? form.to ?? ""
  };
  if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
  return `${validate_component(Dispatch, "Dispatch").$$render($$result, Object.assign({}, form, { lane }, { stationCode: data?.stationCode }, { stationName: data?.stationName }, { fromUrl: data?.fromUrl }), {}, {})}`;
});
export {
  Page as default
};
