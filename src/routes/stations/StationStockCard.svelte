
<script>
  // Minimal props — all optional except title if you want one shown.
  export let title = "";          // e.g. "Talc — Live Stock" or "Ore — Live Stock"
  export let stationCode = "";    // e.g. "PSS" (shown as a small badge)
  export let deposits = 0;
  export let received = 0;
  export let inTransit = 0;
  export let stock = 0;           // highlighted
  export let unit = "t";          // "t" for tons; set "" to hide unit
  export let accent = "#06b6d4";  // pick any color per material/card

  const fmt = (n) => `${n ?? 0}${unit ? ` ${unit}` : ""}`;
</script>

<article class="card" style={`--accent:${accent}`}>
  {#if title || stationCode}
    <header class="head">
      {#if title}<h3 class="title">{title}</h3>{/if}
      {#if stationCode}<span class="badge">{stationCode}</span>{/if}
    </header>
  {/if}

  <div class="stats">
    <div class="stat">
      <div class="label">Deposits</div>
      <div class="value">{fmt(deposits)}</div>
    </div>

    <div class="stat">
      <div class="label">Received</div>
      <div class="value">{fmt(received)}</div>
    </div>

    <div class="stat">
      <div class="label">In Transit</div>
      <div class="value">{fmt(inTransit)}</div>
    </div>

    <div class="stat highlight">
      <div class="label">Stock</div>
      <div class="value">{fmt(stock)}</div>
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
    padding: 14px 16px;
    color: var(--text);
    box-shadow: 0 10px 30px rgba(0,0,0,0.25);
  }

  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
    gap: 8px;
  }

  .title {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 600;
    letter-spacing: .2px;
  }

  .badge {
    border: 1px solid color-mix(in oklab, var(--accent) 55%, transparent);
    color: color-mix(in oklab, var(--accent) 90%, white);
    padding: 2px 8px;
    border-radius: 999px;
    font-weight: 600;
    letter-spacing: .3px;
    font-size: .8rem;
    white-space: nowrap;
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
  }

  .stat {
    background: color-mix(in oklab, var(--accent) 6%, #0c1118);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 12px;
    padding: 10px 12px;
    display: grid;
    gap: 4px;
    min-height: 64px;
  }

  .label {
    font-size: .75rem;
    color: var(--muted);
    letter-spacing: .3px;
  }

  .value {
    font-size: 1.1rem;
    font-weight: 700;
    line-height: 1.2;
  }

  .stat.highlight {
    background:
      radial-gradient(60% 120% at 20% 0%, color-mix(in oklab, var(--accent) 16%, transparent), transparent 70%),
      color-mix(in oklab, var(--accent) 7%, #0c1118);
    border-color: color-mix(in oklab, var(--accent) 40%, rgba(255,255,255,0.1));
    box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--accent) 20%, transparent);
  }

  @media (max-width: 720px) {
    .stats { grid-template-columns: repeat(2, 1fr); }
  }
</style>
