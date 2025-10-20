import { c as create_ssr_component, f as escape, v as validate_component, d as add_attribute } from './ssr-YOuSP3iu.js';
import { L as ListTable } from './ListTable-CIuW0_LK.js';

const css = {
  code: ".wrap.svelte-eewbnl{padding:var(--spaceLg, 20px)}.title.svelte-eewbnl{margin:0 0 var(--spaceMd, 16px);font-size:1.25rem;color:var(--primaryText,#e6ebf1)}.pager.svelte-eewbnl{display:flex;align-items:center;gap:8px;margin-top:12px}.btn.svelte-eewbnl{padding:6px 10px;border:1px solid var(--borderColor,#2b3a36);border-radius:8px;text-decoration:none}.page.svelte-eewbnl{opacity:.8}.empty.svelte-eewbnl{margin-top:10px;color:var(--secondaryText)}",
  map: `{"version":3,"file":"+page.svelte","sources":["+page.svelte"],"sourcesContent":["<script>\\n  import '$lib/styles/tokens.css';\\n  import ListTable from '$lib/listTable/ListTable.svelte';\\n\\n  export let data;\\n  const envelope = data?.envelope ?? { rows: [], schema: { columns: [] }, paging: {} };\\n\\n  // ListTable expects \\"items\\" and {accessor, kind} columns\\n  const items = envelope.rows ?? [];\\n  const columns = [\\n    { id: 'createdAt',  label: 'Date',          accessor: 'createdAt',   kind: 'date',   format: 'datetime', sortable: true },\\n    { id: 'id',         label: 'ID',            accessor: 'id',          kind: 'number', align: 'right',     sortable: true },\\n    { id: 'qtyOutT',    label: 'Qty Out (t)',   accessor: 'qtyOutT',     kind: 'number', align: 'right',     sortable: true },\\n    { id: 'ht',         label: 'HT',            accessor: 'ht',          kind: 'number', align: 'right',     sortable: true },\\n    { id: 'wastage',    label: 'Wastage',       accessor: 'wastage',     kind: 'number', align: 'right',     sortable: true },\\n    { id: 'committed',  label: 'Committed',     accessor: 'committedAt', kind: 'date',   format: 'datetime', sortable: true },\\n    { id: 'status',     label: 'Status',        accessor: 'status',      kind: 'badge',                       sortable: true }\\n  ];\\n  const searchKeys = ['status'];\\n\\n  const paging = envelope.paging ?? { page: 1, hasPrev: false, hasNext: false };\\n  function q(obj = {}) {\\n    const u = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');\\n    Object.entries(obj).forEach(([k, v]) => (v === '' || v == null) ? u.delete(k) : u.set(k, String(v)));\\n    return \`?\${u.toString()}\`;\\n  }\\n<\/script>\\n\\n<section class=\\"wrap\\">\\n  <h1 class=\\"title\\">{envelope?.meta?.title ?? 'Sorting Runs'}</h1>\\n\\n  <ListTable\\n    items={items}\\n    columns={columns}\\n    rowKey=\\"id\\"\\n    searchable={true}\\n    {searchKeys}\\n  />\\n\\n  <nav class=\\"pager\\">\\n    {#if paging?.hasPrev}\\n      <a class=\\"btn\\" href={q({ page: (paging.page || 1) - 1 })}>← Prev</a>\\n    {/if}\\n    <span class=\\"page\\">Page {paging?.page || 1}</span>\\n    {#if paging?.hasNext}\\n      <a class=\\"btn\\" href={q({ page: (paging.page || 1) + 1 })}>Next →</a>\\n    {/if}\\n  </nav>\\n\\n  {#if !items?.length}\\n    <p class=\\"empty\\">Nothing here yet.</p>\\n  {/if}\\n</section>\\n\\n<style>\\n  .wrap  { padding: var(--spaceLg, 20px); }\\n  .title { margin: 0 0 var(--spaceMd, 16px); font-size: 1.25rem; color: var(--primaryText,#e6ebf1); }\\n  .pager { display:flex; align-items:center; gap: 8px; margin-top: 12px; }\\n  .btn   { padding: 6px 10px; border:1px solid var(--borderColor,#2b3a36); border-radius: 8px; text-decoration:none; }\\n  .page  { opacity: .8; }\\n  .empty { margin-top: 10px; color: var(--secondaryText); }\\n</style>\\n"],"names":[],"mappings":"AAuDE,mBAAO,CAAE,OAAO,CAAE,IAAI,SAAS,CAAC,KAAK,CAAG,CACxC,oBAAO,CAAE,MAAM,CAAE,CAAC,CAAC,CAAC,CAAC,IAAI,SAAS,CAAC,KAAK,CAAC,CAAE,SAAS,CAAE,OAAO,CAAE,KAAK,CAAE,IAAI,aAAa,CAAC,OAAO,CAAG,CAClG,oBAAO,CAAE,QAAQ,IAAI,CAAE,YAAY,MAAM,CAAE,GAAG,CAAE,GAAG,CAAE,UAAU,CAAE,IAAM,CACvE,kBAAO,CAAE,OAAO,CAAE,GAAG,CAAC,IAAI,CAAE,OAAO,GAAG,CAAC,KAAK,CAAC,IAAI,aAAa,CAAC,OAAO,CAAC,CAAE,aAAa,CAAE,GAAG,CAAE,gBAAgB,IAAM,CACnH,mBAAO,CAAE,OAAO,CAAE,EAAI,CACtB,oBAAO,CAAE,UAAU,CAAE,IAAI,CAAE,KAAK,CAAE,IAAI,eAAe,CAAG"}`
};
function q(obj = {}) {
  const u = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  Object.entries(obj).forEach(([k, v]) => v === "" || v == null ? u.delete(k) : u.set(k, String(v)));
  return `?${u.toString()}`;
}
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  const envelope = data?.envelope ?? {
    rows: [],
    paging: {}
  };
  const items = envelope.rows ?? [];
  const columns = [
    {
      id: "createdAt",
      label: "Date",
      accessor: "createdAt",
      kind: "date",
      format: "datetime",
      sortable: true
    },
    {
      id: "id",
      label: "ID",
      accessor: "id",
      kind: "number",
      align: "right",
      sortable: true
    },
    {
      id: "qtyOutT",
      label: "Qty Out (t)",
      accessor: "qtyOutT",
      kind: "number",
      align: "right",
      sortable: true
    },
    {
      id: "ht",
      label: "HT",
      accessor: "ht",
      kind: "number",
      align: "right",
      sortable: true
    },
    {
      id: "wastage",
      label: "Wastage",
      accessor: "wastage",
      kind: "number",
      align: "right",
      sortable: true
    },
    {
      id: "committed",
      label: "Committed",
      accessor: "committedAt",
      kind: "date",
      format: "datetime",
      sortable: true
    },
    {
      id: "status",
      label: "Status",
      accessor: "status",
      kind: "badge",
      sortable: true
    }
  ];
  const searchKeys = ["status"];
  const paging = envelope.paging ?? { page: 1, hasPrev: false, hasNext: false };
  if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
  $$result.css.add(css);
  return `<section class="wrap svelte-eewbnl"><h1 class="title svelte-eewbnl">${escape(envelope?.meta?.title ?? "Sorting Runs")}</h1> ${validate_component(ListTable, "ListTable").$$render(
    $$result,
    {
      items,
      columns,
      rowKey: "id",
      searchable: true,
      searchKeys
    },
    {},
    {}
  )} <nav class="pager svelte-eewbnl">${paging?.hasPrev ? `<a class="btn svelte-eewbnl"${add_attribute("href", q({ page: (paging.page || 1) - 1 }), 0)}>← Prev</a>` : ``} <span class="page svelte-eewbnl">Page ${escape(paging?.page || 1)}</span> ${paging?.hasNext ? `<a class="btn svelte-eewbnl"${add_attribute("href", q({ page: (paging.page || 1) + 1 }), 0)}>Next →</a>` : ``}</nav> ${!items?.length ? `<p class="empty svelte-eewbnl" data-svelte-h="svelte-xyi2ep">Nothing here yet.</p>` : ``} </section>`;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-Bbh4b9Ix.js.map
