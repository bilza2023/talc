import { c as create_ssr_component, b as escape, v as validate_component, a as add_attribute } from "../../../../chunks/ssr.js";
/* empty css                        */
import { L as ListTable } from "../../../../chunks/ListTable.js";
const css = {
  code: '.title.svelte-1bwqt3l{text-align:center;margin:.5rem 0 1rem;color:var(--primaryText)}.pager.svelte-1bwqt3l{display:flex;justify-content:center;align-items:center;gap:.75rem;padding:.75rem 0}.btn.svelte-1bwqt3l{padding:.4rem .7rem;border:1px solid var(--borderColor,#2b3a36);border-radius:var(--radiusMd,10px);text-decoration:none;color:var(--primaryText,#e6ebf1);background:var(--surfaceColor,#0f1a16)}.btn[aria-disabled="true"].svelte-1bwqt3l{opacity:.5;pointer-events:none}td[data-col-id="transport"]{font-family:var(--mono, ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace);font-size:.85em;opacity:.8;letter-spacing:.2px}@media(max-width: 640px){th[data-col-id="transport"],td[data-col-id="transport"]{display:none}}',
  map: `{"version":3,"file":"+page.svelte","sources":["+page.svelte"],"sourcesContent":["<script>\\n  import '$lib/styles/tokens.css';\\n  import { browser } from '$app/environment';\\n  import { onMount } from 'svelte';\\n  import ListTable from '$lib/listTable/ListTable.svelte';\\n\\n  export let data;\\n  const { envelope } = data ?? {};\\n\\n  const rows   = envelope?.rows ?? [];\\n  const paging = envelope?.paging ?? { page: 1, pageSize: rows.length || 0, hasPrev: false, hasNext: false };\\n\\n  // S.No should stay continuous across pages\\n  const baseIndex = ((paging.page || 1) - 1) * (paging.pageSize || 0);\\n\\n  // Supplier id -> name map (fetched once; no server changes required)\\n  let supplierMap = new Map();\\n  onMount(async () => {\\n    try {\\n      const res = await fetch('/api/suppliers');\\n      const list = await res.json(); // expects [{id, name, code}, ...]\\n      supplierMap = new Map(list.map(s => [Number(s.id), String(s.name || s.code || s.id)]));\\n    } catch {\\n      // fail silently; fallback to showing the numeric id\\n      supplierMap = new Map();\\n    }\\n  });\\n\\n  // build items for ListTable; reacts when supplierMap updates\\n  let items = [];\\n  $: items = rows.map((r, i) => {\\n    const supplierName = supplierMap.get(Number(r.supplierId)) ?? String(r.supplierId);\\n    const fullId = String(r.transportId);\\n    const shortId = fullId.slice(0, 8); // tiny visual footprint\\n    return {\\n      sNo: baseIndex + i + 1,\\n      date: r.date,                      // ListTable kind:'date' handles formatting\\n      transportId: fullId,               // keep full (search)\\n      transportShort: shortId,           // display small\\n      lane: r.lane,\\n      supplier: supplierName,            // show NAME instead of ID\\n      shade: r.shade || '—',\\n      size: r.size || '—',\\n      qty: Number(r.qty ?? 0),\\n      amount: Number(r.amount ?? 0)\\n    };\\n  });\\n\\n  // ListTable columns (compact Txn, supplier name shown)\\n  const columns = [\\n    { id:'sNo',        label:'S.No',      accessor:'sNo',            kind:'number',  sortable:true, width:'70px' },\\n    { id:'date',       label:'Date',      accessor:'date',           kind:'date',    sortable:true, format:'datetime', width:'180px' },\\n    { id:'transport',  label:'Txn',       accessor:'transportShort', kind:'text',    sortable:true, width:'90px', align:'center', titleKey:'transportId' },\\n    { id:'lane',       label:'Lane',      accessor:'lane',           kind:'text',    sortable:true },\\n    { id:'supplier',   label:'Supplier',  accessor:'supplier',       kind:'text',    sortable:true, align:'center', width:'160px' },\\n    { id:'shade',      label:'Shade',     accessor:'shade',          kind:'badge',   sortable:true, align:'center', width:'110px' },\\n    { id:'size',       label:'Size',      accessor:'size',           kind:'badge',   sortable:true, align:'center', width:'110px' },\\n    { id:'qty',        label:'Qty',       accessor:'qty',            kind:'number',  sortable:true, align:'right',  width:'110px' },\\n    { id:'amount',     label:'Amount',    accessor:'amount',         kind:'number',  sortable:true, align:'right',  width:'120px' }\\n  ];\\n\\n  // fields to search (include full transportId for deep search)\\n  const searchKeys = ['transportId','lane','supplier','shade','size'];\\n\\n  // preserve existing query params and only tweak what's passed\\n  function q(obj) {\\n    const u = new URLSearchParams(browser ? window.location.search : '');\\n    Object.entries(obj).forEach(([k, v]) =>\\n      (v === '' || v == null) ? u.delete(k) : u.set(k, String(v))\\n    );\\n    const s = u.toString();\\n    return s ? \`?\${s}\` : '';\\n  }\\n<\/script>\\n\\n<h1 class=\\"title\\">{envelope?.meta?.title}</h1>\\n\\n<ListTable\\n  items={items}\\n  columns={columns}\\n  rowKey=\\"transportId\\"\\n  searchable={true}\\n  searchKeys={searchKeys}\\n/>\\n\\n<nav class=\\"pager\\">\\n  <a class=\\"btn\\" aria-disabled={!paging.hasPrev} href={paging.hasPrev ? q({ page: paging.page - 1 }) : undefined}>Prev</a>\\n  <span class=\\"page\\">Page {paging.page}</span>\\n  <a class=\\"btn\\" aria-disabled={!paging.hasNext} href={paging.hasNext ? q({ page: paging.page + 1 }) : undefined}>Next</a>\\n</nav>\\n\\n<style>\\n  .title { text-align:center; margin: .5rem 0 1rem; color: var(--primaryText); }\\n\\n  /* keep pager as-is */\\n  .pager { display:flex; justify-content:center; align-items:center; gap:.75rem; padding:.75rem 0; }\\n  .btn { padding:.4rem .7rem; border:1px solid var(--borderColor,#2b3a36); border-radius: var(--radiusMd,10px);\\n         text-decoration:none; color: var(--primaryText,#e6ebf1); background: var(--surfaceColor,#0f1a16); }\\n  .btn[aria-disabled=\\"true\\"] { opacity:.5; pointer-events:none; }\\n\\n  /* make Txn visually tiny & unobtrusive on small screens */\\n  :global(td[data-col-id=\\"transport\\"]) {\\n    font-family: var(--mono, ui-monospace, SFMono-Regular, Menlo, Consolas, \\"Liberation Mono\\", monospace);\\n    font-size: .85em;\\n    opacity: .8;\\n    letter-spacing: .2px;\\n  }\\n  @media (max-width: 640px) {\\n    :global(th[data-col-id=\\"transport\\"]), :global(td[data-col-id=\\"transport\\"]) {\\n      display: none; /* hide txn column on narrow screens */\\n    }\\n  }\\n</style>\\n"],"names":[],"mappings":"AA4FE,qBAAO,CAAE,WAAW,MAAM,CAAE,MAAM,CAAE,KAAK,CAAC,CAAC,CAAC,IAAI,CAAE,KAAK,CAAE,IAAI,aAAa,CAAG,CAG7E,qBAAO,CAAE,QAAQ,IAAI,CAAE,gBAAgB,MAAM,CAAE,YAAY,MAAM,CAAE,IAAI,MAAM,CAAE,QAAQ,MAAM,CAAC,CAAG,CACjG,mBAAK,CAAE,QAAQ,KAAK,CAAC,KAAK,CAAE,OAAO,GAAG,CAAC,KAAK,CAAC,IAAI,aAAa,CAAC,OAAO,CAAC,CAAE,aAAa,CAAE,IAAI,UAAU,CAAC,IAAI,CAAC,CACrG,gBAAgB,IAAI,CAAE,KAAK,CAAE,IAAI,aAAa,CAAC,OAAO,CAAC,CAAE,UAAU,CAAE,IAAI,cAAc,CAAC,OAAO,CAAG,CACzG,IAAI,CAAC,aAAa,CAAC,MAAM,gBAAE,CAAE,QAAQ,EAAE,CAAE,eAAe,IAAM,CAGtD,2BAA6B,CACnC,WAAW,CAAE,IAAI,MAAM,CAAC,4EAA4E,CAAC,CACrG,SAAS,CAAE,KAAK,CAChB,OAAO,CAAE,EAAE,CACX,cAAc,CAAE,IAClB,CACA,MAAO,YAAY,KAAK,CAAE,CAChB,2BAA4B,CAAU,2BAA6B,CACzE,OAAO,CAAE,IACX,CACF"}`
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  const { envelope } = data ?? {};
  const rows = envelope?.rows ?? [];
  const paging = envelope?.paging ?? {
    page: 1,
    pageSize: rows.length || 0,
    hasPrev: false,
    hasNext: false
  };
  const baseIndex = ((paging.page || 1) - 1) * (paging.pageSize || 0);
  let supplierMap = /* @__PURE__ */ new Map();
  let items = [];
  const columns = [
    {
      id: "sNo",
      label: "S.No",
      accessor: "sNo",
      kind: "number",
      sortable: true,
      width: "70px"
    },
    {
      id: "date",
      label: "Date",
      accessor: "date",
      kind: "date",
      sortable: true,
      format: "datetime",
      width: "180px"
    },
    {
      id: "transport",
      label: "Txn",
      accessor: "transportShort",
      kind: "text",
      sortable: true,
      width: "90px",
      align: "center",
      titleKey: "transportId"
    },
    {
      id: "lane",
      label: "Lane",
      accessor: "lane",
      kind: "text",
      sortable: true
    },
    {
      id: "supplier",
      label: "Supplier",
      accessor: "supplier",
      kind: "text",
      sortable: true,
      align: "center",
      width: "160px"
    },
    {
      id: "shade",
      label: "Shade",
      accessor: "shade",
      kind: "badge",
      sortable: true,
      align: "center",
      width: "110px"
    },
    {
      id: "size",
      label: "Size",
      accessor: "size",
      kind: "badge",
      sortable: true,
      align: "center",
      width: "110px"
    },
    {
      id: "qty",
      label: "Qty",
      accessor: "qty",
      kind: "number",
      sortable: true,
      align: "right",
      width: "110px"
    },
    {
      id: "amount",
      label: "Amount",
      accessor: "amount",
      kind: "number",
      sortable: true,
      align: "right",
      width: "120px"
    }
  ];
  const searchKeys = ["transportId", "lane", "supplier", "shade", "size"];
  function q(obj) {
    const u = new URLSearchParams("");
    Object.entries(obj).forEach(([k, v]) => v === "" || v == null ? u.delete(k) : u.set(k, String(v)));
    const s = u.toString();
    return s ? `?${s}` : "";
  }
  if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
  $$result.css.add(css);
  items = rows.map((r, i) => {
    const supplierName = supplierMap.get(Number(r.supplierId)) ?? String(r.supplierId);
    const fullId = String(r.transportId);
    const shortId = fullId.slice(0, 8);
    return {
      sNo: baseIndex + i + 1,
      date: r.date,
      // ListTable kind:'date' handles formatting
      transportId: fullId,
      // keep full (search)
      transportShort: shortId,
      // display small
      lane: r.lane,
      supplier: supplierName,
      // show NAME instead of ID
      shade: r.shade || "—",
      size: r.size || "—",
      qty: Number(r.qty ?? 0),
      amount: Number(r.amount ?? 0)
    };
  });
  return `<h1 class="title svelte-1bwqt3l">${escape(envelope?.meta?.title)}</h1> ${validate_component(ListTable, "ListTable").$$render(
    $$result,
    {
      items,
      columns,
      rowKey: "transportId",
      searchable: true,
      searchKeys
    },
    {},
    {}
  )} <nav class="pager svelte-1bwqt3l"><a class="btn svelte-1bwqt3l"${add_attribute("aria-disabled", !paging.hasPrev, 0)}${add_attribute(
    "href",
    paging.hasPrev ? q({ page: paging.page - 1 }) : void 0,
    0
  )}>Prev</a> <span class="page">Page ${escape(paging.page)}</span> <a class="btn svelte-1bwqt3l"${add_attribute("aria-disabled", !paging.hasNext, 0)}${add_attribute(
    "href",
    paging.hasNext ? q({ page: paging.page + 1 }) : void 0,
    0
  )}>Next</a> </nav>`;
});
export {
  Page as default
};
