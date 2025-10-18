<script>
  
  import ListTable from '$lib/listTable/ListTable.svelte';
  import H1 from '$lib/components/H1.svelte';

  export let data;

  const title = data?.title ?? 'Purchase Ledger';
  const items = data?.items ?? []; // flat, normalized rows from loader

  // Columns must match accessors on items (see ListTable docs)
  const columns = [
    { id:'docDate',  label:'Date',        accessor:'docDate',        kind:'date',   format:'date',  sortable:true,  width:'120px' },
    { id:'supplier', label:'Supplier',    accessor:'supplierName',   kind:'text',   primary:true,   sortable:true },
    { id:'mma',      label:'MMA',         accessor:'toMmaCode',      kind:'badge',  sortable:true,  align:'center', width:'110px' },
    { id:'shade',    label:'Shade',       accessor:'shade',          kind:'badge',  sortable:true,  align:'center', width:'110px' },
    { id:'size',     label:'Size',        accessor:'size',           kind:'badge',  sortable:true,  align:'center', width:'110px' },
    { id:'qty',      label:'Qty (t)',     accessor:'quantity',       kind:'number', sortable:true,  align:'right',  width:'110px' },

    // Commercials (optional)
    { id:'rate',     label:'Rate/MT',     accessor:'ratePerMt',      kind:'number', sortable:true,  align:'right',  width:'110px' },
    { id:'frt',      label:'Freight/MT',  accessor:'freightPerMt',   kind:'number', sortable:true,  align:'right',  width:'120px' },
    { id:'sfrt',     label:'Supp. Frt',   accessor:'supplierFreight',kind:'number', sortable:true,  align:'right',  width:'120px' },
    { id:'road',     label:'Road Exp',    accessor:'roadExp',        kind:'number', sortable:true,  align:'right',  width:'110px' },
    { id:'cash',     label:'Cash Paid',   accessor:'cashPaid',       kind:'number', sortable:true,  align:'right',  width:'110px' },

    { id:'pmode',    label:'Payment',     accessor:'paymentMode',    kind:'text',   align:'center', width:'120px' },
    { id:'remarks',  label:'Remarks',     accessor:'remarks',        kind:'text' }
  ];
</script>

<H1 text={title} />
<section class="wrap">
  <h1 class="page-title">{title}</h1>

  <ListTable
    items={items}
    columns={columns}
    rowKey="id"
    searchable={true}
    thumbBaseUrl=""
    emptyMessage="No purchases found"
  />
</section>

<style>
  .wrap {
    margin-inline: auto;
    padding: 1rem;
    width: min(96vw, 1200px);
    color: var(--primaryText);
  }
  .page-title {
    margin: 0 0 .75rem 0;
    font-size: 1.25rem;
    color: var(--primaryText);
  }
</style>
