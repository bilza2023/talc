<script>
  import '$lib/styles/tokens.css';
  import ListTable from '$lib/listTable/ListTable.svelte';

  export let data;
  const envelope = data?.envelope ?? { rows: [], schema: { columns: [] }, paging: {} };

  // ListTable expects "items" and {accessor, kind} columns
  const items = envelope.rows ?? [];
  const columns = [
    { id: 'createdAt',  label: 'Date',          accessor: 'createdAt',   kind: 'date',   format: 'datetime', sortable: true },
    { id: 'id',         label: 'ID',            accessor: 'id',          kind: 'number', align: 'right',     sortable: true },
    { id: 'qtyOutT',    label: 'Qty Out (t)',   accessor: 'qtyOutT',     kind: 'number', align: 'right',     sortable: true },
    { id: 'ht',         label: 'HT',            accessor: 'ht',          kind: 'number', align: 'right',     sortable: true },
    { id: 'wastage',    label: 'Wastage',       accessor: 'wastage',     kind: 'number', align: 'right',     sortable: true },
    { id: 'committed',  label: 'Committed',     accessor: 'committedAt', kind: 'date',   format: 'datetime', sortable: true },
    { id: 'status',     label: 'Status',        accessor: 'status',      kind: 'badge',                       sortable: true }
  ];
  const searchKeys = ['status'];

  const paging = envelope.paging ?? { page: 1, hasPrev: false, hasNext: false };
  function q(obj = {}) {
    const u = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    Object.entries(obj).forEach(([k, v]) => (v === '' || v == null) ? u.delete(k) : u.set(k, String(v)));
    return `?${u.toString()}`;
  }
</script>

<section class="wrap">
  <h1 class="title">{envelope?.meta?.title ?? 'Sorting Runs'}</h1>

  <ListTable
    items={items}
    columns={columns}
    rowKey="id"
    searchable={true}
    {searchKeys}
  />

  <nav class="pager">
    {#if paging?.hasPrev}
      <a class="btn" href={q({ page: (paging.page || 1) - 1 })}>← Prev</a>
    {/if}
    <span class="page">Page {paging?.page || 1}</span>
    {#if paging?.hasNext}
      <a class="btn" href={q({ page: (paging.page || 1) + 1 })}>Next →</a>
    {/if}
  </nav>

  {#if !items?.length}
    <p class="empty">Nothing here yet.</p>
  {/if}
</section>

<style>
  .wrap  { padding: var(--spaceLg, 20px); }
  .title { margin: 0 0 var(--spaceMd, 16px); font-size: 1.25rem; color: var(--primaryText,#e6ebf1); }
  .pager { display:flex; align-items:center; gap: 8px; margin-top: 12px; }
  .btn   { padding: 6px 10px; border:1px solid var(--borderColor,#2b3a36); border-radius: 8px; text-decoration:none; }
  .page  { opacity: .8; }
  .empty { margin-top: 10px; color: var(--secondaryText); }
</style>
