<script>
  import '$lib/styles/tokens.css';
  import ListTable from '$lib/listTable/ListTable.svelte';

  export let data;

  const title  = data?.title ?? 'Purchase Ledger';
  const groups = data?.groups ?? [];

  // One column schema reused for every group table
  const columns = [
    { id:'docDate',  label:'Date',      accessor:'docDate',     kind:'date',  format:'date', sortable:true,  width:'120px' },
    { id:'supplier', label:'Supplier',  accessor:'supplierName',kind:'text',  primary:true,  sortable:true },
    { id:'mma',      label:'MMA',       accessor:'toMmaCode',   kind:'badge', sortable:true, align:'center', width:'110px' },
    { id:'shade',    label:'Shade',     accessor:'shade',       kind:'badge', sortable:true, align:'center', width:'110px' },
    { id:'size',     label:'Size',      accessor:'size',        kind:'badge', sortable:true, align:'center', width:'110px' },
    { id:'qty',      label:'Qty (t)',   accessor:'quantity',    kind:'number',sortable:true, align:'right',  width:'110px' },

    // Commercials (optional; blank if null)
    { id:'rate',     label:'Rate/MT',   accessor:'ratePerMt',       kind:'number', sortable:true, align:'right', width:'110px' },
    { id:'frt',      label:'Freight/MT',accessor:'freightPerMt',    kind:'number', sortable:true, align:'right', width:'120px' },
    { id:'sfrt',     label:'Supp. Frt', accessor:'supplierFreight', kind:'number', sortable:true, align:'right', width:'120px' },
    { id:'road',     label:'Road Exp',  accessor:'roadExp',         kind:'number', sortable:true, align:'right', width:'110px' },
    { id:'cash',     label:'Cash Paid', accessor:'cashPaid',        kind:'number', sortable:true, align:'right', width:'110px' },

    // Light text tails
    { id:'pmode',    label:'Payment',   accessor:'paymentMode', kind:'text', align:'center', width:'120px' },
    { id:'remarks',  label:'Remarks',   accessor:'remarks',     kind:'text' }
  ];
</script>

<section class="wrap">
  <h1 class="page-title">{title}</h1>

  <!-- Optional date range echo -->
  {#if data?.from || data?.to}
    <p class="filters">
      {#if data?.from}<span>From: <b>{data.from}</b></span>{/if}
      {#if data?.to}<span>To: <b>{data.to}</b></span>{/if}
    </p>
  {/if}

  {#if groups.length === 0}
    <p class="empty">No purchases found.</p>
  {/if}

  {#each groups as g}
    <h2 class="group">{g.mma}</h2>
    <ListTable
      items={g.items}
      columns={columns}
      rowKey="id"
      searchable={false}
      thumbBaseUrl=""
    />
  {/each}
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
  .filters {
    margin: 0 0 1rem 0;
    color: var(--secondaryText);
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }
  .group {
    margin: 1.25rem 0 .5rem 0;
    padding: .25rem .5rem;
    font-size: 1.05rem;
    color: var(--primaryText);
    border-left: 4px solid var(--borderColor);
  }
  .empty {
    margin: .75rem 0;
    color: var(--secondaryText);
  }
</style>
