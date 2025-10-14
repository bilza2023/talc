<script>
  import { page } from '$app/stores';
  export let data;

  const env = data.envelope;
  const lanes = data.lanes ?? [];
  $: paging = env.paging ?? { page: 1, pageSize: 25, hasPrev: false, hasNext: false };

  // Build URL for page changes while preserving current query
  function pageHref(n) {
    const u = new URL($page.url);
    u.searchParams.set('page', String(n));
    u.searchParams.set('pageSize', String(paging.pageSize));
    return `${u.pathname}?${u.searchParams.toString()}`;
  }
</script>

<h1 class="page-title">{env.meta?.title || 'Logistics — Overview'}</h1>

<!-- KPI strip -->
<section class="kpis">
  <div class="kpi">
    <div class="kpi-label">In-Transit (qty)</div>
    <div class="kpi-value">{(env.kpis?.inTransitQty ?? 0).toFixed(1)} t</div>
  </div>
  <div class="kpi">
    <div class="kpi-label">In-Transit (jobs)</div>
    <div class="kpi-value">{env.kpis?.inTransitJobs ?? 0}</div>
  </div>
  <div class="kpi">
    <div class="kpi-label">Reconciled</div>
    <div class="kpi-value">
      {(env.kpis?.reconciledPct ?? 0).toFixed(1)}%
      <small class="muted">
        {(env.kpis?.totals?.received ?? 0)}/{(env.kpis?.totals?.dispatch ?? 0)}
      </small>
    </div>
  </div>
  <div class="kpi">
    <div class="kpi-label">Avg Days in Transit</div>
    <div class="kpi-value">{(env.kpis?.avgDaysTransit ?? 0).toFixed(1)}</div>
  </div>
</section>

<!-- Lane summary -->
<section class="panel">
  <h2 class="panel-title">Lane Summary</h2>
  <div class="table-wrap">
    <table class="table">
      <thead>
        <tr>
          <th>From</th><th>To</th><th class="num">Dispatched</th><th class="num">Received</th><th class="num">Δ</th>
        </tr>
      </thead>
      <tbody>
        {#if lanes.length === 0}
          <tr><td colspan="5" class="muted">No lanes yet.</td></tr>
        {:else}
          {#each lanes as r}
            <tr>
              <td>{r.from}</td>
              <td>{r.to}</td>
              <td class="num">{r.dispatched}</td>
              <td class="num">{r.received}</td>
              <td class="num">{r.delta}</td>
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>
</section>

<!-- Recent movements (paged) -->
<section class="panel">
  <div class="panel-head">
    <h2 class="panel-title">Recent Movements</h2>
    <div class="pager">
      {#if paging.hasPrev}
        <a class="btn" rel="prev" href={pageHref(paging.page - 1)}>Prev</a>
      {/if}
      <span class="muted">Page {paging.page}</span>
      {#if paging.hasNext}
        <a class="btn" rel="next" href={pageHref(paging.page + 1)}>Next</a>
      {/if}
    </div>
  </div>

  <div class="table-wrap">
    <table class="table">
      <thead>
        <tr>
          {#each env.schema?.columns || [] as c}
            <th class:num={['qty','ageHrs','amountDispatch','amountReceive','qtyDelta','amountDelta'].includes(c.key)}>
              {c.label}
            </th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#if (env.rows || []).length === 0}
          <tr><td colspan={(env.schema?.columns || []).length} class="muted">No data.</td></tr>
        {:else}
          {#each env.rows as r}
            <tr>
              <td>{new Date(r.date).toLocaleString()}</td>
              <td class="mono">{r.transportId}</td>
              <td>{r.lane}</td>
              <td>{r.supplierId}</td>
              <td>{r.shade}</td>
              <td>{r.size}</td>
              <td class="num">{r.qty}</td>
              <td>
                <span class="badge {r.status}">{r.status}</span>
              </td>
              <td class="num">{r.ageHrs}</td>
              <td class="num">{r.amountDispatch ?? '—'}</td>
              <td class="num">{r.amountReceive ?? '—'}</td>
              <td class="num">{r.qtyDelta}</td>
              <td class="num">{r.amountDelta}</td>
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>
</section>

<style>
  /* Base — tokens first, mobile-first */
  :global(body) {
    color: var(--primaryText, var(--baseTextColor, #e5e5e5));
    background: var(--backgroundColor, #0e0e10);
  }
  .page-title {
    margin: 0.5rem 0 0.75rem;
    text-align: center;
    font-size: clamp(1.1rem, 2.4vw, 1.6rem);
    color: var(--primaryText, inherit);
  }

  /* KPI cards */
  .kpis {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  @media (min-width: 720px) {
    .kpis { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  }
  .kpi {
    background: var(--surfaceColor, #16161a);
    border: 1px solid var(--borderColor, #2a2a2a);
    border-radius: 12px;
    padding: 0.75rem;
  }
  .kpi-label {
    font-size: 0.8rem;
    color: var(--mutedText, #9aa0a6);
    margin-bottom: 0.25rem;
  }
  .kpi-value {
    font-size: 1.05rem;
    font-weight: 600;
  }
  .muted { color: var(--mutedText, #9aa0a6); }

  /* Panels */
  .panel {
    background: var(--surfaceColor, #16161a);
    border: 1px solid var(--borderColor, #2a2a2a);
    border-radius: 12px;
    padding: 0.75rem;
    margin-bottom: 1rem;
  }
  .panel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }
  .panel-title {
    margin: 0;
    font-size: 1rem;
  }

  /* Pager — aligns with forms.css tokens */
  .pager {
    display: inline-flex;
    gap: 0.5rem;
    align-items: center;
  }
  .btn {
    padding: 0.4rem 0.7rem;
    border-radius: 10px;
    border: 1px solid var(--borderColor, #2a2a2a);
    background: var(--buttonBg, var(--surfaceColor, #16161a));
    color: var(--primaryText, inherit);
    text-decoration: none;
  }

  /* Tables */
  .table-wrap { overflow:auto; border-radius: 10px; }
  .table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.92rem;
  }
  .table th, .table td {
    padding: 0.5rem 0.6rem;
    border-bottom: 1px solid var(--borderColor, #2a2a2a);
    white-space: nowrap;
  }
  .table thead th {
    position: sticky; top: 0;
    background: var(--surfaceColor, #16161a);
    z-index: 1;
  }
  .num { text-align: right; }
  .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }

  /* Status badges */
  .badge {
    display: inline-block;
    padding: 0.15rem 0.45rem;
    border-radius: 999px;
    border: 1px solid var(--borderColor, #2a2a2a);
    font-size: 0.72rem;
  }
  .badge.IN_TRANSIT { background: color-mix(in oklab, #f5c542 20%, transparent); }
  .badge.RECEIVED   { background: color-mix(in oklab, #33cc66 20%, transparent); }
  .badge.CANCELED   { background: color-mix(in oklab, #ff4d4f 20%, transparent); }
</style>
