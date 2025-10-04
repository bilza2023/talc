<script>
  export let data;
  export let form;

  const { cfg, supplierId, shade, size, urlQty, onHand, error } = data;

  const err = form?.error || error;
  const posted = form?.posted || {};
  const detail = form?.detail;
</script>

<h1>PSS_SORTED → KEF_SORTED — Dispatch</h1>
<p>Lane: <strong>{cfg.fromMmaCode} → {cfg.toMmaCode}</strong></p>

{#if err}
  <p class="error" aria-live="assertive">
    {err}{#if detail} — <code>{detail}</code>{/if}
  </p>
{/if}

<form method="POST" action="?/dispatchOne" autocomplete="off" class="grid">
  <input type="hidden" name="fromMmaCode" value={cfg.fromMmaCode} />
  <input type="hidden" name="toMmaCode"   value={cfg.toMmaCode} />

  <label>Supplier ID
    <input name="supplierId" type="number" min="1" required
      value={String(posted.supplierId ?? supplierId ?? '')}/>
  </label>

  <label>Shade
    <input name="shade" required value={posted.shade ?? shade ?? ''}/>
  </label>

  <label>Size
    <input name="size" required value={posted.size ?? size ?? ''}/>
  </label>

  <label>Qty (t) {#if onHand != null}<small>(available: {onHand})</small>{/if}
    <input name="qty" type="number" min="0.01" step="0.01" required
      value={String(posted.qty ?? urlQty ?? '')}/>
  </label>

  <label>Amount (optional)
    <input name="amount" type="number" step="0.01" />
  </label>

  <button class="btn">Dispatch to KEF_SORTED</button>
</form>

<style>
  h1 { margin: 0 0 .5rem; font-size: 1.25rem; }
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
