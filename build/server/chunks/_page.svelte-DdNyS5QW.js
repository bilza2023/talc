import { c as create_ssr_component, b as subscribe, f as escape, v as validate_component } from './ssr-YOuSP3iu.js';
import { p as page } from './stores-BEVufx3D.js';
import './exports-DKuYoYKl.js';
import './state.svelte-ChAriFL2.js';
import { L as ListTable } from './ListTable-CIuW0_LK.js';

const css = {
  code: "body{background:var(--backgroundColor,#0e0e10);color:var(--primaryText,#e5e5e5);overflow-x:hidden}.page-title.svelte-1inii9x{text-align:center;margin:0.75rem 0;font-size:1.4rem}.panel.svelte-1inii9x{background:var(--surfaceColor,#16161a);border:1px solid var(--borderColor,#2a2a2a);border-radius:12px;padding:0.75rem}.panel-head.svelte-1inii9x{display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem}.panel-title.svelte-1inii9x{margin:0;font-size:1rem}.pager.svelte-1inii9x{display:flex;gap:0.5rem;align-items:center}.btn.svelte-1inii9x{padding:0.4rem 0.7rem;border-radius:10px;border:1px solid var(--borderColor,#2a2a2a);background:var(--surfaceColor,#16161a);color:inherit;cursor:pointer}.muted.svelte-1inii9x{color:var(--mutedText,#9aa0a6)}",
  map: `{"version":3,"file":"+page.svelte","sources":["+page.svelte"],"sourcesContent":["<script>\\n  import { page } from '$app/stores';\\n  import { goto } from '$app/navigation';\\n  import ListTable from '$lib/listTable/ListTable.svelte';\\n\\n  export let data;\\n\\n  // reactive envelope & paging\\n  $: env = data.envelope;\\n  $: paging = env?.paging ?? { page: 1, totalPages: 1, hasPrev: false, hasNext: false };\\n\\n  // rows → items for ListTable\\n  $: items = (env?.rows ?? []).map(r => ({\\n    id: r.transportId,\\n    dateIso: new Date(r.date).toISOString(),\\n    transportId: r.transportId,\\n    lane: r.lane,\\n    qtyDispatch: r.qtyDispatch,\\n    qtyReceive: r.qtyReceive,\\n    qtyDelta: r.qtyDelta,\\n    amountDispatch: r.amountDispatch,\\n    amountReceive: r.amountReceive,\\n    amountDelta: r.amountDelta\\n  }));\\n\\n  // columns for ListTable\\n  const columns = [\\n    { id: 'date', label: 'Date', accessor: 'dateIso', kind: 'date', format: 'datetime', width: '180px' },\\n    { id: 'tid', label: 'TID', accessor: 'transportId', primary: true, width: '280px' },\\n    { id: 'lane', label: 'From → To', accessor: 'lane' },\\n    { id: 'qd', label: 'Qty Dispatch', accessor: 'qtyDispatch', align: 'right', width: '120px' },\\n    { id: 'qr', label: 'Qty Receive', accessor: 'qtyReceive', align: 'right', width: '120px' },\\n    { id: 'qDelta', label: 'Δ Qty', accessor: 'qtyDelta', align: 'right', width: '100px' },\\n    { id: 'ad', label: 'Amount D', accessor: 'amountDispatch', align: 'right', width: '120px' },\\n    { id: 'ar', label: 'Amount R', accessor: 'amountReceive', align: 'right', width: '120px' },\\n    { id: 'aDelta', label: 'Δ Amount', accessor: 'amountDelta', align: 'right', width: '120px' }\\n  ];\\n\\n  function changePage(n) {\\n    const u = new URL($page.url);\\n    u.searchParams.set('page', String(n));\\n    goto(\`\${u.pathname}?\${u.searchParams.toString()}\`);\\n  }\\n<\/script>\\n\\n<h1 class=\\"page-title\\">{env.meta.title}</h1>\\n\\n<section class=\\"panel\\">\\n  <div class=\\"panel-head\\">\\n    <h2 class=\\"panel-title\\">Dispatch vs Receive</h2>\\n    <div class=\\"pager\\">\\n      {#if paging.hasPrev}<button class=\\"btn\\" on:click={() => changePage(paging.page - 1)}>Prev</button>{/if}\\n      <span class=\\"muted\\">Page {paging.page} / {paging.totalPages}</span>\\n      {#if paging.hasNext}<button class=\\"btn\\" on:click={() => changePage(paging.page + 1)}>Next</button>{/if}\\n    </div>\\n  </div>\\n\\n  <!-- Enable search bar -->\\n  <ListTable\\n    items={items}\\n    columns={columns}\\n    rowKey=\\"id\\"\\n    searchable={true}             \\n    searchFields={['transportId','lane']}  \\n    searchPlaceholder=\\"Search TID or Lane...\\"\\n  />\\n\\n  {#if items.length === 0}\\n    <p class=\\"muted\\" style=\\"margin-top:.5rem\\">No matched dispatches.</p>\\n  {/if}\\n</section>\\n\\n<style>\\n  :global(body){background:var(--backgroundColor,#0e0e10);color:var(--primaryText,#e5e5e5);overflow-x:hidden;}\\n  .page-title{ text-align:center;margin:0.75rem 0;font-size:1.4rem; }\\n  .panel{ background:var(--surfaceColor,#16161a); border:1px solid var(--borderColor,#2a2a2a); border-radius:12px; padding:0.75rem; }\\n  .panel-head{ display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem; }\\n  .panel-title{ margin:0; font-size:1rem; }\\n  .pager{ display:flex; gap:0.5rem; align-items:center; }\\n  .btn{ padding:0.4rem 0.7rem; border-radius:10px; border:1px solid var(--borderColor,#2a2a2a); background:var(--surfaceColor,#16161a); color:inherit; cursor:pointer; }\\n  .muted{ color:var(--mutedText,#9aa0a6); }\\n</style>\\n"],"names":[],"mappings":"AAyEU,IAAK,CAAC,WAAW,IAAI,iBAAiB,CAAC,OAAO,CAAC,CAAC,MAAM,IAAI,aAAa,CAAC,OAAO,CAAC,CAAC,WAAW,MAAO,CAC3G,0BAAW,CAAE,WAAW,MAAM,CAAC,OAAO,OAAO,CAAC,CAAC,CAAC,UAAU,MAAQ,CAClE,qBAAM,CAAE,WAAW,IAAI,cAAc,CAAC,OAAO,CAAC,CAAE,OAAO,GAAG,CAAC,KAAK,CAAC,IAAI,aAAa,CAAC,OAAO,CAAC,CAAE,cAAc,IAAI,CAAE,QAAQ,OAAS,CAClI,0BAAW,CAAE,QAAQ,IAAI,CAAE,gBAAgB,aAAa,CAAE,YAAY,MAAM,CAAE,cAAc,MAAQ,CACpG,2BAAY,CAAE,OAAO,CAAC,CAAE,UAAU,IAAM,CACxC,qBAAM,CAAE,QAAQ,IAAI,CAAE,IAAI,MAAM,CAAE,YAAY,MAAQ,CACtD,mBAAI,CAAE,QAAQ,MAAM,CAAC,MAAM,CAAE,cAAc,IAAI,CAAE,OAAO,GAAG,CAAC,KAAK,CAAC,IAAI,aAAa,CAAC,OAAO,CAAC,CAAE,WAAW,IAAI,cAAc,CAAC,OAAO,CAAC,CAAE,MAAM,OAAO,CAAE,OAAO,OAAS,CACrK,qBAAM,CAAE,MAAM,IAAI,WAAW,CAAC,OAAO,CAAG"}`
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let env;
  let paging;
  let items;
  let $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => value);
  let { data } = $$props;
  const columns = [
    {
      id: "date",
      label: "Date",
      accessor: "dateIso",
      kind: "date",
      format: "datetime",
      width: "180px"
    },
    {
      id: "tid",
      label: "TID",
      accessor: "transportId",
      primary: true,
      width: "280px"
    },
    {
      id: "lane",
      label: "From → To",
      accessor: "lane"
    },
    {
      id: "qd",
      label: "Qty Dispatch",
      accessor: "qtyDispatch",
      align: "right",
      width: "120px"
    },
    {
      id: "qr",
      label: "Qty Receive",
      accessor: "qtyReceive",
      align: "right",
      width: "120px"
    },
    {
      id: "qDelta",
      label: "Δ Qty",
      accessor: "qtyDelta",
      align: "right",
      width: "100px"
    },
    {
      id: "ad",
      label: "Amount D",
      accessor: "amountDispatch",
      align: "right",
      width: "120px"
    },
    {
      id: "ar",
      label: "Amount R",
      accessor: "amountReceive",
      align: "right",
      width: "120px"
    },
    {
      id: "aDelta",
      label: "Δ Amount",
      accessor: "amountDelta",
      align: "right",
      width: "120px"
    }
  ];
  if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
  $$result.css.add(css);
  env = data.envelope;
  paging = env?.paging ?? {
    page: 1,
    totalPages: 1,
    hasPrev: false,
    hasNext: false
  };
  items = (env?.rows ?? []).map((r) => ({
    id: r.transportId,
    dateIso: new Date(r.date).toISOString(),
    transportId: r.transportId,
    lane: r.lane,
    qtyDispatch: r.qtyDispatch,
    qtyReceive: r.qtyReceive,
    qtyDelta: r.qtyDelta,
    amountDispatch: r.amountDispatch,
    amountReceive: r.amountReceive,
    amountDelta: r.amountDelta
  }));
  $$unsubscribe_page();
  return `<h1 class="page-title svelte-1inii9x">${escape(env.meta.title)}</h1> <section class="panel svelte-1inii9x"><div class="panel-head svelte-1inii9x"><h2 class="panel-title svelte-1inii9x" data-svelte-h="svelte-43txqc">Dispatch vs Receive</h2> <div class="pager svelte-1inii9x">${paging.hasPrev ? `<button class="btn svelte-1inii9x" data-svelte-h="svelte-17rta7f">Prev</button>` : ``} <span class="muted svelte-1inii9x">Page ${escape(paging.page)} / ${escape(paging.totalPages)}</span> ${paging.hasNext ? `<button class="btn svelte-1inii9x" data-svelte-h="svelte-mqk96l">Next</button>` : ``}</div></div>  ${validate_component(ListTable, "ListTable").$$render(
    $$result,
    {
      items,
      columns,
      rowKey: "id",
      searchable: true,
      searchFields: ["transportId", "lane"],
      searchPlaceholder: "Search TID or Lane..."
    },
    {},
    {}
  )} ${items.length === 0 ? `<p class="muted svelte-1inii9x" style="margin-top:.5rem" data-svelte-h="svelte-15kun2q">No matched dispatches.</p>` : ``} </section>`;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-DdNyS5QW.js.map
