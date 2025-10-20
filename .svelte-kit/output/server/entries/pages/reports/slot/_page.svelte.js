import { c as create_ssr_component, b as escape, v as validate_component } from "../../../../chunks/ssr.js";
/* empty css                        */
import { L as ListTable } from "../../../../chunks/ListTable.js";
const css = {
  code: ".wrap.svelte-o5kz1l{margin-inline:auto;padding:1rem;width:min(96vw, 1100px);color:var(--primaryText)}.page-title.svelte-o5kz1l{margin:0 0 .75rem 0;font-size:1.25rem;color:var(--primaryText)}",
  map: `{"version":3,"file":"+page.svelte","sources":["+page.svelte"],"sourcesContent":["<script>\\n  import '$lib/styles/tokens.css';\\n  import ListTable from '$lib/listTable/ListTable.svelte';\\n\\n  export let data;\\n\\n  const title = data?.title ?? 'Stock — Slots by MMA';\\n  const items = data?.items ?? []; // [{ id, mmaCode, supplierId, supplierName, shade, size, qty }]\\n\\n  // Columns must match accessors on items (ListTable docs)\\n  const columns = [\\n    { id:'mma',      label:'MMA',       accessor:'mmaCode',     kind:'badge',  sortable:true, align:'center', width:'140px' },\\n    { id:'supplier', label:'Supplier',  accessor:'supplierName',kind:'text',   primary:true,  sortable:true },\\n    { id:'shade',    label:'Shade',     accessor:'shade',       kind:'badge',  sortable:true, align:'center', width:'110px' },\\n    { id:'size',     label:'Size',      accessor:'size',        kind:'badge',  sortable:true, align:'center', width:'110px' },\\n    { id:'qty',      label:'Qty (t)',   accessor:'qty',         kind:'number', sortable:true, align:'right',  width:'120px' }\\n  ];\\n\\n  // Search should include non-text badges too (mmaCode, shade, size)\\n  const searchKeys = ['supplierName','mmaCode','shade','size'];\\n<\/script>\\n\\n<section class=\\"wrap\\">\\n  <h1 class=\\"page-title\\">{title}</h1>\\n\\n  <ListTable\\n    items={items}\\n    columns={columns}\\n    rowKey=\\"id\\"\\n    searchable={true}\\n    searchKeys={searchKeys}\\n    emptyMessage=\\"No stock slots found\\"\\n  />\\n</section>\\n\\n<style>\\n  .wrap {\\n    margin-inline: auto;\\n    padding: 1rem;\\n    width: min(96vw, 1100px);\\n    color: var(--primaryText);\\n  }\\n  .page-title {\\n    margin: 0 0 .75rem 0;\\n    font-size: 1.25rem;\\n    color: var(--primaryText);\\n  }\\n</style>"],"names":[],"mappings":"AAoCE,mBAAM,CACJ,aAAa,CAAE,IAAI,CACnB,OAAO,CAAE,IAAI,CACb,KAAK,CAAE,IAAI,IAAI,CAAC,CAAC,MAAM,CAAC,CACxB,KAAK,CAAE,IAAI,aAAa,CAC1B,CACA,yBAAY,CACV,MAAM,CAAE,CAAC,CAAC,CAAC,CAAC,MAAM,CAAC,CAAC,CACpB,SAAS,CAAE,OAAO,CAClB,KAAK,CAAE,IAAI,aAAa,CAC1B"}`
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  const title = data?.title ?? "Stock — Slots by MMA";
  const items = data?.items ?? [];
  const columns = [
    {
      id: "mma",
      label: "MMA",
      accessor: "mmaCode",
      kind: "badge",
      sortable: true,
      align: "center",
      width: "140px"
    },
    {
      id: "supplier",
      label: "Supplier",
      accessor: "supplierName",
      kind: "text",
      primary: true,
      sortable: true
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
      label: "Qty (t)",
      accessor: "qty",
      kind: "number",
      sortable: true,
      align: "right",
      width: "120px"
    }
  ];
  const searchKeys = ["supplierName", "mmaCode", "shade", "size"];
  if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
  $$result.css.add(css);
  return `<section class="wrap svelte-o5kz1l"><h1 class="page-title svelte-o5kz1l">${escape(title)}</h1> ${validate_component(ListTable, "ListTable").$$render(
    $$result,
    {
      items,
      columns,
      rowKey: "id",
      searchable: true,
      searchKeys,
      emptyMessage: "No stock slots found"
    },
    {},
    {}
  )} </section>`;
});
export {
  Page as default
};
