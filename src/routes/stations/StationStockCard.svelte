<script>
  // 3-metric station card (Batch & Edge)
  export let title = '';
  export let stationCode = '';

  export let stock = 0;      // from batches (sum remainingTon)
  export let inbound = 0;    // sum dispatchWeight of in_transit edges to this station
  export let outbound = 0;   // sum dispatchWeight of in_transit edges from this station
  export let unit = 't';

  // Theme
  export let accent = '#06b6d4';
  export let colors = ['#22d3ee', '#34d399', '#60a5fa']; // stock, inbound, outbound

  const fmt = (n) => `${Number(n ?? 0).toFixed(3)}${unit ? ` ${unit}` : ''}`;

  $: styleVars = `
    --accent:${accent};
    --c1:${colors[0] ?? '#22d3ee'};
    --c2:${colors[1] ?? '#34d399'};
    --c3:${colors[2] ?? '#60a5fa'};
  `;
</script>

<article class="card" style={styleVars}>
  {#if title || stationCode}
    <header class="head">
      {#if title}<h3 class="title">{title}</h3>{/if}
      {#if stationCode}<span class="badge">{stationCode}</span>{/if}
    </header>
  {/if}

  <div class="stats">
    <div class="stat v1 highlight stock">
      <div class="label">Stock</div>
      <div class="value">{fmt(stock)}</div>
    </div>
    <div class="sub-stats">
      <div class="stat v2">
        <div class="label">In&nbsp;Bound</div>
        <div class="value">{fmt(inbound)}</div>
      </div>
      <div class="stat v3">
        <div class="label">Out&nbsp;Bound</div>
        <div class="value">{fmt(outbound)}</div>
      </div>
    </div>
  </div>
</article>

<style>
  .card {
    --bg: linear-gradient(180deg, #0b1018, #0a0d13);
    --border: rgba(255,255,255,0.06);
    --text: #e6ebf1;
    --muted: #9aa3af;

    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 16px;
    color: var(--text);
    box-shadow: 0 10px 30px rgba(0,0,0,0.25);
  }

  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    gap: 8px;
  }
  .title {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 600;
    letter-spacing: 0.2px;
  }

  .badge {
    border: 1px solid color-mix(in oklab, var(--accent) 55%, transparent);
    color: color-mix(in oklab, var(--accent) 90%, white);
    padding: 3px 10px;
    border-radius: 999px;
    font-weight: 600;
    letter-spacing: 0.3px;
    font-size: 0.9rem;
    white-space: nowrap;
    box-shadow: 0 0 0 1px color-mix(in oklab, var(--accent) 20%, transparent) inset;
  }

  .stats {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .sub-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .stat {
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 12px;
    padding: 12px;
    display: grid;
    text-align: center;
    gap: 6px;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }
  .stat:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.25);
  }

  .stat.stock {
    min-height: 80px;
  }

  .stat.v1 {
    background:
      radial-gradient(60% 120% at 20% 0%, color-mix(in oklab, var(--c1) 18%, transparent), transparent 70%),
      color-mix(in oklab, var(--c1) 7%, #0c1118);
    border-color: color-mix(in oklab, var(--c1) 35%, rgba(255,255,255,0.06));
  }
  .stat.v2 {
    background:
      radial-gradient(60% 120% at 20% 0%, color-mix(in oklab, var(--c2) 18%, transparent), transparent 70%),
      color-mix(in oklab, var(--c2) 7%, #0c1118);
    border-color: color-mix(in oklab, var(--c2) 35%, rgba(255,255,255,0.06));
  }
  .stat.v3 {
    background:
      radial-gradient(60% 120% at 20% 0%, color-mix(in oklab, var(--c3) 18%, transparent), transparent 70%),
      color-mix(in oklab, var(--c3) 7%, #0c1118);
    border-color: color-mix(in oklab, var(--c3) 35%, rgba(255,255,255,0.06));
  }

  .label {
    font-size: 0.85rem;
    color: var(--muted);
    letter-spacing: 0.3px;
  }
  .value {
    font-size: 1.4rem;
    font-weight: 700;
    line-height: 1.2;
  }
  .stock .value {
    font-size: 1.8rem;
    text-align: center;
  }
  .highlight .value {
    text-shadow: 0 0 14px color-mix(in oklab, var(--c1) 20%, transparent);
  }
</style>