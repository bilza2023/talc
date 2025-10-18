<script>
  import '$lib/styles/tokens.css';
  import ListTable from '$lib/listTable/ListTable.svelte';

  export let data;

  const title = data?.title ?? 'Stock — Slots by MMA';
  const items = data?.items ?? []; // [{ id, mmaCode, supplierId, supplierName, shade, size, qty }]

  // Columns must match accessors on items (ListTable docs)
  const columns = [
    { id:'mma',      label:'MMA',       accessor:'mmaCode',     kind:'badge',  sortable:true, align:'center', width:'140px' },
    { id:'supplier', label:'Supplier',  accessor:'supplierName',kind:'text',   primary:true,  sortable:true },
    { id:'shade',    label:'Shade',     accessor:'shade',       kind:'badge',  sortable:true, align:'center', width:'110px' },
    { id:'size',     label:'Size',      accessor:'size',        kind:'badge',  sortable:true, align:'center', width:'110px' },
    { id:'qty',      label:'Qty (t)',   accessor:'qty',         kind:'number', sortable:true, align:'right',  width:'120px' }
  ];

  // Search should include non-text badges too (mmaCode, shade, size)
  const searchKeys = ['supplierName','mmaCode','shade','size'];
</script>

<section class="wrap">
  <h1 class="page-title">{title}</h1>

  <ListTable
    items={items}
    columns={columns}
    rowKey="id"
    searchable={true}
    searchKeys={searchKeys}
    emptyMessage="No stock slots found"
  />
</section>

<style>
  .wrap {
    margin-inline: auto;
    padding: 1rem;
    width: min(96vw, 1100px);
    color: var(--primaryText);
  }
  .page-title {
    margin: 0 0 .75rem 0;
    font-size: 1.25rem;
    color: var(--primaryText);
  }
</style>
