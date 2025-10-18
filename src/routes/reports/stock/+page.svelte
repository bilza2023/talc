<script>
  export let data;
  const title   = data?.title ?? 'MMA Stock Totals';
  const columns = data?.columns ?? ['Unscreened', 'Screened', 'Sorted', 'Product'];
  const rows    = data?.rows ?? [];

  const fmt = (n) => Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 3 });

  // compute totals per column
  const totals = {};
  for (const c of columns) totals[c] = rows.reduce((s, r) => s + Number(r[c] || 0), 0);

  // nice icons
  const icons = {
    Unscreened: '🪨',
    Screened: '🧺',
    Sorted: '⚙️',
    Product: '📦'
  };
</script>

<section class="wrap">
  <h1 class="title">{title}</h1>

  <div class="table-scroller">
    <table class="stock-table">
      <thead>
        <tr>
          <th class="mma-head">🏗️ MMA</th>
          {#each columns as col}
            <th class="num head">
              <div class="col-head">
                <span class="icon">{icons[col]}</span>
                <span>{col}</span>
              </div>
            </th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each rows as r}
          <tr>
            <td class="mma">{r.mmaCode}</td>
            {#each columns as col}
              <td class="num">{fmt(r[col])}</td>
            {/each}
          </tr>
        {/each}

        <!-- grand total -->
        <tr class="total-row">
          <td class="mma">Total</td>
          {#each columns as col}
            <td class="num total">{fmt(totals[col])}</td>
          {/each}
        </tr>
      </tbody>
    </table>
  </div>
</section>

<style>
  .wrap {
    max-width: 960px;
    margin-inline: auto;
    padding: var(--spaceLg, 24px);
    display: grid;
    gap: var(--spaceMd, 16px);
  }

  .title {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    text-align: center;
    color: var(--primaryText, #e6ebf1);
    letter-spacing: 0.5px;
  }

  .table-scroller { overflow-x: auto; }

  .stock-table {
    width: 100%;
    border-collapse: collapse;
    background: linear-gradient(180deg, #0e1814 0%, #111d18 100%);
    border-radius: var(--radiusXl, 16px);
    overflow: hidden;
    box-shadow: 0 2px 6px rgba(0,0,0,0.35);
  }

  thead {
    background: linear-gradient(90deg, #0b3c2a 0%, #126347 100%);
    color: #dff4ec;
  }

  .stock-table th, .stock-table td {
    padding: 12px 14px;
    white-space: nowrap;
  }

  .stock-table thead th {
    font-weight: 700;
    font-size: 0.95rem;
    text-transform: uppercase;
    border-bottom: 2px solid rgba(255,255,255,0.1);
  }

  .col-head {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.4em;
  }
  .icon {
    font-size: 1rem;
  }

  tbody tr {
    transition: background 0.2s, transform 0.1s;
  }
  tbody tr:hover {
    background: rgba(255,255,255,0.05);
    transform: scale(1.005);
  }

  .mma-head { text-align: left; }
  .mma {
    font-weight: 600;
    text-align: left;
    color: #cfeae0;
  }
  .num {
    text-align: right;
    font-variant-numeric: tabular-nums;
    color: #e8f6f0;
  }

  .total-row {
    background: rgba(19, 90, 62, 0.4);
    border-top: 2px solid rgba(255,255,255,0.1);
  }
  .total-row .mma {
    font-weight: 700;
    color: #fff;
  }
  .total-row .total {
    font-weight: 700;
    color: #9affd5;
  }
</style>
