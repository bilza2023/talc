<script>
  import '$lib/styles/tokens.css';

  export let lanes = [];
  export let rows  = [];

  // Filter (client-side only; server already sends sorted rows)
  let selected = 'ALL'; // 'ALL' or `${from}→${to}`
  const laneKey   = (l) => `${l.fromMmaCode || '(any)'}→${l.toMmaCode}`;
  const laneLabel = (l) => `${l.fromMmaCode || '(any)'} → ${l.toMmaCode}`;

  $: laneOptions = [{ key: 'ALL', label: 'All Lanes' }, ...lanes.map(l => ({ key: laneKey(l), label: laneLabel(l) }))];

  $: filtered = selected === 'ALL'
    ? rows
    : rows.filter(r => {
        const [from, to] = selected.split('→');
        return (from === '(any)' || r.fromMmaCode === from) && r.toMmaCode === to;
      });

  const fmtNum  = (n) => (n == null ? '' : Number(n).toLocaleString(undefined, { maximumFractionDigits: 3 }));
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

{#if filtered.length === 0}
  <div class="empty">No inbound transports.</div>
{:else}
  <div class="cards">
    {#each filtered as r}
      <article class="card">
        <!-- DETAILS -->
        <header class="card-header">
          <div class="lane">{r.fromMmaCode} → {r.toMmaCode}</div>
          <div class="date">{fmtDate(r.createdAt)}</div>
        </header>

        <div class="rows">
          <div class="row">
            <div class="label">Supplier</div>
            <div class="value">#{r.supplierId}</div>
          </div>
          <div class="row">
            <div class="label">Shade</div>
            <div class="value">{r.shade ?? ''}</div>
          </div>
          {#if r.size}
          <div class="row">
            <div class="label">Size</div>
            <div class="value">{r.size}</div>
          </div>
          {/if}
          <div class="row">
            <div class="label">Qty</div>
            <div class="value num">{fmtNum(r.qty)}</div>
          </div>
          <div class="row">
            <div class="label">Amount</div>
            <div class="value num">{fmtNum(r.amount)}</div>
          </div>
        </div>

        <!-- RECEIVE FORM (stacked; mobile-first) -->
        <form method="POST" class="rcv-form">
          <input type="hidden" name="transportId" value={r.transportId} />
          <input type="hidden" name="toMmaCode"   value={r.toMmaCode} />
          <input type="hidden" name="supplierId"  value={r.supplierId} />

          <div class="grid">
            <label class="field">
              <span>Qty (optional)</span>
              <input name="qty" type="number" step="0.001" placeholder="Leave blank to inherit" />
            </label>
            <label class="field">
              <span>Amount (optional)</span>
              <input name="amount" type="number" step="0.01" placeholder="Leave blank to inherit" />
            </label>
            <label class="field full">
              <span>Shade (optional)</span>
              <input name="shade" type="text" placeholder="Leave blank to inherit" />
            </label>
          </div>

          <button type="submit" class="btn">Receive</button>
        </form>
      </article>
    {/each}
  </div>
{/if}

<style>
  /* Improve mobile text rendering and avoid weird shrink */
  :global(html) {
    -webkit-text-size-adjust: 100%;
    text-size-adjust: 100%;
  }

  /* Toolbar */
  .toolbar {
    display: flex;
    align-items: center;
    gap: var(--spaceMd, 16px);
    margin: var(--spaceSm, 12px) 0 var(--spaceMd, 16px);
  }
  .lane-filter {
    display: inline-flex;
    align-items: center;
    gap: var(--spaceSm, 8px);
  }
  .lane-filter label {
    color: var(--mutedText, #9fb0a6);
    font-size: 0.95rem;
  }
  .lane-filter select {
    padding: 8px 10px;
    background: var(--surfaceElevated, #13211c);
    color: var(--primaryText, #e6ebf1);
    border: 1px solid var(--borderColor, #2b3a36);
    border-radius: 10px;
    font-size: 16px; /* prevent mobile zoom/shrink */
  }

  /* Empty state */
  .empty {
    width: 100%;
    padding: 18px;
    border: 1px solid var(--borderColor, #2b3a36);
    border-radius: var(--radiusLg, 12px);
    color: var(--mutedText, #9fb0a6);
    background: var(--surfaceColor, #0f1a16);
    text-align: center;
  }

  /* Cards grid (mobile-first) */
  .cards {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--spaceMd, 16px);
  }
  /* Keep single column on portrait to avoid initial shrink */
  @media (orientation: portrait) {
    .cards { grid-template-columns: 1fr; }
  }
  /* Only go 2-up on sufficiently wide landscape */
  @media (orientation: landscape) and (min-width: 920px) {
    .cards { grid-template-columns: 1fr 1fr; }
  }

  .card {
    border: 1px solid var(--borderColor, #2b3a36);
    border-radius: var(--radiusXl, 16px);
    background: var(--surfaceColor, #0f1a16);
    overflow: clip;
    box-shadow: var(--shadowSm, 0 1px 2px rgba(0,0,0,0.25));
  }

  .card-header {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 8px 12px;
    padding: 12px 14px;
    background: color-mix(in srgb, var(--surfaceColor, #0f1a16) 85%, #0000);
    border-bottom: 1px solid var(--borderColor, #2b3a36);
  }
  .lane {
    color: var(--primaryText, #e6ebf1);
    font-weight: 600;
    line-height: 1.25;
    word-break: break-word; /* long codes wrap gracefully */
  }
  .date {
    color: var(--mutedText, #9fb0a6);
    font-size: 0.95rem;
    white-space: nowrap;
  }

  .rows {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px 16px;
    padding: 12px 14px 6px;
  }
  .row {
    display: grid;
    grid-template-columns: 120px 1fr;
    gap: 8px;
    align-items: baseline;
  }
  .row .label {
    color: var(--mutedText, #9fb0a6);
    font-size: 0.95rem;
  }
  .row .value {
    color: var(--primaryText, #e6ebf1);
  }
  .row .value.num {
    text-align: right;
  }

  /* Force fully stacked detail rows on narrow portrait */
  @media (max-width: 560px), (orientation: portrait) and (max-width: 760px) {
    .rows { grid-template-columns: 1fr; }
    .row  { grid-template-columns: 1fr 1fr; }
  }

  /* Receive form */
  .rcv-form {
    display: grid;
    gap: 12px;
    padding: 12px 14px 14px;
    border-top: 1px solid var(--borderColor, #2b3a36);
  }

  .rcv-form .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;  /* desktop/tablet */
    gap: 10px 12px;
  }
  .rcv-form .grid .full {
    grid-column: 1 / -1;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .field span {
    color: var(--mutedText, #9fb0a6);
    font-size: 0.9rem;
  }
  .field input {
    width: 100%;
    min-width: 0;        /* allow shrinking without overflow */
    padding: 10px 12px;  /* slightly larger for touch targets */
    background: var(--surfaceElevated, #13211c);
    color: var(--primaryText, #e6ebf1);
    border: 1px solid var(--borderColor, #2b3a36);
    border-radius: 12px;
    font-size: 16px;     /* avoids iOS zoom + tiny render */
    line-height: 1.25;
  }

  .btn {
    justify-self: end;
    padding: 10px 14px;
    border-radius: 12px;
    border: 1px solid var(--borderColor, #2b3a36);
    background: var(--accentBg, #143428);
    color: var(--primaryText, #e6ebf1);
    cursor: pointer;
    font-size: 16px;
    line-height: 1.25;
  }
  .btn:hover { filter: brightness(1.08); }

  /* Portrait & small landscape: force single-column form + full-width button */
  @media (max-width: 760px), (orientation: portrait) {
    .rcv-form .grid { grid-template-columns: 1fr; }
    .btn { width: 100%; justify-self: stretch; text-align: center; }
  }
</style>
