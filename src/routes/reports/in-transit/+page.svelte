<script>
  import '$lib/styles/tokens.css';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import ListTable from '$lib/listTable/ListTable.svelte';

  export let data;
  const { envelope } = data ?? {};

  const rows   = envelope?.rows ?? [];
  const paging = envelope?.paging ?? { page: 1, pageSize: rows.length || 0, hasPrev: false, hasNext: false };

  // S.No should stay continuous across pages
  const baseIndex = ((paging.page || 1) - 1) * (paging.pageSize || 0);

  // Supplier id -> name map (fetched once; no server changes required)
  let supplierMap = new Map();
  onMount(async () => {
    try {
      const res = await fetch('/api/suppliers');
      const list = await res.json(); // expects [{id, name, code}, ...]
      supplierMap = new Map(list.map(s => [Number(s.id), String(s.name || s.code || s.id)]));
    } catch {
      // fail silently; fallback to showing the numeric id
      supplierMap = new Map();
    }
  });

  // build items for ListTable; reacts when supplierMap updates
  let items = [];
  $: items = rows.map((r, i) => {
    const supplierName = supplierMap.get(Number(r.supplierId)) ?? String(r.supplierId);
    const fullId = String(r.transportId);
    const shortId = fullId.slice(0, 8); // tiny visual footprint
    return {
      sNo: baseIndex + i + 1,
      date: r.date,                      // ListTable kind:'date' handles formatting
      transportId: fullId,               // keep full (search)
      transportShort: shortId,           // display small
      lane: r.lane,
      supplier: supplierName,            // show NAME instead of ID
      shade: r.shade || '—',
      size: r.size || '—',
      qty: Number(r.qty ?? 0),
      amount: Number(r.amount ?? 0)
    };
  });

  // ListTable columns (compact Txn, supplier name shown)
  const columns = [
    { id:'sNo',        label:'S.No',      accessor:'sNo',            kind:'number',  sortable:true, width:'70px' },
    { id:'date',       label:'Date',      accessor:'date',           kind:'date',    sortable:true, format:'datetime', width:'180px' },
    { id:'transport',  label:'Txn',       accessor:'transportShort', kind:'text',    sortable:true, width:'90px', align:'center', titleKey:'transportId' },
    { id:'lane',       label:'Lane',      accessor:'lane',           kind:'text',    sortable:true },
    { id:'supplier',   label:'Supplier',  accessor:'supplier',       kind:'text',    sortable:true, align:'center', width:'160px' },
    { id:'shade',      label:'Shade',     accessor:'shade',          kind:'badge',   sortable:true, align:'center', width:'110px' },
    { id:'size',       label:'Size',      accessor:'size',           kind:'badge',   sortable:true, align:'center', width:'110px' },
    { id:'qty',        label:'Qty',       accessor:'qty',            kind:'number',  sortable:true, align:'right',  width:'110px' },
    { id:'amount',     label:'Amount',    accessor:'amount',         kind:'number',  sortable:true, align:'right',  width:'120px' }
  ];

  // fields to search (include full transportId for deep search)
  const searchKeys = ['transportId','lane','supplier','shade','size'];

  // preserve existing query params and only tweak what's passed
  function q(obj) {
    const u = new URLSearchParams(browser ? window.location.search : '');
    Object.entries(obj).forEach(([k, v]) =>
      (v === '' || v == null) ? u.delete(k) : u.set(k, String(v))
    );
    const s = u.toString();
    return s ? `?${s}` : '';
  }
</script>

<h1 class="title">{envelope?.meta?.title}</h1>

<ListTable
  items={items}
  columns={columns}
  rowKey="transportId"
  searchable={true}
  searchKeys={searchKeys}
/>

<nav class="pager">
  <a class="btn" aria-disabled={!paging.hasPrev} href={paging.hasPrev ? q({ page: paging.page - 1 }) : undefined}>Prev</a>
  <span class="page">Page {paging.page}</span>
  <a class="btn" aria-disabled={!paging.hasNext} href={paging.hasNext ? q({ page: paging.page + 1 }) : undefined}>Next</a>
</nav>

<style>
  .title { text-align:center; margin: .5rem 0 1rem; color: var(--primaryText); }

  /* keep pager as-is */
  .pager { display:flex; justify-content:center; align-items:center; gap:.75rem; padding:.75rem 0; }
  .btn { padding:.4rem .7rem; border:1px solid var(--borderColor,#2b3a36); border-radius: var(--radiusMd,10px);
         text-decoration:none; color: var(--primaryText,#e6ebf1); background: var(--surfaceColor,#0f1a16); }
  .btn[aria-disabled="true"] { opacity:.5; pointer-events:none; }

  /* make Txn visually tiny & unobtrusive on small screens */
  :global(td[data-col-id="transport"]) {
    font-family: var(--mono, ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace);
    font-size: .85em;
    opacity: .8;
    letter-spacing: .2px;
  }
  @media (max-width: 640px) {
    :global(th[data-col-id="transport"]), :global(td[data-col-id="transport"]) {
      display: none; /* hide txn column on narrow screens */
    }
  }
</style>
