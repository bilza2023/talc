<script>
  import { browser } from '$app/environment';
  export let data;

  const { envelope } = data ?? {};

  const cols    = envelope?.schema?.columns ?? [];
  const rows    = envelope?.rows ?? [];
  const paging  = envelope?.paging ?? { page: 1, pageSize: rows.length || 0, hasPrev: false, hasNext: false };

  // base index so S.No stays continuous across pages
  const baseIndex = ((paging.page || 1) - 1) * (paging.pageSize || 0);

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

<h1 class="title">{envelope?.meta?.title || 'In-Transit'}</h1>

<table class="table">
  <thead>
    <tr>
      <th style="width:4.5rem">S.No</th>
      {#each cols as c}<th>{c.label}</th>{/each}
    </tr>
  </thead>
  <tbody>
    {#if rows.length === 0}
      <tr><td colspan={cols.length + 1} class="empty">No results</td></tr>
    {:else}
      {#each rows as r, i}
        <tr>
          <td>{(baseIndex + i + 1).toLocaleString()}</td>
          {#each cols as c}
            <td>
              {#if c.type === 'datetime'}
                {new Date(r[c.key]).toLocaleString()}
              {:else if typeof r[c.key] === 'number'}
                {r[c.key].toLocaleString()}
              {:else}
                {r[c.key]}
              {/if}
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
