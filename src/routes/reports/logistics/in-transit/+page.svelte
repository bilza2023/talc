<script>
  import { page } from '$app/stores';
  export let data;

  const env = data.envelope;
  const lanes = data.lanes ?? [];
  const filters = data.filters ?? {};
  const opts = data.options ?? {};
  $: paging = env.paging ?? { page: 1, pageSize: 25, hasPrev: false, hasNext: false };

  // Build hrefs preserving current query
  $: current = $page.url;
  function withParam(key, val) {
    const u = new URL(current);
    if (val == null || val === '') u.searchParams.delete(key);
    else u.searchParams.set(key, String(val));
    return `${u.pathname}?${u.searchParams.toString()}`;
  }
  function pageHref(n) {
    const u = new URL(current);
    u.searchParams.set('page', String(n));
    u.searchParams.set('pageSize', String(paging.pageSize));
    return `${u.pathname}?${u.searchParams.toString()}`;
  }
</script>

<h1 class="page-title">{env.meta?.title || 'Logistics — In-Transit'}</h1>

<!-- Filters (GET) -->
<form class="form compact filters" method="GET">
  <div class="row">
    <label>From</label>
    <select name="from">
      <option value="">All</option>
      {#each opts.fromOpts || [] as v}
        <option value={v} selected={v === filters.from}>{v}</option>
      {/each}
    </select>
  </div>

  <div class="row">
    <label>To</label>
    <select name="to">
      <option value="">All</option>
      {#each opts.toOpts || [] as v}
        <option value={v} selected={v === filters.to}>{v}</option>
      {/each}
    </select>
  </div>

  <div class="row">
    <label>Supplier</label>
    <select name="supplierId">
      <option value="">All</option>
      {#each opts.supOpts || [] as v}
        <option value={v} selected={v === String(filters.supplierId)}>{v}</option>
      {/each}
    </select>
  </div>

  <div class="row">
    <label>Shade</label>
    <select name="shade">
      <option value="">All</option>
      {#each opts.shadeOpts || [] as v}
        <option value={v} selected={v === filters.shade}>{v}</option>
      {/each}
    </select>
  </div>

  <div class="row">
    <label>Size</label>
    <select name="size">
      <option value="">All</option>
      {#each opts.sizeOpts || [] as v}
        <option value={v} selected={v === filters.size}>{v}</option>
      {/each}
    </select>
  </div>

  <div class="row">
    <label>Min Age (hrs)</label>
    <select name="ageHrsMin">
      {#each opts.ageOpts || [] as v}
        <option value={v} selected={String(v) === String(filters.ageHrsMin)}>{v || '—'}</option>
      {/each}
    </select>
  </div>

  <div class="actions">
    <button class="btn" type="submit">Apply</button>
    <a class="btn ghost" href={withParam('page','1')}>Reset</a>
  </div>
</form>

<!-- KPI strip -->
<section class="kpis">
  <div class="kpi">
    <div class="kpi-label">In-Transit Jobs</div>
    <div class="kpi-value">{env.kpis?.jobs ?? 0}</div>
  </div>
  <div class="kpi">
    <div class="kpi-label">In-Transit Qty</div>
    <div class="kpi-value">{(env.kpis?.qty ?? 0).toFixed(1)} t</div>
  </div>
  <div class="kpi">
    <div class="kpi-label">Oldest (hrs)</div>
    <div class="kpi-value">{(env.kpis?.oldestHrs ?? 0).toFixed(1)}</div>
  </div>
  <div class="kpi">
    <div class="kpi-label">≥ 48h</div>
    <div class="kpi-value">{env.kpis?.overdue48 ?? 0}</div>
  </div>
</section>

<!-- Lane summary -->
<section class="panel">
  <h2 class="panel-title">Lane Summary (Unsettled)</h2>
  <div class="table-wrap">
    <table class="table">
      <thead>
        <tr>
          <th>From</th><th>To</th><th class="num">Jobs</th><th class="num">Qty</th>
        </tr>
      </thead>
      <tbody>
        {#if lanes.length === 0}
          <tr><td colspan="4" class="muted">No lanes.</td></tr>
        {:else}
          {#each lanes as r}
            <tr>
              <td>{r.from}</td>
              <td>{r.to}</td>
              <td class="num">{r.jobs}</td>
              <td class="num">{r.qty}</td>
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>
</section>

<!-- Unsettled table (paged) -->
<section class="panel">
  <div class="panel-head">
    <h2 class="panel-title">Unsettled Dispatches</h2>
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
            <th class:num={['qty','ageHrs','amount'].includes(c.key)}>{c.label}</th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#if (env.rows || []).length === 0}
          <tr><td colspan={(env.schema?.columns || []).length} class="muted">Nothing in transit.</td></tr>
        {:else}
          {#each env.rows as r}
            <tr>
              <td>{new Date(r.createdAt).toLocaleString()}</td>
              <td class="mono">{r.transportId}</td>
              <td>{r.fromMmaCode}</td>
              <td>{r.toMmaCode}</td>
              <td>{r.supplierId}</td>
              <td>{r.shade}</td>
              <td>{r.size}</td>
              <td class="num">{r.qty}</td>
              <td class="num">{r.ageHrs}</td>
              <td class="num">{r.amount ?? '—'}</td>
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

  /* Filters (form.css alignment) */
  .filters {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  @media (min-width: 720px) {
    .filters { grid-template-columns: repeat(6, minmax(0, 1fr)); }
  }
  .filters .actions {
    grid-column: 1 / -1;
    display: flex; gap: 0.5rem; justify-content: flex-end;
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
  .kpi-label { font-size: 0.8rem; color: var(--mutedText, #9aa0a6); margin-bottom: 0.25rem; }
  .kpi-value { font-size: 1.05rem; font-weight: 600; }
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
    display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.5rem;
  }
  .panel-title { margin: 0; font-size: 1rem; }

  /* Pager */
  .pager { display: inline-flex; gap: 0.5rem; align-items: center; }
  .btn {
    padding: 0.4rem 0.7rem;
    border-radius: 10px;
    border: 1px solid var(--borderColor, #2a2a2a);
    background: var(--buttonBg, var(--surfaceColor, #16161a));
    color: var(--primaryText, inherit);
    text-decoration: none;
  }
  .btn.ghost { background: transparent; }

  /* Tables */
  .table-wrap { overflow: auto; border-radius: 10px; }
  .table { width: 100%; border-collapse: collapse; font-size: 0.92rem; }
  .table th, .table td {
    padding: 0.5rem 0.6rem;
    border-bottom: 1px solid var(--borderColor, #2a2a2a);
    white-space: nowrap;
  }
  .table thead th { position: sticky; top: 0; background: var(--surfaceColor, #16161a); z-index: 1; }
  .num { text-align: right; }
  .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
</style>
