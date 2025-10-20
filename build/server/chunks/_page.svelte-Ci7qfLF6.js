import { c as create_ssr_component, v as validate_component } from './ssr-YOuSP3iu.js';
import { D as Dispatch } from './Dispatch-Dz84cHYo.js';

const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  const lane = {
    fromMmaCode: data.fromMmaCode,
    // 'ABS_SCREENED'
    toMmaCode: data.toMmaCode,
    // 'KEF_SCREENED'
    redirectTo: "/stations/abs/abs_screened"
  };
  if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
  return `${validate_component(Dispatch, "Dispatch").$$render(
    $$result,
    {
      lane,
      onHand: data.onHand ?? null,
      showAmount: false
    },
    {},
    {}
  )}`;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-Ci7qfLF6.js.map
