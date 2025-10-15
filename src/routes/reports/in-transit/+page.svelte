<script>
  import { page } from '$app/stores';
  import { get } from 'svelte/store';

  export let data;
  const { envelope, lanes, filters, options } = data ?? {};
  const cols = envelope?.schema?.columns ?? [];
  const rows = envelope?.rows ?? [];
  const paging = envelope?.paging ?? { page: 1, hasPrev: false, hasNext: false };

  // SSR-safe query builder (no window usage)
  function q(obj) {
    const url = get(page).url; // SSR-safe
    const sp = new URLSearchParams(url.searchParams);
    for (const [k, v] of Object.entries(obj)) {
      if (v === '' || v == null) sp.delete(k);
      else sp.set(k, String(v));
    }
    const qs = sp.toString();
    return qs ? `?${qs}` : '?';
  }
</script>

<h1 class="title">{envelope?.meta?.title || 'In-Transit'}</h1>

<section class="kpis">
  <div class="chip">Jobs <b>{envelope?.kpis?.jobs ?? 0}</b></div>
  <div class="chip">Qty (t) <b>{(envelope?.kpis?.qty ?? 0).toLocaleString()}</b></div>
  <div class="chip">Oldest (h) <b>{envelope?.kpis?.oldestHrs ?? 0}</b></div>
  <div class="chip">≥48h <b>{envelope?.kpis?.overdue48 ?? 0}</b></div>
</section>

<form method="GET" class="filters">
  <select name="from">
    <option value="">From (all)</option>
    {#each options.fromOpts as o}<option value={o} selected={filters.from===o}>{o}</option>{/each}
  </select>

  <select name="to">
    <option value="">To (all)</option>
    {#each options.toOpts as o}<option value={o} selected={filters.to===o}>{o}</option>{/each}
  </select>

  <select name="supplierId">
    <option value="">Supplier (all)</option>
    {#each options.supOpts as o}<option value={o} selected={filters.supplierId===o}>{o}</option>{/each}
  </select>

  <select name="shade">
    <option value="">Shade (all)</option>
    {#each options.shadeOpts as o}<option value={o} selected={filters.shade===o}>{o}</option>{/each}
  </select>

  <select name="size">
    <option value="">Size (all)</option>
    {#each options.sizeOpts as o}<option value={o} selected={filters.size===o}>{o}</option>{/each}
  </select>

  <select name="ageHrsMin" title="Minimum age (hours)">
    {#each options.ageOpts as o}<option value={o} selected={filters.ageHrsMin===o}>{o || 'Age ≥ (any)'}</option>{/each}
  </select>

  <button class="btn" type="submit">Apply</button>
  <a class="link-reset" href="?">Reset</a>
</form>

{#if lanes?.length}
  <details class="lanes">
    <summary>Lane roll-up</summary>
    <table>
      <thead><tr><th>From</th><th>To</th><th>Jobs</th><th class="num">Qty</th></tr></thead>
      <tbody>
        {#each lanes as L}
          <tr><td>{L.from}</td><td>{L.to}</td><td>{L.jobs}</td><td class="num">{L.qty.toLocaleString()}</td></tr>
        {/each}
      </tbody>
    </table>
  </details>
{/if}

<table class="tbl">
  <thead>
    <tr>{#each cols as c}<th class={c.type==='num' || c.key==='qty' ? 'num' : ''}>{c.label}</th>{/each}</tr>
  </thead>
  <tbody>
    {#if rows.length === 0}
      <tr><td colspan={cols.length} class="empty">No in-transit rows</td></tr>
    {:else}
      {#each rows as r}
        <tr>
          {#each cols as c}
            <td class={(c.key==='qty' || c.key==='amount') ? 'num' : ''}>
              {#if c.type==='datetime'}
                {new Date(r[c.key]).toLocaleString()}
              {:else if c.key==='qty' || c.key==='amount'}
                {Number(r[c.key] ?? 0).toLocaleString()}
              {:else}
                {r[c.key] ?? '—'}
              {/if}
            </td>
          {/each}
        </tr>
      {/each}
    {/if}
  </tbody>
</table>

<nav class="pager">
  {#if paging.hasPrev}<a class="btn" href={q({ page: (paging.page - 1) })}>← Prev</a>{/if}
  <span>Page {paging.page}</span>
  {#if paging.hasNext}<a class="btn" href={q({ page: (paging.page + 1) })}>Next →</a>{/if}
</nav>

<style>
  .title { margin: .25rem 0 0; text-align:center; color: var(--baseText, #e6ebf1); }
  .kpis { display:flex; gap:.5rem; flex-wrap:wrap; margin:.5rem 0 1rem; justify-content:center; }
  .chip { padding:.35rem .6rem; border:1px solid var(--borderColor,#2b3a36); border-radius: var(--radiusXl,16px); background: color-mix(in srgb, var(--surfaceColor,#0f1a16) 70%, transparent); }
  .filters { display:flex; gap:.5rem; flex-wrap:wrap; align-items:center; margin:.5rem 0 1rem; }
  .filters select, .btn { padding:.4rem .6rem; border-radius: var(--radiusLg,12px); border:1px solid var(--borderColor,#2b3a36); background: var(--surfaceColor,#0f1a16); color: var(--baseText,#e6ebf1); }
  .filters .link-reset { margin-left:.25rem; opacity:.85; }
  .lanes { margin:.5rem 0 1rem; }
  .tbl { width:100%; border-collapse: collapse; }
  .tbl th, .tbl td { padding:.5rem; border-bottom:1px solid var(--borderColor,#2b3a36); }
  .tbl th { text-align:left; opacity:.9; }
  .num { text-align:right; }
  .empty { text-align:center; opacity:.8; padding:1rem; }
  .pager { display:flex; gap:.75rem; justify-content:center; align-items:center; margin:1rem 0; }
  .pager .btn { padding:.4rem .7rem; border:1px solid var(--borderColor,#2b3a36); border-radius: var(--radiusLg,12px); background: var(--surfaceColor,#0f1a16); color: var(--baseText,#e6ebf1); text-decoration:none; }
  @media (max-width: 640px){ .tbl th:nth-child(2), .tbl td:nth-child(2) { display:none; } }
</style>
