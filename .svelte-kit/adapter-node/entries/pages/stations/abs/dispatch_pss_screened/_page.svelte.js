import { c as create_ssr_component, v as validate_component } from "../../../../../chunks/ssr.js";
/* empty css                           */
import { D as Dispatch } from "../../../../../chunks/Dispatch.js";
const FROM_MMA = "ABS_SCREENED";
const TO_MMA = "PSS_SCREENED";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  const form = {
    ...data?.form ?? {},
    fromMmaCode: FROM_MMA,
    toMmaCode: TO_MMA,
    fromMma: FROM_MMA,
    toMma: TO_MMA
  };
  const lane = { from: FROM_MMA, to: TO_MMA };
  if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
  return ` ${validate_component(Dispatch, "Dispatch").$$render($$result, Object.assign({}, form, { lane }, { stationCode: data?.stationCode }, { stationName: data?.stationName }, { fromUrl: data?.fromUrl }), {}, {})}`;
});
export {
  Page as default
};
