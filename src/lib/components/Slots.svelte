<script>
    // Simple, centralized table renderer for stock "slots"
    // Row shape expected: { supplierId:number, shade:string, size:string, qty:number, ... }
  
    export let title = 'Slots';
    export let rows = [];                 // data?.slots
    export let suppliers = null;          // optional: { [id:number]: 'Supplier Name' }
    export let actions = [];              // [{ label, icon?, href:(row)=>string, show?:(row)=>boolean }]
    export let emptyText = 'No stock slots available';
  
    const fmtQty = (q) =>
      Number(q ?? 0).toLocaleString(undefined, { maximumFractionDigits: 3 });
  </script>
  
  {#if title}
    <h1 class="page-title">{title}</h1>
  {/if}
  
  <table class="slots-table">
    <thead>
      <tr>
        <th>Supplier</th>
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
              {#if suppliers && suppliers[r.supplierId]}
                {suppliers[r.supplierId]}
              {:else}
                {r.supplierId}
              {/if}
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
  
  <style>
    :global(body) {
      background: var(--backgroundColor);
      color: var(--baseTextColor);
    }
  
    .page-title {
      text-align: center;
      margin: 0.5rem 0 1rem;
    }
  
    .slots-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid var(--borderColor);
      background: var(--surfaceColor);
      border-radius: 8px;
      overflow: hidden;
    }
  
    thead {
      background: var(--surfaceHover);
    }
  
    th, td {
      padding: 0.5rem 0.75rem;
      border-bottom: 1px solid var(--borderColor);
      text-align: left;
      vertical-align: middle;
      white-space: nowrap;
    }
  
    th.num, td.num { text-align: right; }
    tr:last-child td { border-bottom: none; }
  
    .actions {
      display: inline-flex;
      gap: 0.35rem;
      flex-wrap: wrap;
    }
  
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.3rem 0.6rem;
      border-radius: 0.4rem;
      text-decoration: none;
      color: var(--primaryText);
      border: 1px solid var(--borderColor);
      background: var(--cardColor);
    }
    .btn:hover {
      background: var(--accentColor);
      color: var(--onAccentText, #fff);
    }
  
    .empty {
      text-align: center;
      padding: 1rem;
      opacity: 0.7;
    }
  
    /* mobile overflow safety */
    .slots-table { display: block; overflow-x: auto; }
    .slots-table thead, .slots-table tbody, .slots-table tr { display: table; width: 100%; table-layout: fixed; }
  </style>
  