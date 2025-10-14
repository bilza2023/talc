<script>
  export let title = 'Slots';
  export let rows = [];
  export let suppliers = null;
  export let actions = [];
  export let emptyText = 'No stock slots available';

  const fmtQty = (q) => Number(q ?? 0).toLocaleString(undefined, { maximumFractionDigits: 3 });
</script>

{#if title}
  <h1 class="page-title">{title}</h1>
{/if}

<div class="table-wrap">
  <table class="slots-table">
    <thead>
      <tr>
        <th>-</th>
        <th>Shade</th>
        <th>Size</th>
        <th class="num">Qty (t)</th>
        <th>Actions</th>
      </tr>
    </thead>

    <tbody>
      {#if !rows || rows.length === 0}
        <tr><td colspan="5" class="empty">{emptyText}</td></tr>
      {:else}
        {#each rows as r, i (r.supplierId + '-' + r.shade + '-' + r.size + '-' + i)}
          <tr>
            <td>
             -
            </td>
            <td>{r.shade}</td>
            <td>{r.size}</td>
            <td class="num">{fmtQty(r.qty)}</td>
            <td class="actions">
              {#each actions as a, j (j)}
                {#if !a.show || a.show(r)}
                  <a class="btn" href={a.href(r)} title={a.label}>
                    {#if a.icon}<span class="i">{a.icon}</span>{/if}
                    <span class="t">{a.label}</span>
                  </a>
                {/if}
              {/each}
            </td>
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>
</div>

<style>
  /* page text uses tokens already loaded */
  .page-title { text-align: center; margin: .5rem 0 1rem; }

  /* 1) Scroll wrapper to prevent any horizontal spill */
  .table-wrap {
    width: 90%;
    margin: 10px auto;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .slots-table {
    width: 100%;
    border-collapse: collapse;
    border: 1px solid var(--borderColor);
    background: var(--surfaceColor);
    border-radius: 8px;
    overflow: hidden;
    table-layout: auto; /* natural widths (better on mobile) */
  }

  thead { background: var(--surfaceHover); }

  /* 2) Let cells wrap by default (fixes overflow) */
  th, td {
    padding: .5rem .75rem;
    border-bottom: 1px solid var(--borderColor);
    text-align: left;
    vertical-align: middle;
    white-space: normal;     /* was nowrap — this caused spill */
    word-break: break-word;  /* long supplier names won’t push width */
  }

  /* Only keep numbers non-wrapping */
  th.num, td.num { text-align: right; white-space: nowrap; }
  tr:last-child td { border-bottom: none; }

  /* 3) Actions wrap nicely on small screens */
  .actions {
    display: inline-flex;
    gap: .35rem;
    flex-wrap: wrap;
    min-width: 8rem;   /* prevents tiny jitter, but still wraps */
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: .35rem;
    padding: .32rem .56rem;
    border-radius: .4rem;
    text-decoration: none;
    color: var(--primaryText);
    border: 1px solid var(--borderColor);
    background: var(--cardColor);
    line-height: 1.1;
  }
  .btn:hover { background: var(--accentColor); color: var(--onAccentText, #fff); }

  .empty { text-align: center; padding: 1rem; opacity: .7; }

  /* 4) Mobile-first refinements */
  @media (max-width: 520px) {
    th, td { padding: .45rem .55rem; }
    .actions { gap: .3rem; }
    .btn { padding: .3rem .5rem; }
  }
</style>
