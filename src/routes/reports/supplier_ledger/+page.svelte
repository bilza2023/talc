<script>
  import '$lib/styles/tokens.css';

  export let data;
  const envelope = data?.envelope ?? null;

  const columns = envelope?.schema?.columns ?? [];
  const rows    = envelope?.rows ?? [];
  const paging  = envelope?.paging ?? { page: 1, pageSize: 25, hasPrev: false, hasNext: false };

  function q(obj = {}) {
    const u = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    Object.entries(obj).forEach(([k, v]) => (v === '' || v == null) ? u.delete(k) : u.set(k, String(v)));
    return `?${u.toString()}`;
  }

  function fmt(val) {
    if (val == null) return '';
    if (typeof val === 'number') return val.toLocaleString(undefined, { maximumFractionDigits: 2 });
    if (val instanceof Date) return val.toLocaleString();
    return String(val);
  }
</script>

{#if !envelope}
  <section class="empty">
    <h1 class="title">Reconciliation</h1>
    <p class="hint">No data.</p>
  </section>
{:else}
  <h1 class="title">{envelope?.meta?.title || 'Reconciliation'}</h1>

  <div class="table-wrapper">
    <table class="report-table">
      <thead>
        <tr>
          {#each columns as col}
            <th>{col.label}</th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#if rows.length === 0}
          <tr><td colspan={columns.length} class="no-data">No records found</td></tr>
        {:else}
          {#each rows as r}
            <tr>
              {#each columns as col}
                <td>{fmt(r[col.key])}</td>
              {/each}
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>

  <nav class="pager" aria-label="Pagination">
    {#if paging?.hasPrev}
      <a class="btn" href={q({ page: (paging.page || 1) - 1 })} rel="prev">Prev</a>
    {/if}
    <span class="page-info">Page {paging?.page || 1}</span>
    {#if paging?.hasNext}
      <a class="btn" href={q({ page: (paging.page || 1) + 1 })} rel="next">Next</a>
    {/if}
  </nav>
{/if}

<style>
  .title {
    margin: 0 0 12px 0;
    text-align: center;
    font-size: clamp(18px, 3.6vw, 22px);
    color: var(--primaryText, #e6ebf1);
  }

  .table-wrapper {
    overflow-x: auto;
  }

  .report-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 16px;
  }

  th, td {
    border: 1px solid var(--borderColor, #2b3a36);
    padding: 6px 10px;
    text-align: left;
    white-space: nowrap;
  }

  th {
    background: color-mix(in srgb, var(--surfaceColor, #0f1a16) 80%, transparent);
    color: var(--primaryText, #e6ebf1);
    position: sticky;
    top: 0;
  }

  tr:nth-child(even) {
    background: color-mix(in srgb, var(--surfaceColor, #0f1a16) 60%, transparent);
  }

  .no-data {
    text-align: center;
    opacity: 0.7;
  }

  .pager {
    margin-top: 12px;
    display: flex;
    gap: 8px;
    justify-content: center;
    align-items: center;
  }

  .btn {
    padding: 6px 10px;
    border-radius: var(--radiusLg, 12px);
    border: 1px solid var(--borderColor, #2b3a36);
    text-decoration: none;
    color: var(--primaryText, #e6ebf1);
    background: color-mix(in srgb, var(--surfaceColor, #0f1a16) 70%, transparent);
  }

  .page-info { opacity: 0.8; }
  .empty { padding: 24px; text-align: center; }
  .hint  { margin-top: 8px; opacity: 0.8; }
</style>
