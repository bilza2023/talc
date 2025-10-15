<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import ListTable from '$lib/listTable/ListTable.svelte';

  export let data;

  // reactive envelope & paging
  $: env = data.envelope;
  $: paging = env?.paging ?? { page: 1, totalPages: 1, hasPrev: false, hasNext: false };

  // rows → items for ListTable
  $: items = (env?.rows ?? []).map(r => ({
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

  // columns for ListTable
  const columns = [
    { id: 'date', label: 'Date', accessor: 'dateIso', kind: 'date', format: 'datetime', width: '180px' },
    { id: 'tid', label: 'TID', accessor: 'transportId', primary: true, width: '280px' },
    { id: 'lane', label: 'From → To', accessor: 'lane' },
    { id: 'qd', label: 'Qty Dispatch', accessor: 'qtyDispatch', align: 'right', width: '120px' },
    { id: 'qr', label: 'Qty Receive', accessor: 'qtyReceive', align: 'right', width: '120px' },
    { id: 'qDelta', label: 'Δ Qty', accessor: 'qtyDelta', align: 'right', width: '100px' },
    { id: 'ad', label: 'Amount D', accessor: 'amountDispatch', align: 'right', width: '120px' },
    { id: 'ar', label: 'Amount R', accessor: 'amountReceive', align: 'right', width: '120px' },
    { id: 'aDelta', label: 'Δ Amount', accessor: 'amountDelta', align: 'right', width: '120px' }
  ];

  function changePage(n) {
    const u = new URL($page.url);
    u.searchParams.set('page', String(n));
    goto(`${u.pathname}?${u.searchParams.toString()}`);
  }
</script>

<h1 class="page-title">{env.meta.title}</h1>

<section class="panel">
  <div class="panel-head">
    <h2 class="panel-title">Dispatch vs Receive</h2>
    <div class="pager">
      {#if paging.hasPrev}<button class="btn" on:click={() => changePage(paging.page - 1)}>Prev</button>{/if}
      <span class="muted">Page {paging.page} / {paging.totalPages}</span>
      {#if paging.hasNext}<button class="btn" on:click={() => changePage(paging.page + 1)}>Next</button>{/if}
    </div>
  </div>

  <!-- Enable search bar -->
  <ListTable
    items={items}
    columns={columns}
    rowKey="id"
    searchable={true}             
    searchFields={['transportId','lane']}  
    searchPlaceholder="Search TID or Lane..."
  />

  {#if items.length === 0}
    <p class="muted" style="margin-top:.5rem">No matched dispatches.</p>
  {/if}
</section>

<style>
  :global(body){background:var(--backgroundColor,#0e0e10);color:var(--primaryText,#e5e5e5);overflow-x:hidden;}
  .page-title{ text-align:center;margin:0.75rem 0;font-size:1.4rem; }
  .panel{ background:var(--surfaceColor,#16161a); border:1px solid var(--borderColor,#2a2a2a); border-radius:12px; padding:0.75rem; }
  .panel-head{ display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem; }
  .panel-title{ margin:0; font-size:1rem; }
  .pager{ display:flex; gap:0.5rem; align-items:center; }
  .btn{ padding:0.4rem 0.7rem; border-radius:10px; border:1px solid var(--borderColor,#2a2a2a); background:var(--surfaceColor,#16161a); color:inherit; cursor:pointer; }
  .muted{ color:var(--mutedText,#9aa0a6); }
</style>
