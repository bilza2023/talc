<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  export let data;

  // reactive so UI updates on navigation
  $: env = data.envelope;
  $: paging = env?.paging ?? { page: 1, totalPages: 1, hasPrev: false, hasNext: false };

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

  :global(body) {
    background: var(--backgroundColor, #0e0e10);
    color: var(--primaryText, #e5e5e5);
    overflow-x: hidden; /* ✅ stops page-level horizontal scroll */
  }

  .table-wrap {
    width: 100%;
    max-width: 100%;
    overflow-x: auto;
    border-radius: 10px;
  }

  .table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;   /* ✅ ensures consistent column widths */
    font-size: 0.92rem;
  }

  .table th,
  .table td {
    padding: 0.5rem 0.6rem;
    border-bottom: 1px solid var(--borderColor, #2a2a2a);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;  /* ✅ trims extra-long text */
  }


  :global(body) {
    background: var(--backgroundColor, #0e0e10);
    color: var(--primaryText, #e5e5e5);
  }
  .page-title {
    text-align: center;
    margin: 0.75rem 0;
    font-size: 1.4rem;
  }
  .panel {
    background: var(--surfaceColor, #16161a);
    border: 1px solid var(--borderColor, #2a2a2a);
    border-radius: 12px;
    padding: 0.75rem;
  }
  .panel-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }
  .panel-title { margin: 0; font-size: 1rem; }
  .pager { display: flex; gap: 0.5rem; align-items: center; }
  .btn {
    padding: 0.4rem 0.7rem;
    border-radius: 10px;
    border: 1px solid var(--borderColor, #2a2a2a);
    background: var(--surfaceColor, #16161a);
    color: inherit;
    cursor: pointer;
  }
  .table-wrap { overflow: auto; border-radius: 10px; }
  .table { width: 100%; border-collapse: collapse; font-size: 0.92rem; }
  .table th, .table td {
    padding: 0.5rem 0.6rem;
    border-bottom: 1px solid var(--borderColor, #2a2a2a);
    white-space: nowrap;
  }
  .num { text-align: right; }
  .mono { font-family: monospace; }
  .muted { color: var(--mutedText, #9aa0a6); }
</style>
