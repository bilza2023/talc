<script>
  export let data;
  const d = data?.defaults ?? {};

  // Normalize defaults
  const supplierId = d?.supplierId ?? '';
  const shade      = d?.shade ?? '';
  const size       = d?.size ?? '';
  const qty        = d?.qty ?? '';
  const ht         = d?.ht ?? '';
  const wastage    = d?.wastage ?? '';
</script>

<h1 class="title">PSS — Sort (Screened → Sorted)</h1>

{#if supplierId || shade || size || qty}
  <div class="prefill">
    <span>Prefilled →</span>
    {#if supplierId}<b>Supplier:</b> {supplierId}{/if}
    {#if shade} <b>· Shade:</b> {shade}{/if}
    {#if size}  <b>· Size:</b> {size}{/if}
    {#if qty}   <b>· Qty(t):</b> {qty}{/if}
  </div>
{/if}

<form method="POST" action="?/sort" class="form compact">
  <!-- Supplier (readonly, still submitted) -->
  <div class="row">
    <label for="supplierId">Supplier ID</label>
    <input
      id="supplierId"
      name="supplierId"
      type="number"
      min="1"
      step="1"
      value={supplierId}
      readonly
      required
    />
  </div>

  <!-- Shade (lock as text input so it submits; select can't be readonly) -->
  <div class="row">
    <label for="shade">Shade</label>
    <input
      id="shade"
      name="shade"
      type="text"
      value={shade}
      readonly
      required
    />
  </div>

  <!-- Size (lock as text input so it submits) -->
  <div class="row">
    <label for="size">Size</label>
    <input
      id="size"
      name="size"
      type="text"
      value={size}
      readonly
      required
    />
  </div>

  <!-- Quantity (readonly to keep URL as the source of truth) -->
  <div class="row">
    <label for="qty">Quantity (t)</label>
    <input
      id="qty"
      name="qty"
      type="number"
      min="0.01"
      step="0.01"
      value={qty}
      readonly
      required
    />
  </div>

  <!-- Optional fields: editable -->
  <div class="row">
    <label for="ht">HT (optional)</label>
    <input
      id="ht"
      name="ht"
      type="number"
      step="0.01"
      placeholder="e.g. 6"
      value={ht}
    />
  </div>

  <div class="row">
    <label for="wastage">Wastage (optional)</label>
    <input
      id="wastage"
      name="wastage"
      type="number"
      step="0.01"
      placeholder="e.g. 0.25"
      value={wastage}
    />
  </div>

  <div class="actions">
    <button type="submit" class="primary">Post Sort</button>
  </div>
</form>
