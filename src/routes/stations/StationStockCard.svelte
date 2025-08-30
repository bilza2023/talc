<script>
  // Minimal, reusable dashboard card
  export let title = "";          // "Talc — Live Stock"
  export let stationCode = "";    // "PSS"
  export let deposits = 0;
  export let received = 0;
  export let inTransit = 0;
  export let stock = 0;
  export let unit = "t";

  // Accent still styles the header badge + subtle ring
  export let accent = "#06b6d4";

  // NEW: per-column colors (Deposits, Received, In Transit, Stock)
  // Override per material if you like.
  export let colors = ["#60a5fa", "#34d399", "#fbbf24", "#22d3ee"]; // blue, green, amber, cyan

  const fmt = (n) => `${n ?? 0}${unit ? ` ${unit}` : ""}`;

  // Style variables for easy theming
  $: styleVars = `
    --accent:${accent};
    --c1:${colors[0] ?? "#60a5fa"};
    --c2:${colors[1] ?? "#34d399"};
    --c3:${colors[2] ?? "#fbbf24"};
    --c4:${colors[3] ?? "#22d3ee"};
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
    <div class="stat v1">
      <div class="label">Deposits</div>
      <div class="value">{fmt(deposits)}</div>
    </div>

    <div class="stat v2">
      <div class="label">Received</div>
      <div class="value">{fmt(received)}</div>
    </div>

    <div class="stat v3">
      <div class="label">In Transit</div>
      <div class="value">{fmt(inTransit)}</div>
    </div>

    <div class="stat v4 highlight">
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
    box-shadow: 0 0 0 1px color-mix(in oklab, var(--accent) 20%, transparent) inset;
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
  }

  .stat {
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 12px;
    padding: 10px 12px;
    display: grid;
    gap: 4px;
    min-height: 64px;
    transition: transform .15s ease, box-shadow .15s ease;
  }
  .stat:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.25);
  }

  /* Per-column colors (v1..v4) */
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
  .stat.v4 {
    background:
      radial-gradient(60% 120% at 20% 0%, color-mix(in oklab, var(--c4) 22%, transparent), transparent 70%),
      color-mix(in oklab, var(--c4) 9%, #0c1118);
    border-color: color-mix(in oklab, var(--c4) 45%, rgba(255,255,255,0.06));
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

  .highlight .value {
    /* subtle emphasis on Stock */
    text-shadow: 0 0 14px color-mix(in oklab, var(--c4) 20%, transparent);
  }

  @media (max-width: 720px) {
    .stats { grid-template-columns: repeat(2, 1fr); }
  }
</style>
