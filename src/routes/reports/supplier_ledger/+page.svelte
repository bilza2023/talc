<script>
    export let data = {};
  
    // 1) Demo dataset if server hasn’t been wired yet
    const demo = {
      supplier: { id: 1, name: 'Demo Supplier' },
      period: { from: '2025-02-01', to: '2025-04-30' },
      // NOTE: cash block intentionally ignored in this ledger now
      cash: [
        { date: '2025-02-24', amount: 5100000 },
        { date: '2025-03-24', amount: 3000000 },
        { date: '2025-04-12', amount:  500000 },
        { date: '2025-04-15', amount:  200000 },
      ],
      rows: [
        { sno: 1, date: '2025-04-17', particulars: '8393',  lumps: 35.22, chips: 0,     fines: 0,     rate: 39500, value: 1391190, freightMt: 4700, suppFreight: 3000, roadExp: 15000, suppFreightTotal: 120660, cashPaid: 0,  netFreightMt: 1700,  netFreightTotal: 59874,  remarks: '' },
        { sno: 2, date: '2025-04-17', particulars: '11852', lumps: 0,     chips: 35.83, fines: 0,     rate: 39500, value: 1415285, freightMt: 4700, suppFreight: 3000, roadExp: 15000, suppFreightTotal: 122490, cashPaid: 0,  netFreightMt: 1700,  netFreightTotal: 60911,  remarks: '' },
        { sno: 3, date: '2025-04-17', particulars: '92635', lumps: 34.92, chips: 0,     fines: 0,     rate: 39500, value: 1379340, freightMt: 4700, suppFreight: 3000, roadExp: 15000, suppFreightTotal: 119760, cashPaid: 0,  netFreightMt: 1700,  netFreightTotal: 59364,  remarks: '' },
        { sno: 4, date: '2025-04-17', particulars: '86422', lumps: 0,     chips: 35.13, fines: 0,     rate: 39500, value: 1387635, freightMt: 4700, suppFreight: 3000, roadExp: 15000, suppFreightTotal: 120390, cashPaid: 0,  netFreightMt: 1700,  netFreightTotal: 59721,  remarks: '' },
        { sno: 5, date: '2025-04-19', particulars: '22219', lumps: 34.54, chips: 0,     fines: 0,     rate: 39500, value: 1364330, freightMt: 3500, suppFreight: 3000, roadExp: 15000, suppFreightTotal: 118620, cashPaid: 0,  netFreightMt: 500,   netFreightTotal: 17270,  remarks: '' },
        { sno: 6, date: '2025-04-19', particulars: '79343', lumps: 20.93, chips: 14.49, fines: 0,     rate: 39500, value: 1399090, freightMt: 3500, suppFreight: 3000, roadExp: 15000, suppFreightTotal: 121260, cashPaid: 0,  netFreightMt: 500,   netFreightTotal: 17710,  remarks: '' },
        { sno: 7, date: '2025-04-19', particulars: '23824', lumps: 31.32, chips: 0,     fines: 3.93, rate: 39500, value: 1392375, freightMt: 3300, suppFreight: 3000, roadExp: 15000, suppFreightTotal: 120750, cashPaid: 0,  netFreightMt: 300,   netFreightTotal: 10575,  remarks: '' },
      ]
    };
  
    const src = data?.rows?.length ? data : demo;
  
    // 2) Derived totals (IGNORE any top-level 'cash' — discipline: purchases-only ledger)
    $: totals = (() => {
      const q = src.rows.reduce((a, r) => ({
        lumps: a.lumps + (r.lumps || 0),
        chips: a.chips + (r.chips || 0),
        fines: a.fines + (r.fines || 0),
      }), { lumps: 0, chips: 0, fines: 0 });
      const totalQty = q.lumps + q.chips + q.fines;
  
      const money = src.rows.reduce((a, r) => ({
        value: a.value + (r.value || 0),
        suppFreightTotal: a.suppFreightTotal + (r.suppFreightTotal || 0),
        roadExp: a.roadExp + (r.roadExp || 0),
        netFreightTotal: a.netFreightTotal + (r.netFreightTotal || 0),
        cashPaid: a.cashPaid + (r.cashPaid || 0), // per-row allocated only
      }), { value: 0, suppFreightTotal: 0, roadExp: 0, netFreightTotal: 0, cashPaid: 0 });
  
      // Strict mode: do NOT include top cash in this ledger
      const cashTop = 0;
      const totalSuppFreight = money.suppFreightTotal;
      const totalRoadExp = money.roadExp;
      const totalCashPaid = money.cashPaid; // rows-only
      const balance = money.value - (totalSuppFreight + totalRoadExp) - totalCashPaid;
  
      const ratio = totalQty > 0 ? {
        lumps: (q.lumps / totalQty),
        chips: (q.chips / totalQty),
        fines: (q.fines / totalQty),
      } : { lumps: 0, chips: 0, fines: 0 };
  
      return {
        qty: { ...q, total: totalQty },
        value: money.value,
        suppFreight: totalSuppFreight,
        roadExp: totalRoadExp,
        netFreightTotal: money.netFreightTotal,
        cashTop,                // kept for compatibility (now always 0)
        cashPaidRows: money.cashPaid,
        cashPaidAll: totalCashPaid, // equals rows-only now
        balance,
        ratio
      };
    })();
  
    function fmt(n) { return n == null ? '' : n.toLocaleString(); }
    function pct(x) { return (x * 100).toFixed(0) + '%'; }
  </script>
  
  <section class="report">
    <header class="top">
      <div>
        <h1>Supplier Ledger</h1>
        <p class="muted">{src.supplier?.name ?? '—'}</p>
        <p class="muted">Period: {src.period?.from ?? '—'} to {src.period?.to ?? '—'}</p>
      </div>
      <div class="kpis">
        <div class="kpi">
          <div class="kpi-title">Total Value</div>
          <div class="kpi-num">Rs {fmt(totals.value)}</div>
        </div>
        <div class="kpi">
          <div class="kpi-title">Supplier Freight</div>
          <div class="kpi-num">Rs {fmt(totals.suppFreight)}</div>
        </div>
        <div class="kpi">
          <div class="kpi-title">Road Exp</div>
          <div class="kpi-num">Rs {fmt(totals.roadExp)}</div>
        </div>
        <div class="kpi">
          <div class="kpi-title">Cash Paid (All)</div>
          <div class="kpi-num">Rs {fmt(totals.cashPaidAll)}</div>
        </div>
        <div class="kpi">
          <div class="kpi-title">Balance</div>
          <div class="kpi-num strong">Rs {fmt(totals.balance)}</div>
        </div>
      </div>
    </header>
  
    <!-- CASH BLOCK REMOVED -->
  
    <div class="table-wrap">
      <table class="ledger">
        <thead>
          <tr>
            <th>S/No.</th>
            <th>Date</th>
            <th>Particulars</th>
            <th colspan="4">Grade (t)</th>
            <th>Rate/mt</th>
            <th>Value</th>
            <th>Freight/mt</th>
            <th>Supplier Freight</th>
            <th>Road Exp</th>
            <th>Total Supp Freight</th>
            <th>Cash Paid</th>
            <th>NW Freight/mt</th>
            <th>NW Total Freight</th>
            <th>Remarks</th>
          </tr>
          <tr class="subhead">
            <th></th><th></th><th></th>
            <th>Lumps</th><th>Chips</th><th>Fines</th><th>Total</th>
            <th></th><th></th><th></th><th></th><th></th><th></th>
            <th></th><th></th><th></th>
          </tr>
        </thead>
        <tbody>
          {#each src.rows as r}
            {@const totalT = (r.lumps || 0) + (r.chips || 0) + (r.fines || 0)}
            <tr>
              <td>{r.sno}</td>
              <td>{r.date}</td>
              <td>{r.particulars}</td>
              <td class="num">{r.lumps?.toFixed(2) || ''}</td>
              <td class="num">{r.chips?.toFixed(2) || ''}</td>
              <td class="num">{r.fines?.toFixed(2) || ''}</td>
              <td class="num">{totalT.toFixed(2)}</td>
              <td class="num">{fmt(r.rate)}</td>
              <td class="num">{fmt(r.value)}</td>
              <td class="num">{fmt(r.freightMt)}</td>
              <td class="num">{fmt(r.suppFreight)}</td>
              <td class="num">{fmt(r.roadExp)}</td>
              <td class="num">{fmt(r.suppFreightTotal)}</td>
              <td class="num">{fmt(r.cashPaid)}</td>
              <td class="num">{fmt(r.netFreightMt)}</td>
              <td class="num">{fmt(r.netFreightTotal)}</td>
              <td>{r.remarks}</td>
            </tr>
          {/each}
        </tbody>
        <tfoot>
          <tr>
            <th></th><th></th><th>Totals</th>
            <th class="num">{totals.qty.lumps.toFixed(2)}</th>
            <th class="num">{totals.qty.chips.toFixed(2)}</th>
            <th class="num">{totals.qty.fines.toFixed(2)}</th>
            <th class="num">{totals.qty.total.toFixed(2)}</th>
            <th></th>
            <th class="num">{fmt(totals.value)}</th>
            <th></th>
            <th class="num">{fmt(totals.suppFreight)}</th>
            <th class="num">{fmt(totals.roadExp)}</th>
            <th class="num">{fmt(totals.suppFreight)}</th>
            <th class="num">{fmt(totals.cashPaidAll)}</th>
            <th></th>
            <th class="num">{fmt(totals.netFreightTotal)}</th>
            <th></th>
          </tr>
          <tr>
            <th></th><th></th><th>Ratio</th>
            <th class="num">{pct(totals.ratio.lumps)}</th>
            <th class="num">{pct(totals.ratio.chips)}</th>
            <th class="num">{pct(totals.ratio.fines)}</th>
            <th></th>
            <th colspan="10"></th>
          </tr>
        </tfoot>
      </table>
    </div>
  </section>
  
  <style>
    /* tokens.css alignment */
    :root {
      /* only used if a token is missing; remove if all tokens exist */
      --surfaceColor: var(--surfaceColor, #111);
      --cardBg: var(--cardBg, #151515);
      --borderColor: var(--borderColor, #2a2a2a);
      --primaryText: var(--primaryText, #eaeaea);
      --mutedText: var(--mutedText, #aaaaaa);
      --accent: var(--accent, #68b0f1);
    }
  
    .report { color: var(--primaryText); }
    .muted { color: var(--mutedText); }
  
    .top {
      display: flex; gap: 1rem; align-items: flex-end; justify-content: space-between;
      margin-bottom: 1rem; padding-bottom: .5rem; border-bottom: 1px solid var(--borderColor);
    }
    h1 { margin: 0; font-size: 1.25rem; }
    .kpis { display: grid; grid-template-columns: repeat(5, minmax(0,1fr)); gap: .5rem; }
    .kpi { background: var(--cardBg); border: 1px solid var(--borderColor); border-radius: .75rem; padding: .5rem .75rem; }
    .kpi-title { font-size: .75rem; color: var(--mutedText); }
    .kpi-num { font-weight: 600; }
    .kpi-num.strong { color: var(--accent); }
  
    /* cash-block styles removed */
  
    .table-wrap { overflow:auto; border: 1px solid var(--borderColor); border-radius: .5rem; }
    table.ledger { width: max(1200px, 100%); border-collapse: separate; border-spacing: 0; background: var(--surfaceColor); }
    .ledger th, .ledger td { padding: .5rem .5rem; border-bottom: 1px solid var(--borderColor); }
    .ledger thead th { position: sticky; top: 0; background: color-mix(in oklab, var(--surfaceColor), #fff 6%); z-index: 1; }
    .ledger .subhead th { font-weight: 500; color: var(--mutedText); background: color-mix(in oklab, var(--surfaceColor), #fff 3%); }
    .ledger tfoot th { background: color-mix(in oklab, var(--surfaceColor), #fff 6%); }
    .num { text-align: right; }
    @media (max-width: 700px) {
      .kpis { grid-template-columns: repeat(2, minmax(0,1fr)); }
    }
  </style>
  