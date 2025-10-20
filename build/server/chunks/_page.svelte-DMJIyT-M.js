import { c as create_ssr_component, v as validate_component, f as escape } from './ssr-YOuSP3iu.js';
import { L as ListTable } from './ListTable-CIuW0_LK.js';
import { H as H1 } from './H1-Cb-Xstks.js';

const css = {
  code: ".wrap.svelte-1ex8ar0{margin-inline:auto;padding:1rem;width:min(96vw, 1200px);color:var(--primaryText)}.page-title.svelte-1ex8ar0{margin:0 0 .75rem 0;font-size:1.25rem;color:var(--primaryText)}",
  map: `{"version":3,"file":"+page.svelte","sources":["+page.svelte"],"sourcesContent":["<script>\\n  \\n  import ListTable from '$lib/listTable/ListTable.svelte';\\n  import H1 from '$lib/components/H1.svelte';\\n\\n  export let data;\\n\\n  const title = data?.title ?? 'Purchase Ledger';\\n  const items = data?.items ?? []; // flat, normalized rows from loader\\n\\n  // Columns must match accessors on items (see ListTable docs)\\n  const columns = [\\n    { id:'docDate',  label:'Date',        accessor:'docDate',        kind:'date',   format:'date',  sortable:true,  width:'120px' },\\n    { id:'supplier', label:'Supplier',    accessor:'supplierName',   kind:'text',   primary:true,   sortable:true },\\n    { id:'mma',      label:'MMA',         accessor:'toMmaCode',      kind:'badge',  sortable:true,  align:'center', width:'110px' },\\n    { id:'shade',    label:'Shade',       accessor:'shade',          kind:'badge',  sortable:true,  align:'center', width:'110px' },\\n    { id:'size',     label:'Size',        accessor:'size',           kind:'badge',  sortable:true,  align:'center', width:'110px' },\\n    { id:'qty',      label:'Qty (t)',     accessor:'quantity',       kind:'number', sortable:true,  align:'right',  width:'110px' },\\n\\n    // Commercials (optional)\\n    { id:'rate',     label:'Rate/MT',     accessor:'ratePerMt',      kind:'number', sortable:true,  align:'right',  width:'110px' },\\n    { id:'frt',      label:'Freight/MT',  accessor:'freightPerMt',   kind:'number', sortable:true,  align:'right',  width:'120px' },\\n    { id:'sfrt',     label:'Supp. Frt',   accessor:'supplierFreight',kind:'number', sortable:true,  align:'right',  width:'120px' },\\n    { id:'road',     label:'Road Exp',    accessor:'roadExp',        kind:'number', sortable:true,  align:'right',  width:'110px' },\\n    { id:'cash',     label:'Cash Paid',   accessor:'cashPaid',       kind:'number', sortable:true,  align:'right',  width:'110px' },\\n\\n    { id:'pmode',    label:'Payment',     accessor:'paymentMode',    kind:'text',   align:'center', width:'120px' },\\n    { id:'remarks',  label:'Remarks',     accessor:'remarks',        kind:'text' }\\n  ];\\n<\/script>\\n\\n<H1 text={title} />\\n<section class=\\"wrap\\">\\n  <h1 class=\\"page-title\\">{title}</h1>\\n\\n  <ListTable\\n    items={items}\\n    columns={columns}\\n    rowKey=\\"id\\"\\n    searchable={true}\\n    thumbBaseUrl=\\"\\"\\n    emptyMessage=\\"No purchases found\\"\\n  />\\n</section>\\n\\n<style>\\n  .wrap {\\n    margin-inline: auto;\\n    padding: 1rem;\\n    width: min(96vw, 1200px);\\n    color: var(--primaryText);\\n  }\\n  .page-title {\\n    margin: 0 0 .75rem 0;\\n    font-size: 1.25rem;\\n    color: var(--primaryText);\\n  }\\n</style>\\n"],"names":[],"mappings":"AA8CE,oBAAM,CACJ,aAAa,CAAE,IAAI,CACnB,OAAO,CAAE,IAAI,CACb,KAAK,CAAE,IAAI,IAAI,CAAC,CAAC,MAAM,CAAC,CACxB,KAAK,CAAE,IAAI,aAAa,CAC1B,CACA,0BAAY,CACV,MAAM,CAAE,CAAC,CAAC,CAAC,CAAC,MAAM,CAAC,CAAC,CACpB,SAAS,CAAE,OAAO,CAClB,KAAK,CAAE,IAAI,aAAa,CAC1B"}`
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  const title = data?.title ?? "Purchase Ledger";
  const items = data?.items ?? [];
  const columns = [
    {
      id: "docDate",
      label: "Date",
      accessor: "docDate",
      kind: "date",
      format: "date",
      sortable: true,
      width: "120px"
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
      id: "mma",
      label: "MMA",
      accessor: "toMmaCode",
      kind: "badge",
      sortable: true,
      align: "center",
      width: "110px"
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
      accessor: "quantity",
      kind: "number",
      sortable: true,
      align: "right",
      width: "110px"
    },
    // Commercials (optional)
    {
      id: "rate",
      label: "Rate/MT",
      accessor: "ratePerMt",
      kind: "number",
      sortable: true,
      align: "right",
      width: "110px"
    },
    {
      id: "frt",
      label: "Freight/MT",
      accessor: "freightPerMt",
      kind: "number",
      sortable: true,
      align: "right",
      width: "120px"
    },
    {
      id: "sfrt",
      label: "Supp. Frt",
      accessor: "supplierFreight",
      kind: "number",
      sortable: true,
      align: "right",
      width: "120px"
    },
    {
      id: "road",
      label: "Road Exp",
      accessor: "roadExp",
      kind: "number",
      sortable: true,
      align: "right",
      width: "110px"
    },
    {
      id: "cash",
      label: "Cash Paid",
      accessor: "cashPaid",
      kind: "number",
      sortable: true,
      align: "right",
      width: "110px"
    },
    {
      id: "pmode",
      label: "Payment",
      accessor: "paymentMode",
      kind: "text",
      align: "center",
      width: "120px"
    },
    {
      id: "remarks",
      label: "Remarks",
      accessor: "remarks",
      kind: "text"
    }
  ];
  if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
  $$result.css.add(css);
  return `${validate_component(H1, "H1").$$render($$result, { text: title }, {}, {})} <section class="wrap svelte-1ex8ar0"><h1 class="page-title svelte-1ex8ar0">${escape(title)}</h1> ${validate_component(ListTable, "ListTable").$$render(
    $$result,
    {
      items,
      columns,
      rowKey: "id",
      searchable: true,
      thumbBaseUrl: "",
      emptyMessage: "No purchases found"
    },
    {},
    {}
  )} </section>`;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-DMJIyT-M.js.map
