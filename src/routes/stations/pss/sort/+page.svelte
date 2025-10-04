<script>
  export let data;
  export let form;

  const {
    stationCode, lane, fromMmaCode, toMmaCode,
    supplierId, shade, size, urlQty, onHand
  } = data;

  const err   = form?.error;
  const posted = form?.posted || {};
  const ok    = form?.success;
  const proc  = form?.sorted?.processId;
</script>

<h1>{stationCode} — Sorting</h1>
<p>Lane: <strong>{lane}</strong></p>

{#if ok}
  <p class="success" aria-live="polite">
    Sorted successfully. Process: <code>{proc}</code>
  </p>
{:else if err}
  <p class="error" aria-live="assertive">
    {err}{#if form?.detail} — <code>{form.detail}</code>{/if}
  </p>
{/if}

<form method="POST" action="?/sort" autocomplete="off" class="grid">
  <input type="hidden" name="fromMmaCode" value={fromMmaCode} />
  <input type="hidden" name="toMmaCode"   value={toMmaCode} />

  <label>Supplier ID
    <input name="supplierId" type="number" min="1" required
      value={String(posted.supplierId ?? supplierId ?? '')}/>
  </label>

  <label>Shade
    <input name="fromShade" required value={posted.fromShade ?? shade ?? ''}/>
  </label>

  <label>Size
    <input name="fromSize" required value={posted.fromSize ?? size ?? ''}/>
  </label>

  <label>Qty (t) {#if onHand != null}<small>(available: {onHand})</small>{/if}
    <input name="qty" type="number" min="0.01" step="0.01" required
      value={String(posted.qty ?? urlQty ?? '')}/>
  </label>

  <label>Wastage % (optional)
    <input name="wastage" type="number" step="0.01"
      value={String(posted.wastage ?? '')}/>
  </label>

  <label>HT / Sieve (optional)
    <input name="ht" type="number" step="1"
      value={String(posted.ht ?? '')}/>
  </label>

  <button class="btn">Sort to PSS_SORTED</button>
</form>

<style>
  h1 { margin: 0 0 .4rem; font-size: 1.25rem; }
  .success { color: #2ecc71; margin:.25rem 0; }
  .error { color: #e74c3c; margin:.25rem 0; }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
    gap: .6rem;
    align-items: end;
    margin-top: .5rem;
  }
  label { display: grid; gap: .25rem; font-size: .95rem; }
  input, button { padding: .45rem .55rem; }
  button.btn {
    border: 1px solid var(--border, #333);
    border-radius: .4rem;
    font-weight: 700;
    justify-self: start;
  }
  button.btn:hover { outline: 1px solid currentColor; }
  small { opacity: .7; margin-left: .4rem; }
</style>
