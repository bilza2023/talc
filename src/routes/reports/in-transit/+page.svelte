
<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  export let data;
  const { envelope, lanes, filters, options } = data ?? {};
  const cols   = envelope?.schema?.columns ?? [];
  const rows   = envelope?.rows ?? [];
  const kpis   = envelope?.kpis ?? {};
  const paging = envelope?.paging ?? { page: 1, hasPrev: false, hasNext: false };

  // helper to build ?query
  function q(obj) {
    const u = new URLSearchParams(browser ? window.location.search : '');
    Object.entries(obj).forEach(([k, v]) =>
      (v === '' || v == null) ? u.delete(k) : u.set(k, String(v))
    );
    return `?${u.toString()}`;
  }

  function setFilter(name, value) {
    window.location.href = q({ [name]: value, page: 1 });
  }
</script>

<h1 class="title">{envelope?.meta?.title || 'In-Transit'}</h1>

<section class="kpis">
  <div class="chip"><span class="lbl">Jobs</span><span class="val">{kpis?.jobs ?? 0}</span></div>
  <div class="chip"><span class="lbl">Qty</span><span class="val">{(kpis?.qty ?? 0).toLocaleString()}</span></div>
  <div class="chip"><span class="lbl">Oldest (h)</span><span class="val">{kpis?.oldestHrs ?? 0}</span></div>
  <div class="chip warn"><span class="lbl">≥48h</span><span class="val">{kpis?.overdue48 ?? 0}</span></div>
</section>

<section class="facets">
  <select on:change={(e)=>setFilter('from', e.target.value)}>
    <option value=''>From</option>
    {#each options?.fromOpts || [] as it}
      <option value={it} selected={filters?.from===it}>{it}</option>
    {/each}
  </select>

  <select on:change={(e)=>setFilter('to', e.target.value)}>
    <option value=''>To</option>
    {#each options?.toOpts || [] as it}
      <option value={it} selected={filters?.to===it}>{it}</option>
    {/each}
  </select>

  <select on:change={(e)=>setFilter('supplierId', e.target.value)}>
    <option value=''>Supplier</option>
    {#each options?.supOpts || [] as it}
      <option value={it} selected={String(filters?.supplierId||'')===String(it)}>{it}</option>
    {/each}
  </select>

  <select on:change={(e)=>setFilter('shade', e.target.value)}>
    <option value=''>Shade</option>
    {#each options?.shadeOpts || [] as it}
      <option value={it} selected={filters?.shade===it}>{it}</option>
    {/each}
  </select>

  <select on:change={(e)=>setFilter('size', e.target.value)}>
    <option value=''>Size</option>
    {#each options?.sizeOpts || [] as it}
      <option value={it} selected={filters?.size===it}>{it}</option>
    {/each}
  </select>

  <select on:change={(e)=>setFilter('ageHrsMin', e.target.value)}>
    {#each options?.ageOpts || [] as it}
      <option value={it} selected={String(filters?.ageHrsMin||'')===String(it)}>{it || 'Age≥0'}</option>
    {/each}
  </select>
</section>

<section class="lanes">
  {#each lanes || [] as l}
    <span class="lane">{l.from}→{l.to} <small>{l.jobs} / {l.qty.toLocaleString()}</small></span>
  {/each}
</section>

<table class="table">
  <thead>
    <tr>{#each cols as c}<th>{c.label}</th>{/each}</tr>
  </thead>
  <tbody>
    {#if rows.length === 0}
      <tr><td colspan={cols.length} class="empty">No results</td></tr>
    {:else}
      {#each rows as r}
        <tr>
          {#each cols as c}
            <td>{c.type === 'datetime'
                ? new Date(r[c.key]).toLocaleString()
                : (typeof r[c.key] === 'number' ? r[c.key].toLocaleString() : r[c.key])}
            </td>
          {/each}
        </tr>
      {/each}
    {/if}
  </tbody>
</table>

<nav class="pager">
  <a class="btn" aria-disabled={!paging.hasPrev} href={paging.hasPrev ? q({ page: paging.page - 1 }) : undefined}>Prev</a>
  <span class="page">Page {paging.page}</span>
  <a class="btn" aria-disabled={!paging.hasNext} href={paging.hasNext ? q({ page: paging.page + 1 }) : undefined}>Next</a>
</nav>

<style>
  .title { text-align:center; margin: .5rem 0 1rem; color: var(--primaryText); }
  .kpis { display:flex; gap:.5rem; flex-wrap:wrap; justify-content:center; margin-bottom:.5rem; }
  .chip { background: var(--surfaceElevated, #121a18); border:1px solid var(--borderColor,#2b3a36);
          padding:.35rem .6rem; border-radius: var(--radiusLg,12px); display:flex; gap:.4rem; align-items:baseline; }
  .chip .lbl { opacity:.8; font-size:.9rem; }
  .chip .val { font-weight:600; }
  .chip.warn { border-color: var(--warningBorder,#664200); }
  .facets { display:flex; gap:.5rem; flex-wrap:wrap; justify-content:center; margin:.5rem 0 .75rem; }
  .facets select { background: var(--surfaceColor,#0f1a16); color: var(--primaryText,#e6ebf1);
                   border:1px solid var(--borderColor,#2b3a36); border-radius: var(--radiusMd,10px); padding:.35rem .5rem; }
  .lanes { display:flex; gap:.4rem; flex-wrap:wrap; justify-content:center; margin-bottom:.5rem; }
  .lane { background: color-mix(in oklab, var(--surfaceColor,#0f1a16) 80%, transparent);
          border:1px dashed var(--borderColor,#2b3a36); padding:.25rem .5rem; border-radius: var(--radiusMd,10px); }
  .table { width:100%; border-collapse: collapse; }
  th, td { border-bottom:1px solid var(--borderColor,#2b3a36); padding:.5rem; text-align:left; color: var(--primaryText,#e6ebf1); }
  thead th { position:sticky; top:0; background: var(--surfaceElevated,#121a18); z-index:1; }
  .empty { text-align:center; opacity:.7; }
  .pager { display:flex; justify-content:center; align-items:center; gap:.75rem; padding:.75rem 0; }
  .btn { padding:.4rem .7rem; border:1px solid var(--borderColor,#2b3a36); border-radius: var(--radiusMd,10px);
         text-decoration:none; color: var(--primaryText,#e6ebf1); background: var(--surfaceColor,#0f1a16); }
  .btn[aria-disabled="true"] { opacity:.5; pointer-events:none; }
  @media (max-width: 640px) { th, td { padding:.4rem; font-size:.92rem; } }
</style>
