<script>
  export let data;
  export let form;

  const {
    error,
    fromMmaCode,
    toMmaCode,
    supplierId,
    shade,
    size,
    qty
  } = data || {};
</script>

<h1>ABS — Dispatch ({fromMmaCode} → {toMmaCode})</h1>

{#if error}
  <p class="error" aria-live="assertive">{error}</p>
{:else}
  <form method="POST">
    <input type="hidden" name="fromMmaCode" value={fromMmaCode} />
    <input type="hidden" name="toMmaCode" value={toMmaCode} />

    <div class="row">
      <label>Supplier</label>
      <input name="supplierId" value={supplierId} readonly />
    </div>

    <div class="row">
      <label>Shade</label>
      <input name="shade" value={shade} readonly />
    </div>

    <div class="row">
      <label>Size</label>
      <input name="size" value={size} readonly />
    </div>

    <div class="row">
      <label>Quantity (t)</label>
      <input
        name="qty"
        type="number"
        step="0.01"
        min="0.01"
        required
        value={qty || ''} />
    </div>

    {#if form?.error}
      <p class="error" aria-live="assertive">{form.error}</p>
    {/if}

    <button type="submit">Dispatch → KEF_SCREENED</button>
  </form>
{/if}
