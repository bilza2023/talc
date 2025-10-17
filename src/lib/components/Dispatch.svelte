<script>
  // Be flexible with incoming props (old/new shapes)
  export let lane = undefined;                 // string "A → B" OR { from, to }
  export let fromMmaCode = undefined;
  export let toMmaCode = undefined;
  export let fromMma = undefined;
  export let toMma = undefined;

  export let supplierId = undefined;           // number | string
  export let shade = '';
  export let size = '';
  export let qty = undefined;                  // number | string
  export let amount = '';                      // optional
  export let onHand = 0;                       // number
  export let error = null;                     // from loader
  export let message = null;                   // from action fail()

  // ---- Normalization (keeps headers and labels correct) ----
  const laneFrom =
    (typeof lane === 'object' && lane?.from) ||
    fromMmaCode || fromMma;
  const laneTo =
    (typeof lane === 'object' && lane?.to) ||
    toMmaCode || toMma;

  const laneLabel =
    typeof lane === 'string'
      ? lane
      : [laneFrom, laneTo].filter(Boolean).join(' → ');

  const fromCode = laneFrom ?? '—';
  const toCode = laneTo ?? '—';

  const n = (v, d = null) => {
    const x = Number(v);
    return Number.isFinite(x) ? x : d;
  };

  // If qty absent, prefill with onHand (same UX as before)
  const initialQty = n(qty, n(onHand, 0)) ?? 0;

  // Display-only mirrors; we still POST via hidden inputs (old pattern)
  const displaySupplierId = supplierId ?? '';
  const displayShade = String(shade ?? '');
  const displaySize = String(size ?? '');
</script>

<h1 class="page-title">Dispatch — {fromCode} → {toCode}</h1>
<div class="subhead">Lane: {fromCode} → {toCode}</div>

{#if error || message}
  <div class="alert error">{error || message}</div>
{/if}

<section class="kpis">
  <div class="kpi">
    <div class="kpi-label">On hand at {fromCode}</div>
    <div class="kpi-value"><b>{n(onHand, 0)}</b> t</div>
  </div>
</section>

<form method="POST" class="form compact">
  <!-- Hidden lane fields to keep server happy (belt & suspenders) -->
  <input type="hidden" name="fromMmaCode" value={fromCode} />
  <input type="hidden" name="toMmaCode" value={toCode} />

  <div class="row">
    <label>Supplier ID</label>
    <input class="ro" value={displaySupplierId} aria-readonly="true" disabled />
    <input type="hidden" name="supplierId" value={displaySupplierId} />
  </div>

  <div class="row">
    <label>Shade</label>
    <input class="ro" value={displayShade} aria-readonly="true" disabled />
    <input type="hidden" name="shade" value={displayShade} />
  </div>

  <div class="row">
    <label>Size</label>
    <input class="ro" value={displaySize} aria-readonly="true" disabled />
    <input type="hidden" name="size" value={displaySize} />
  </div>

  <div class="row">
    <label>Quantity (t)</label>
    <input
      name="qty"
      type="number"
      min="0.001"
      step="0.001"
      required
      value={initialQty}
      placeholder="Enter quantity"
    />
  </div>

  <div class="row">
    <label>Amount (optional)</label>
    <input
      name="amount"
      type="number"
      step="0.01"
      value={amount ?? ''}
      placeholder="e.g. 0 or leave blank"
    />
  </div>

  <div class="actions">
    <button type="submit" class="btn">Dispatch</button>
  </div>
</form>

<style>
  /* Minimal glue only; rely on tokens.css + forms.css for the look */
  .subhead {
    margin-top: 4px;
    opacity: 0.9;
  }
  .kpis {
    display: grid;
    grid-auto-flow: column;
    gap: var(--spaceSm, 10px);
    align-items: center;
    width: 100%;
    max-width: 720px;
  }
  .kpi {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: var(--spaceSm, 10px);
    padding: var(--spaceSm, 10px);
    border: 1px solid var(--borderColor, #2b3a36);
    background: var(--surfaceColor, #0f1a16);
    border-radius: var(--radiusLg, 12px);
  }
  .kpi-label { opacity: 0.85; }
  .kpi-value { text-align: right; }
  .ro { opacity: 0.9; }
  @media (max-width: 640px) {
    .kpis { grid-auto-flow: row; }
  }
</style>
