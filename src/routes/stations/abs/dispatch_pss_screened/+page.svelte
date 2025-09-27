<script>
  export let data;
  export let form;

  const posted = form?.posted || {};
  const valueFor = (name, fallback = '') =>
    (posted[name] ?? data[name] ?? fallback);
</script>

<h1>ABS → PSS Dispatch (Screened → Screened)</h1>

{#if form?.error}
  <div class="alert alert-error">{form.error}</div>
{/if}

<form method="POST">
  <!-- hidden pass-throughs -->
  <input type="hidden" name="fromMmaCode" value={data.fromMmaCode} />
  <input type="hidden" name="toMmaCode" value={data.toMmaCode} />
  <input type="hidden" name="supplierId" value={data.supplierId} />
  <input type="hidden" name="shade" value={data.shade} />
  <input type="hidden" name="size" value={data.size} />

  <div class="row"><strong>Supplier:</strong> {data.supplierId}</div>
  <div class="row"><strong>Shade:</strong> {data.shade}</div>
  <div class="row"><strong>Size:</strong> {data.size}</div>

  <div class="row">
    <label for="qty">Qty (t)</label>
    <input
      id="qty"
      name="qty"
      type="number"
      min="1"
      step="1"
      inputmode="numeric"
      value={valueFor('qty', '')} 
    />
  </div>

  <div class="actions">
    <button type="submit">Dispatch to PSS_SCREENED</button>
    <a class="btn" href="/stations/abs/abs_screened">Cancel</a>
  </div>
</form>

<style>
  h1 { margin: 0 0 1rem; }
  .row { margin: .5rem 0; }
  label { display:block; margin-bottom:.25rem; }
  input[type="number"] {
    padding: .4rem .6rem; border:1px solid #444; border-radius:.4rem; width: 10rem;
    background: var(--surface-3, #272727); color: inherit;
  }
  .actions { margin-top: 1rem; display:flex; gap:.5rem; }
  button, .btn {
    padding:.45rem .8rem; border:1px solid #444; border-radius:.45rem;
    background: var(--surface-3, #272727); color: inherit; text-decoration:none;
  }
  button:hover, .btn:hover { filter: brightness(1.1); }
  .alert-error { border:1px solid #a33; background:#2a1010; padding:.6rem .8rem; border-radius:.4rem; }
</style>
