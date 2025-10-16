<script>
  import '$lib/styles/tokens.css';

  export let data;
  const envelope = data?.envelope ?? null;

  // Columns/rows/paging come straight from reportEngine envelope
  const columns = envelope?.schema?.columns ?? [];
  const rows    = envelope?.rows ?? [];
  const paging  = envelope?.paging ?? { page: 1, pageSize: 25, hasPrev: false, hasNext: false };

  // Keep existing query params while replacing a few keys
  function q(obj = {}) {
    const u = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    Object.entries(obj).forEach(([k, v]) => (v === '' || v == null) ? u.delete(k) : u.set(k, String(v)));
    return `?${u.toString()}`;
  }

  // small helper for date display
  const fmt = {
    datetime: (v) => v ? new Date(v).toLocaleString() : '—',
    text: (v) => (v ?? '—')
  };
</script>

<h1 class="title">{envelope?.meta?.title || 'Stock Ledger'}</h1>

<form method="GET" class="filters">
  <div class="row">
    <label>Supplier ID</label>
    <input type="number" name="supplierId" value={data?.filters?.supplierId ?? ''} inputmode="numeric" />
  </div>
  <div class="row">
    <label>MMA</label>
    <input type="text" name="mmaCode" value={data?.filters?.mmaCode ?? ''} placeholder="ABS_RAW, PSS_SCREENED, ..." />
  </div>
  <div class="row">
    <label>Shade</label>
    <input type="text" name="shade" value={data?.filters?.shade ?? ''} />
  </div>
  <div class="row">
    <label>Size</label>
    <input type="text" name="size" value={data?.filters?.size ?? ''} placeholder="ANY, LUMPS, CHIPS, FINE" />
  </div>
  <div class="row">
    <label>From</label>
    <input type="datetime-local" name="from" value={data?.filters?.from ?? ''} />
  </div>
  <div class="row">
    <label>To</label>
    <input type="datetime-local" name="to" value={data?.filters?.to ?? ''} />
  </div>

  <div class="actions">
    <button type="submit">Apply</button>
    <a class="reset" href="/reports/ledger">Reset</a>
  </div>
</form>

<div class="table-wrap">
  <table class="ledger">
    <thead>
      <tr>
        {#each columns as c}
          <th class:hideMobileLink={c.key === 'linkId'} class:nums={c.key === 'qtyDelta'}>
            {c.label}
          </th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#if rows.length === 0}
        <tr><td colspan={columns.length} class="empty">No rows</td></tr>
      {:else}
        {#each rows as r}
          <tr>
            {#each columns as c}
              {#if c.type === 'datetime' && c.key === 'createdAt'}
                <td>{fmt.datetime(r[c.key])}</td>
              {:else if c.key === 'qtyDelta'}
                <td class="nums">{Number(r[c.key] ?? 0).toLocaleString()}</td>
              {:else if c.key === 'linkId'}
                <td class="hideMobileLink">{fmt.text(r[c.key])}</td>
              {:else}
                <td>{fmt.text(r[c.key])}</td>
              {/if}
            {/each}
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>
</div>

<nav class="pager">
  <a class="btn" aria-disabled={!paging.hasPrev} href={paging.hasPrev ? q({ page: (paging.page || 1) - 1 }) : undefined}>‹ Prev</a>
  <span class="now">Page {paging.page || 1}</span>
  <a class="btn" aria-disabled={!paging.hasNext} href={paging.hasNext ? q({ page: (paging.page || 1) + 1 }) : undefined}>Next ›</a>

  <!-- quick pageSize selector; persists other filters -->
  <label class="psize">
    Page size
    <select on:change={(e)=>{ location.href = q({ page: 1, pageSize: e.currentTarget.value }); }}>
      {#each [10,25,50,100,200] as n}
        <option value={n} selected={String(n) === String(paging.pageSize || 25)}>{n}</option>
      {/each}
    </select>
  </label>
</nav>

<style>
  .title {
    margin: 0.5rem 0 0.75rem;
    text-align: center;
    color: var(--primaryText, #e6ebf1);
    font-size: clamp(1.25rem, 2vw, 1.75rem);
  }

  .filters {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: var(--spaceSm, 10px);
    padding: var(--spaceSm, 10px);
    background: color-mix(in srgb, var(--surfaceColor, #0f1a16) 70%, transparent);
    border: 1px solid var(--borderColor, #2b3a36);
    border-radius: var(--radiusXl, 16px);
    margin-bottom: 0.75rem;
  }
  .filters .row {
    display: flex; flex-direction: column; gap: 4px;
  }
  .filters .actions {
    grid-column: 1 / -1;
    display: flex; gap: 8px; align-items: center;
  }
  .filters button, .filters .reset {
    padding: 8px 12px;
    border-radius: var(--radiusLg, 12px);
    border: 1px solid var(--borderColor, #2b3a36);
    background: var(--surfaceAlt, #15231d);
    color: var(--primaryText, #e6ebf1);
    text-decoration: none;
  }
  .filters .reset { opacity: 0.9; }

  @media (max-width: 860px) {
    .filters { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }

  .table-wrap {
    overflow-x: auto;
    border: 1px solid var(--borderColor, #2b3a36);
    border-radius: var(--radiusXl, 16px);
  }
  table.ledger {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.95rem;
  }
  thead th, tbody td {
    padding: 10px 12px;
    border-bottom: 1px solid var(--borderColor, #24332e);
    white-space: nowrap;
  }
  thead th { text-align: left; opacity: 0.9; }
  td.empty { text-align: center; padding: 1.25rem; }

  .nums { text-align: right; font-variant-numeric: tabular-nums; }

  /* Mobile: hide Link column (verbose); keep essential fields */
  @media (max-width: 640px) {
    .hideMobileLink { display: none; }
  }

  .pager {
    display: flex; align-items: center; gap: 10px;
    justify-content: center;
    margin: 0.75rem 0 1rem;
  }
  .pager .btn {
    padding: 6px 10px; border-radius: 10px;
    border: 1px solid var(--borderColor, #2b3a36);
    background: var(--surfaceAlt, #15231d);
    color: var(--primaryText, #e6ebf1);
    text-decoration: none;
  }
  .pager .btn[aria-disabled="true"] {
    pointer-events: none; opacity: 0.5;
  }
  .pager .now { opacity: 0.9; }
  .pager .psize { margin-left: 8px; display: inline-flex; align-items: center; gap: 6px; }
  .pager select {
    padding: 4px 8px; border-radius: 8px;
    background: var(--surfaceColor, #0f1a16);
    color: var(--primaryText, #e6ebf1);
    border: 1px solid var(--borderColor, #2b3a36);
  }
</style>
