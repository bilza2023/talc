import { c as create_ssr_component, f as escape, d as add_attribute } from './ssr-YOuSP3iu.js';
import './exports-DKuYoYKl.js';
import './state.svelte-ChAriFL2.js';

const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  let { form } = $$props;
  const d = data?.defaults ?? {};
  const supplierId = d?.supplierId ?? "";
  const shade = d?.shade ?? "";
  const size = d?.size ?? "";
  const qty = d?.qty ?? "";
  const ht = d?.ht ?? "";
  const wastage = d?.wastage ?? "";
  if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
  if ($$props.form === void 0 && $$bindings.form && form !== void 0) $$bindings.form(form);
  return `<h1 class="title" data-svelte-h="svelte-f5qv77">PSS – Sort (Screened → Sorted)</h1> ${supplierId || shade || size || qty ? `<div class="prefill"><span data-svelte-h="svelte-1hujhj3">Prefilled →</span> ${supplierId ? `<b data-svelte-h="svelte-1t0q9ja">Supplier:</b> ${escape(supplierId)}` : ``} ${shade ? `<b data-svelte-h="svelte-oefi32">· Shade:</b> ${escape(shade)}` : ``} ${size ? `<b data-svelte-h="svelte-efrvbg">· Size:</b> ${escape(size)}` : ``} ${qty ? `<b data-svelte-h="svelte-1hnc0qa">· Qty(t):</b> ${escape(qty)}` : ``}</div>` : ``} ${form?.error ? `<div class="error-message"><strong data-svelte-h="svelte-1s1dywc">Error:</strong> ${escape(form.error)} ${form.detail ? `<br><small>${escape(form.detail)}</small>` : ``}</div>` : ``} <form method="POST" class="form compact">  <div class="row"><label for="supplierId" data-svelte-h="svelte-1jcqmh8">Supplier ID</label> <input id="supplierId" name="supplierId" type="number" min="1" step="1"${add_attribute("value", supplierId, 0)} readonly required></div>  <div class="row"><label for="shade" data-svelte-h="svelte-10je3rk">Shade</label> <input id="shade" name="shade" type="text"${add_attribute("value", shade, 0)} readonly required></div>  <div class="row"><label for="size" data-svelte-h="svelte-1hoau7q">Size</label> <input id="size" name="size" type="text"${add_attribute("value", size, 0)} readonly required></div>  <div class="row"><label for="qty" data-svelte-h="svelte-1qzs4cc">Quantity (t)</label> <input id="qty" name="qty" type="number" min="0.01" step="0.01"${add_attribute("value", qty, 0)} required></div>  <div class="row"><label for="ht" data-svelte-h="svelte-f7tvhb">HT (optional)</label> <input id="ht" name="ht" type="number" step="0.01" placeholder="e.g. 6"${add_attribute("value", ht, 0)}></div> <div class="row"><label for="wastage" data-svelte-h="svelte-1ru6sfz">Wastage (optional)</label> <input id="wastage" name="wastage" type="number" step="0.01" placeholder="e.g. 0.25"${add_attribute("value", wastage, 0)}></div> <div class="actions"><button type="submit" class="primary" ${""}>${escape("Post Sort")}</button></div></form>`;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-BzTcMh-s.js.map
