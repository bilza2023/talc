<script>
  export let rows = [];
  export let showTotals = true;

  // Local expand/collapse state for remarks
  let open = new Set();
  const toggle = (key) => {
    const next = new Set(open);
    next.has(key) ? next.delete(key) : next.add(key);
    open = next;
  };

  const fmt = (n) => (n == null ? '' : Number(n).toLocaleString());
  const pct = (x) => ((x || 0) * 100).toFixed(0) + '%';

  // Totals for tfoot
  $: totals = (() => {
    const q = rows.reduce((a, r) => ({
      lumps: a.lumps + (r.lumps || 0),
      chips: a.chips + (r.chips || 0),
      fines: a.fines + (r.fines || 0),
    }), { lumps: 0, chips: 0, fines: 0 });
    const totalQty = q.lumps + q.chips + q.fines;

    const money = rows.reduce((a, r) => ({
      value: a.value + (r.value || 0),
      roadExp: a.roadExp + (r.roadExp || 0),
      suppFreightTotal: a.suppFreightTotal + (r.suppFreightTotal || 0),
      netFreightTotal: a.netFreightTotal + (r.netFreightTotal || 0),
      cashPaidAll: a.cashPaidAll + (r.cashPaid || 0),
    }), { value: 0, roadExp: 0, suppFreightTotal: 0, netFreightTotal: 0, cashPaidAll: 0 });

    const ratio = totalQty > 0 ? {
      lumps: q.lumps / totalQty,
      chips: q.chips / totalQty,
      fines: q.fines / totalQty
    } : { lumps: 0, chips: 0, fines: 0 };

    return {
      qty: { ...q, total: totalQty },
      value: money.value,
      roadExp: money.roadExp,
      suppFreightTotal: money.suppFreightTotal,
      cashPaidAll: money.cashPaidAll,
      netFreightTotal: money.netFreightTotal,
      ratio
    };
  })();
</script>

