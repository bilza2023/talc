<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  export let data;

  // 🔁 make envelope reactive to incoming `data`
  $: env = data.envelope;
  $: paging = env?.paging ?? { page: 1, totalPages: 1, hasPrev: false, hasNext: false };

  function changePage(n) {
    const u = new URL($page.url);
    u.searchParams.set('page', String(n));
    // Client-side nav; URL changes; data reloads; UI updates because env is reactive
    goto(`${u.pathname}?${u.searchParams.toString()}`);
  }
</script>

<h1 class="page-title">{env.meta.title}</h1>

<section class="kpis">
  <div class="kpi">
    <div class="kpi-label">Matched Pairs</div>
    <div class="kpi-value">{env.kpis.total}</div>
  </div>
  <div class="kpi">
    <div class="kpi-label">Σ Δ Qty</div>
    <div class="kpi-value">{env.kpis.totalQtyDiff.toFixed(1)}</div>
  </div>
  <div class="kpi">
    <div class="kpi-label">Σ Δ Amount</div>
    <div class="kpi-value">{env.kpis.totalAmtDiff.toFixed(0)}</div>
  </div>
</section>

<section class="panel">
  <div class="panel-head">
    <h2 class="panel-title">Dispatch vs Receive</h2>
    <div class="pager">
      {#if paging.hasPrev}
        <button class="btn" on:click={() => changePage(paging.page - 1)}>Prev</button>
      {/if}
      <span class="muted">Page {paging.page} / {paging.totalPages}</span>
      {#if paging.hasNext}
        <button class="btn" on:click={() => changePage(paging.page + 1)}>Next</button>
      {/if}
    </div>
  </div>

  <div class="table-wrap">
    <table class="table">
      <thead>
        <tr>
          {#each env.schema.columns as c}
            <th class:num={c.key.includes('Qty') || c.key.includes('Amount')}>{c.label}</th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#if env.rows.length === 0}
          <tr>
            <td colspan={env.schema.columns.length} class="muted">No matched dispatches.</td>
          </tr>
        {:else}
          {#each env.rows as r}
            <tr>
              <td>{new Date(r.date).toLocaleString()}</td>
              <td class="mono">{r.transportId}</td>
              <td>{r.lane}</td>
              <td class="num">{r.qtyDispatch}</td>
              <td class="num">{r.qtyReceive}</td>
              <td class="num">{r.qtyDelta}</td>
              <td class="num">{r.amountDispatch}</td>
              <td class="num">{r.amountReceive}</td>
              <td class="num">{r.amountDelta}</td>
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>
</section>

<style>
  :global(body) { background: var(--backgroundColor, #0e0e10); color: var(--primaryText, #e5e5e5); }
  .page-title { text-align: center; margin: 0.75rem 0; font-size: 1.4rem; }
  .kpis { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin-bottom: 1rem; }
  .kpi { background: var(--surfaceColor, #16161a); padding: 0.75rem; border-radius: 10px; border: 1px solid var(--borderColor, #2a2a2a); }
  .kpi-label { font-size: 0.8rem; color: var(--mutedText, #9aa0a6); }
  .kpi-value { font-size: 1.1rem; font-weight: 600; }
  .panel { background: var(--surfaceColor, #16161a); border: 1px solid var(--borderColor, #2a2a2a); border-radius: 12px; padding: 0.75rem; }
  .panel-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
  .panel-title { margin: 0; font-size: 1rem; }
  .pager { display: flex; gap: 0.5rem; align-items: center; }
  .btn { padding: 0.4rem 0.7rem; border-radius: 10px; border: 1px solid var(--borderColor, #2a2a2a); background: var(--surfaceColor, #16161a); color: inherit; cursor: pointer; }
  .table-wrap { overflow: auto; border-radius: 10px; }
  .table { width: 100%; border-collapse: collapse; font-size: 0.92rem; }
  .table th, .table td { padding: 0.5rem 0.6rem; border-bottom: 1px solid var(--borderColor, #2a2a2a); }
  .num { text-align: right; }
  .mono { font-family: monospace; }
  .muted { color: var(--mutedText, #9aa0a6); }
</style>
