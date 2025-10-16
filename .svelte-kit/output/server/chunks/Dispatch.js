import { c as create_ssr_component, d as subscribe, b as escape, a as add_attribute } from "./ssr.js";
import { p as page } from "./stores.js";
import "@sveltejs/kit/internal";
import "./exports.js";
import "./state.svelte.js";
const css = {
  code: ".wrap.svelte-jf19yt{max-width:720px;margin:0 auto;display:grid;gap:0.75rem}h1.svelte-jf19yt{margin:0.25rem 0 0}.lane.svelte-jf19yt{opacity:0.8;margin:0}.banner.error.svelte-jf19yt{background:#3b0e0e;color:#f8d7da;padding:0.5rem 0.75rem;border-radius:6px}.hint.svelte-jf19yt{font-size:0.95rem;opacity:0.9}.grid.svelte-jf19yt{display:grid;grid-template-columns:repeat(3,1fr);gap:0.5rem}.kv.svelte-jf19yt{background:rgba(255,255,255,0.04);padding:0.5rem 0.75rem;border-radius:6px}.kv-key.svelte-jf19yt{font-size:0.8rem;opacity:0.7;margin-bottom:0.1rem}.form.svelte-jf19yt{display:grid;gap:0.5rem;margin-top:0.25rem}input.svelte-jf19yt{width:100%}button[disabled].svelte-jf19yt{opacity:0.6;cursor:not-allowed}",
  map: `{"version":3,"file":"Dispatch.svelte","sources":["Dispatch.svelte"],"sourcesContent":["<!-- /src/lib/components/Dispatch.svelte -->\\n<script>\\n    import { page } from '$app/stores';\\n    import { goto } from '$app/navigation';\\n  \\n    export let lane = { fromMmaCode: '', toMmaCode: '', redirectTo: '/' };\\n    export let onHand = null;        // number | null\\n    export let showAmount = false;   // optional money field\\n  \\n    let posting = false;\\n    let errorMsg = '';\\n  \\n    // URL-derived fields (read-only identity)\\n    $: sp            = $page.url.searchParams;\\n    $: supplierIdStr = sp.get('supplierId') || '';\\n    $: shade         = sp.get('shade') || '';\\n    $: size          = sp.get('size') || '';\\n    $: qtyStr        = sp.get('qty') || '';\\n    $: amountStr     = sp.get('amount');\\n  \\n    const supplierId = () => (supplierIdStr ? Number(supplierIdStr) : NaN);\\n  \\n    // Editable inputs\\n    let qty = 1;\\n    $: if (qtyStr && Number.isFinite(Number(qtyStr)) && Number(qtyStr) > 0) qty = Number(qtyStr);\\n  \\n    let amount = '';\\n    $: if (amountStr != null && Number.isFinite(Number(amountStr))) amount = Number(amountStr);\\n  \\n    // Missing guard (single reactive block avoids undefined 'missing')\\n    let missing = [];\\n    $: {\\n      missing = [];\\n      if (!supplierIdStr) missing.push('supplierId');\\n      if (!shade)         missing.push('shade');\\n      if (!size)          missing.push('size');\\n    }\\n  \\n    async function submit() {\\n      errorMsg = '';\\n  \\n      if (missing.length) {\\n        errorMsg = \`Missing \${missing.join(', ')} in URL. Open this from the \${lane.fromMmaCode} slots page.\`;\\n        return;\\n      }\\n      if (!Number.isFinite(qty) || qty <= 0) {\\n        errorMsg = 'Enter a valid quantity (> 0).';\\n        return;\\n      }\\n      if (onHand != null && qty > onHand) {\\n        errorMsg = \`Insufficient stock at \${lane.fromMmaCode} (available=\${onHand}, requested=\${qty}).\`;\\n        return;\\n      }\\n  \\n      const params = new URLSearchParams({\\n        fromMmaCode: lane.fromMmaCode,\\n        toMmaCode:   lane.toMmaCode,\\n        supplierId:  String(supplierId()),\\n        shade,\\n        size,\\n        qty:         String(qty)\\n      });\\n      if (showAmount && amount !== '' && Number.isFinite(Number(amount))) {\\n        params.set('amount', String(Number(amount)));\\n      }\\n  \\n      posting = true;\\n      try {\\n        const res  = await fetch(\`/api/dispatch?\${params.toString()}\`, { method: 'POST' });\\n        const json = await res.json();\\n        if (!json.ok) throw new Error(json.error || 'Unknown error');\\n        await goto(lane.redirectTo);\\n      } catch (e) {\\n        errorMsg = \`Dispatch failed — \${e.message}\`;\\n      } finally {\\n        posting = false;\\n      }\\n    }\\n  <\/script>\\n  \\n  <section class=\\"wrap\\">\\n    <h1>Dispatch — {lane.fromMmaCode} → {lane.toMmaCode}</h1>\\n    <p class=\\"lane\\">Lane: {lane.fromMmaCode} → {lane.toMmaCode}</p>\\n  \\n    {#if missing.length}\\n      <p class=\\"banner error\\">Missing supplierId, shade, or size in URL. Open this from the {lane.fromMmaCode} slots page.</p>\\n    {/if}\\n    {#if errorMsg}\\n      <p class=\\"banner error\\">{errorMsg}</p>\\n    {/if}\\n    {#if onHand != null}\\n      <p class=\\"hint\\">On hand at {lane.fromMmaCode}: {onHand} t</p>\\n    {/if}\\n  \\n    <div class=\\"grid\\">\\n      <div class=\\"kv\\"><div class=\\"kv-key\\">Supplier ID</div><div class=\\"kv-val\\">{supplierIdStr}</div></div>\\n      <div class=\\"kv\\"><div class=\\"kv-key\\">Shade</div><div class=\\"kv-val\\">{shade}</div></div>\\n      <div class=\\"kv\\"><div class=\\"kv-key\\">Size</div><div class=\\"kv-val\\">{size}</div></div>\\n    </div>\\n  \\n    <form on:submit|preventDefault={submit} class=\\"form\\">\\n      <label for=\\"qty\\">Quantity (t)</label>\\n      <input id=\\"qty\\" type=\\"number\\" bind:value={qty} min=\\"0.0001\\" step=\\"any\\" required />\\n  \\n      {#if showAmount}\\n        <label for=\\"amount\\">Amount (optional)</label>\\n        <input id=\\"amount\\" type=\\"number\\" bind:value={amount} min=\\"0\\" step=\\"any\\" />\\n      {/if}\\n  \\n      <button type=\\"submit\\" disabled={posting || missing.length > 0}>Dispatch</button>\\n    </form>\\n  </section>\\n  \\n  <style>\\n    .wrap { max-width: 720px; margin: 0 auto; display: grid; gap: 0.75rem; }\\n    h1 { margin: 0.25rem 0 0; }\\n    .lane { opacity: 0.8; margin: 0; }\\n    .banner.error { background: #3b0e0e; color: #f8d7da; padding: 0.5rem 0.75rem; border-radius: 6px; }\\n    .hint { font-size: 0.95rem; opacity: 0.9; }\\n    .grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 0.5rem; }\\n    .kv { background: rgba(255,255,255,0.04); padding: 0.5rem 0.75rem; border-radius: 6px; }\\n    .kv-key { font-size: 0.8rem; opacity: 0.7; margin-bottom: 0.1rem; }\\n    .form { display: grid; gap: 0.5rem; margin-top: 0.25rem; }\\n    input { width: 100%; }\\n    button[disabled] { opacity: 0.6; cursor: not-allowed; }\\n  </style>\\n  "],"names":[],"mappings":"AAkHI,mBAAM,CAAE,SAAS,CAAE,KAAK,CAAE,MAAM,CAAE,CAAC,CAAC,IAAI,CAAE,OAAO,CAAE,IAAI,CAAE,GAAG,CAAE,OAAS,CACvE,gBAAG,CAAE,MAAM,CAAE,OAAO,CAAC,CAAC,CAAC,CAAG,CAC1B,mBAAM,CAAE,OAAO,CAAE,GAAG,CAAE,MAAM,CAAE,CAAG,CACjC,OAAO,oBAAO,CAAE,UAAU,CAAE,OAAO,CAAE,KAAK,CAAE,OAAO,CAAE,OAAO,CAAE,MAAM,CAAC,OAAO,CAAE,aAAa,CAAE,GAAK,CAClG,mBAAM,CAAE,SAAS,CAAE,OAAO,CAAE,OAAO,CAAE,GAAK,CAC1C,mBAAM,CAAE,OAAO,CAAE,IAAI,CAAE,qBAAqB,CAAE,OAAO,CAAC,CAAC,GAAG,CAAC,CAAE,GAAG,CAAE,MAAQ,CAC1E,iBAAI,CAAE,UAAU,CAAE,KAAK,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,IAAI,CAAC,CAAE,OAAO,CAAE,MAAM,CAAC,OAAO,CAAE,aAAa,CAAE,GAAK,CACvF,qBAAQ,CAAE,SAAS,CAAE,MAAM,CAAE,OAAO,CAAE,GAAG,CAAE,aAAa,CAAE,MAAQ,CAClE,mBAAM,CAAE,OAAO,CAAE,IAAI,CAAE,GAAG,CAAE,MAAM,CAAE,UAAU,CAAE,OAAS,CACzD,mBAAM,CAAE,KAAK,CAAE,IAAM,CACrB,MAAM,CAAC,QAAQ,eAAE,CAAE,OAAO,CAAE,GAAG,CAAE,MAAM,CAAE,WAAa"}`
};
const Dispatch = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let sp;
  let supplierIdStr;
  let shade;
  let size;
  let qtyStr;
  let amountStr;
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  let { lane = {
    fromMmaCode: "",
    toMmaCode: "",
    redirectTo: "/"
  } } = $$props;
  let { onHand = null } = $$props;
  let { showAmount = false } = $$props;
  let qty = 1;
  let amount = "";
  let missing = [];
  if ($$props.lane === void 0 && $$bindings.lane && lane !== void 0) $$bindings.lane(lane);
  if ($$props.onHand === void 0 && $$bindings.onHand && onHand !== void 0) $$bindings.onHand(onHand);
  if ($$props.showAmount === void 0 && $$bindings.showAmount && showAmount !== void 0) $$bindings.showAmount(showAmount);
  $$result.css.add(css);
  sp = $page.url.searchParams;
  supplierIdStr = sp.get("supplierId") || "";
  shade = sp.get("shade") || "";
  size = sp.get("size") || "";
  qtyStr = sp.get("qty") || "";
  amountStr = sp.get("amount");
  {
    if (qtyStr && Number.isFinite(Number(qtyStr)) && Number(qtyStr) > 0) qty = Number(qtyStr);
  }
  {
    if (amountStr != null && Number.isFinite(Number(amountStr))) amount = Number(amountStr);
  }
  {
    {
      missing = [];
      if (!supplierIdStr) missing.push("supplierId");
      if (!shade) missing.push("shade");
      if (!size) missing.push("size");
    }
  }
  $$unsubscribe_page();
  return `  <section class="wrap svelte-jf19yt"><h1 class="svelte-jf19yt">Dispatch — ${escape(lane.fromMmaCode)} → ${escape(lane.toMmaCode)}</h1> <p class="lane svelte-jf19yt">Lane: ${escape(lane.fromMmaCode)} → ${escape(lane.toMmaCode)}</p> ${missing.length ? `<p class="banner error svelte-jf19yt">Missing supplierId, shade, or size in URL. Open this from the ${escape(lane.fromMmaCode)} slots page.</p>` : ``} ${``} ${onHand != null ? `<p class="hint svelte-jf19yt">On hand at ${escape(lane.fromMmaCode)}: ${escape(onHand)} t</p>` : ``} <div class="grid svelte-jf19yt"><div class="kv svelte-jf19yt"><div class="kv-key svelte-jf19yt" data-svelte-h="svelte-w90i29">Supplier ID</div><div class="kv-val">${escape(supplierIdStr)}</div></div> <div class="kv svelte-jf19yt"><div class="kv-key svelte-jf19yt" data-svelte-h="svelte-4lhxt1">Shade</div><div class="kv-val">${escape(shade)}</div></div> <div class="kv svelte-jf19yt"><div class="kv-key svelte-jf19yt" data-svelte-h="svelte-1ogvzm1">Size</div><div class="kv-val">${escape(size)}</div></div></div> <form class="form svelte-jf19yt"><label for="qty" data-svelte-h="svelte-1qzs4cc">Quantity (t)</label> <input id="qty" type="number" min="0.0001" step="any" required class="svelte-jf19yt"${add_attribute("value", qty, 0)}> ${showAmount ? `<label for="amount" data-svelte-h="svelte-ragfxr">Amount (optional)</label> <input id="amount" type="number" min="0" step="any" class="svelte-jf19yt"${add_attribute("value", amount, 0)}>` : ``} <button type="submit" ${missing.length > 0 ? "disabled" : ""} class="svelte-jf19yt">Dispatch</button></form> </section>`;
});
export {
  Dispatch as D
};