<table class="ledger">
  <thead>
    <tr>
      <th class="data">S/No.</th>
      <th class="data">Date</th>
      <th class="data">Particulars</th>
      <th class="data" colspan="4">Grade (t)</th>
      <th class="data">Rate/mt</th>
      <th class="calc">Value</th>
      <th class="data">Freight/mt</th>
      <th class="data">Supplier Freight</th>
      <th class="data">Road Exp</th>
      <th class="calc">Total Supp Freight</th>
      <th class="data">Cash Paid</th>
      <th class="calc">NW Freight/mt</th>
      <th class="calc">NW Total Freight</th>
      <th class="data">Remarks</th>
    </tr>
    <tr class="subhead">
      <th></th><th></th><th></th>
      <th class="data">Lumps</th>
      <th class="data">Chips</th>
      <th class="data">Fines</th>
      <th class="calc">Total</th>
      <th></th><th></th><th></th><th></th>
      <th></th><th></th><th></th><th></th>
      <th></th>
    </tr>
  </thead>

  <tbody>
    {#each rows as r}
      {@const totalT = (r.lumps || 0) + (r.chips || 0) + (r.fines || 0)}
      {@const key = r.sno ?? r.purchaseId}
      {@const href = r.depositLedgerId ? `/ledger/${r.depositLedgerId}` : `/purchase/${r.purchaseId}`}

      <tr>
        <td class="data">{r.sno}</td>
        <td class="data">{r.date}</td>
        <td class="data">
          <a class="link" href={href} title="View details">{r.particulars}</a>
          {#if r.supplierName}
            <span class="supplier-badge">· {r.supplierName}</span>
          {/if}
        </td>
        <td class="data num">{r.lumps?.toFixed(2) || ''}</td>
        <td class="data num">{r.chips?.toFixed(2) || ''}</td>
        <td class="data num">{r.fines?.toFixed(2) || ''}</td>
        <td class="calc num">{totalT.toFixed(2)}</td>
        <td class="data num">{fmt(r.rate)}</td>
        <td class="calc num">{fmt(r.value)}</td>
        <td class="data num">{fmt(r.freightMt)}</td>
        <td class="data num">{fmt(r.suppFreight)}</td>
        <td class="data num">{fmt(r.roadExp)}</td>
        <td class="calc num">{fmt(r.suppFreightTotal)}</td>
        <td class="data num">{fmt(r.cashPaid)}</td>
        <td class="calc num">{fmt(r.netFreightMt)}</td>
        <td class="calc num">{fmt(r.netFreightTotal)}</td>
        <td class="data">
          {#if r.remarks}
            <button class="notes" type="button" on:click={() => toggle(key)} aria-expanded={open.has(key)}>
              {open.has(key) ? 'Hide' : 'Notes'}
            </button>
          {/if}
        </td>
      </tr>

      {#if r.remarks && open.has(key)}
        <tr class="remarks-row">
          <td colspan="17">
            <span class="remarks-label">Remarks:</span> {r.remarks}
          </td>
        </tr>
      {/if}
    {/each}
  </tbody>

  {#if showTotals}
    <tfoot>
      <tr>
        <th></th><th></th><th class="data">Totals</th>
        <th class="data num">{totals.qty.lumps.toFixed(2)}</th>
        <th class="data num">{totals.qty.chips.toFixed(2)}</th>
        <th class="data num">{totals.qty.fines.toFixed(2)}</th>
        <th class="calc num">{totals.qty.total.toFixed(2)}</th>
        <th></th>
        <th class="calc num">{fmt(totals.value)}</th>
        <th></th>
        <th></th>
        <th class="data num">{fmt(totals.roadExp)}</th>
        <th class="calc num">{fmt(totals.suppFreightTotal)}</th>
        <th class="data num">{fmt(/* rows-only */ totals.cashPaidAll)}</th>
        <th></th>
        <th class="calc num">{fmt(totals.netFreightTotal)}</th>
        <th></th>
      </tr>
      <tr>
        <th></th><th></th><th class="data">Ratio</th>
        <th class="data num">{pct(totals.ratio.lumps)}</th>
        <th class="data num">{pct(totals.ratio.chips)}</th>
        <th class="data num">{pct(totals.ratio.fines)}</th>
        <th></th>
        <th colspan="10"></th>
      </tr>
    </tfoot>
  {/if}
</table>

<style>
  /* uses your tokens.css only */
  table.ledger{
    width:100%;
    border-collapse:collapse;
    background:var(--surfaceColor);
    color:var(--primaryText);
    font-size:.95rem;
    border:1px solid var(--borderColor);
  }
  .ledger th,.ledger td{
    padding:.5rem .6rem;
    border:1px solid var(--borderColor);
    white-space:nowrap;
  }
  thead th{
    position:sticky; top:0;
    background: color-mix(in oklab, var(--surfaceColor), var(--backgroundColor) 30%);
    color: var(--primaryColor);
    z-index:2;
  }
  .subhead th{
    font-weight:500; color:var(--secondaryText);
    background: color-mix(in oklab, var(--surfaceColor), var(--backgroundColor) 15%);
  }

  /* semantic columns */
  .ledger th.data, .ledger td.data{ color: var(--primaryText); }
  .ledger th.calc, .ledger td.calc{
    color: var(--accentColor);
    background: color-mix(in oklab, var(--surfaceColor), var(--accentColor) 6%);
    font-weight:600;
  }

  /* notes + remarks */
  .notes{
    font: inherit;
    color: var(--primaryColor);
    background: transparent;
    border: 1px solid var(--borderColor);
    border-radius: .35rem;
    padding: .1rem .4rem;
    cursor: pointer;
  }
  .notes:hover{ border-color: var(--primaryColor); }

  .remarks-row td{
    background: color-mix(in oklab, var(--surfaceColor), var(--backgroundColor) 10%);
    color: var(--secondaryText);
  }
  .remarks-label{
    color: var(--secondaryText);
    margin-right: .5rem;
    font-weight: 600;
  }

  /* link + supplier badge */
  .link{
    color: var(--primaryColor);
    text-decoration: none;
    border-bottom: 1px dashed var(--primaryColor);
  }
  .link:hover{ text-decoration: underline; }
  .supplier-badge{
    color: var(--secondaryText);
    margin-left: .35rem;
    font-size: .9em;
  }

  .num{ text-align:right; }
</style>
