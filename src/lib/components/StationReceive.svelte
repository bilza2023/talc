<script>
    // Generic "one table + per-row Receive forms"
    // Props:
    //   lanes: [{ fromMmaCode, toMmaCode }]
    //   rows : [{ transportId, fromMmaCode, toMmaCode, supplierId, shade, size, qty, amount, createdAt }]
    //
    // No redirects here. After submit, your +page.server.js should reload rows
    // (you said it already removes the received row).
    //
    // NOTE: This component does not read URL/query; it’s purely driven by props.
    import '$lib/styles/tokens.css';
  
    export let lanes = [];
    export let rows  = [];
  
    // Local, optional in-component filter (All lanes by default)
    let selected = 'ALL'; // key = `${from}→${to}` or 'ALL'
  
    function laneKey(l) { return `${l.fromMmaCode || '(any)'}→${l.toMmaCode}`; }
    function laneLabel(l) { return `${l.fromMmaCode || '(any)'} → ${l.toMmaCode}`; }
  
    $: laneOptions = [{ key: 'ALL', label: 'All Lanes' }, ...lanes.map(l => ({ key: laneKey(l), label: laneLabel(l) }))];
  
    $: filteredRows = selected === 'ALL'
      ? rows
      : rows.filter(r => {
          const [from, to] = selected.split('→');
          return (from === '(any)' || r.fromMmaCode === from) && r.toMmaCode === to;
        });
  
    // Rows are expected already sorted by server; this keeps UI logic simple.
    const fmtNum = (n) => (n == null ? '' : Number(n).toLocaleString(undefined, { maximumFractionDigits: 3 }));
    const fmtDate = (d) => (d ? new Date(d).toLocaleString() : '');
  </script>
  
  <section class="toolbar">
    <div class="lane-filter">
      <label for="lane">Lane</label>
      <select id="lane" bind:value={selected}>
        {#each laneOptions as opt}
          <option value={opt.key}>{opt.label}</option>
        {/each}
      </select>
    </div>
  </section>
  
  <table class="rcv-table">
    <thead>
      <tr>
        <th>Date</th>
        <th>Lane</th>
        <th>Supplier</th>
        <th>Shade</th>
        <th>Size</th>
        <th class="num">Qty</th>
        <th class="num">Amount</th>
        <th class="act">Receive</th>
      </tr>
    </thead>
  
    <tbody>
      {#if filteredRows.length === 0}
        <tr><td colspan="8" class="empty">No inbound transports.</td></tr>
      {:else}
        {#each filteredRows as r}
          <tr>
            <td>{fmtDate(r.createdAt)}</td>
            <td class="lane">{r.fromMmaCode} → {r.toMmaCode}</td>
            <td>#{r.supplierId}</td>
            <td>{r.shade ?? ''}</td>
            <td>{r.size ?? ''}</td>
            <td class="num">{fmtNum(r.qty)}</td>
            <td class="num">{fmtNum(r.amount)}</td>
            <td class="act">
              <form method="POST">
                <!-- Required -->
                <input type="hidden" name="transportId" value={r.transportId} />
                <input type="hidden" name="toMmaCode"   value={r.toMmaCode} />
                <input type="hidden" name="supplierId"  value={r.supplierId} />
  
                <!-- Optional overrides: blank = inherit dispatch defaults -->
                <input name="qty"     type="number" step="0.001" placeholder="qty"     class="sm" />
                <input name="amount"  type="number" step="0.01"  placeholder="amount"  class="sm" />
                <input name="shade"   type="text"              placeholder="shade"   class="sm" />
                <input name="size"    type="text"              placeholder="size"    class="sm" />
  
                <button type="submit" class="btn">Receive</button>
              </form>
            </td>
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>
  
  <style>
    .toolbar {
      display: flex;
      align-items: center;
      gap: var(--spaceMd, 16px);
      margin: var(--spaceMd, 16px) 0;
    }
    .lane-filter label {
      margin-right: var(--spaceSm, 8px);
      color: var(--mutedText, #9fb0a6);
    }
    .rcv-table {
      width: 100%;
      border-collapse: collapse;
      background: var(--surfaceColor, #0f1a16);
      border: 1px solid var(--borderColor, #2b3a36);
      border-radius: var(--radiusLg, 12px);
      overflow: hidden;
    }
    thead th {
      text-align: left;
      padding: 10px;
      font-weight: 600;
      color: var(--primaryText, #e6ebf1);
      background: color-mix(in srgb, var(--surfaceColor, #0f1a16) 85%, #0000);
    }
    tbody td {
      padding: 10px;
      border-top: 1px solid var(--borderColor, #2b3a36);
      color: var(--primaryText, #e6ebf1);
    }
    .lane { white-space: nowrap; }
    .num { text-align: right; }
    .act { white-space: nowrap; }
    .empty { text-align: center; color: var(--mutedText, #9fb0a6); padding: 18px; }
    form { display: inline-flex; gap: 6px; align-items: center; }
    input.sm {
      width: 90px;
      padding: 6px 8px;
      background: var(--surfaceElevated, #13211c);
      color: var(--primaryText, #e6ebf1);
      border: 1px solid var(--borderColor, #2b3a36);
      border-radius: 8px;
    }
    .btn {
      padding: 6px 10px;
      border-radius: 10px;
      border: 1px solid var(--borderColor, #2b3a36);
      background: var(--accentBg, #143428);
      color: var(--primaryText, #e6ebf1);
      cursor: pointer;
    }
    .btn:hover { filter: brightness(1.08); }
  </style>
  