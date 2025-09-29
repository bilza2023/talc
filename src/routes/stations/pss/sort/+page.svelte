<!-- /src/routes/stations/pss/sort/+page.svelte -->
<script>
  export let data; // from +page.server.js load()
  export let form; // from actions.sort

  const {
    stationCode, lane, fromMmaCode, toMmaCode,
    supplierId, shade, size, urlQty, onHand
  } = data;

  const posted = form?.posted || {};
</script>

<div class="page">
  <h1>{stationCode} — Sort</h1>
  <p class="muted">Lane: <strong>{lane}</strong></p>

  {#if form?.success}
    <p class="success" aria-live="polite">
      Sorted <code>{posted.qty}</code>t from <code>{fromMmaCode}</code> → <code>{toMmaCode}</code>.
      Process: <code>{form.sorted.processId}</code>
    </p>
  {:else if form?.error}
    <p class="error" aria-live="assertive">
      {form.error}{#if form.detail} — <code>{form.detail}</code>{/if}
    </p>
  {/if}

  <form method="POST" action="?/sort" autocomplete="off" class="form compact" style="width:min(520px,92vw);">
    <!-- Display-only context (using forms.css helpers) -->
    <div class="row">
      <label>Supplier</label>
      <div class="muted">{supplierId ?? '—'}</div>
    </div>
    <div class="row">
      <label>Shade / Size</label>
      <div class="muted">{shade || '—'} / {size || '—'}</div>
    </div>
    <div class="row">
      <label>On-hand</label>
      <div class="muted">{onHand != null ? `${onHand} t` : '—'}</div>
    </div>

    <!-- Hidden lane + identity -->
    <input type="hidden" name="stationCode" value={stationCode} />
    <input type="hidden" name="fromMmaCode" value={fromMmaCode} />
    <input type="hidden" name="toMmaCode"   value={toMmaCode} />
    <input type="hidden" name="supplierId"  value={supplierId} />
    <input type="hidden" name="fromShade"   value={shade} />
    <input type="hidden" name="fromSize"    value={size} />

    <!-- Only three visible inputs -->
    <div class="row">
      <label for="qty">Qty (t)</label>
      <input
        id="qty"
        name="qty"
        type="number"
        step="0.001"
        min="0.001"
        required
        value={posted.qty ?? urlQty ?? ''}
      />
    </div>

    <div class="row">
      <label for="wastage">Wastage</label>
      <input
        id="wastage"
        name="wastage"
        type="number"
        step="0.001"
        value={posted.wastage ?? ''}
      />
    </div>

    <div class="row">
      <label for="ht">HT</label>
      <input
        id="ht"
        name="ht"
        type="number"
        step="0.001"
        value={posted.ht ?? ''}
      />
    </div>

    <div class="actions">
      <button type="submit" class="primary">Sort</button>
    </div>
  </form>
</div>

<style>
  /* Center the form nicely; forms.css handles the form look */
  .page {
    display: grid;
    justify-items: center;
    gap: 12px;
    margin-top: 2rem;
  }
  h1 { margin: 0; }
  .success { color: var(--secondaryColor); }
  .error   { color: color-mix(in oklab, var(--accentColor) 80%, var(--primaryText)); }
</style>
