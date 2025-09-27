<!-- /src/routes/stations/abs/purchase_unscreened/+page.svelte -->
<script>
  export let data;   // { mmaCode, suppliers, shadeOptions, sizeOptions, urlQty? }
  export let form;   // SvelteKit form action result

  const suppliers = data.suppliers ?? [];
  const shades = data.shadeOptions ?? [];
  const sizes = data.sizeOptions ?? [];
  const defaultQty = form?.posted?.qty ?? (data.urlQty ?? '');
</script>

<h1>ABS — Purchase (Unscreened)</h1>

<form class="form" method="POST" action="?/purchaseUnscreened" autocomplete="off">
  <div class="row">
    <label for="supplierId">Supplier</label>
    <select id="supplierId" name="supplierId" required>
      {#each suppliers as s}
        <option
          value={s.id}
          selected={String(form?.posted?.supplierId) === String(s.id)}>
          {s.name} (#{s.id})
        </option>
      {/each}
    </select>
  </div>

  <div class="row">
    <label for="shade">Shade</label>
    <select id="shade" name="shade" required>
      {#each shades as sh}
        <option value={sh} selected={form?.posted?.shade === sh}>{sh}</option>
      {/each}
    </select>
  </div>

  <div class="row">
    <label for="size">Size</label>
    <select id="size" name="size" required>
      {#each sizes as sz}
        <option value={sz} selected={form?.posted?.size === sz}>{sz}</option>
      {/each}
    </select>
  </div>

  <div class="row">
    <label for="qty">Quantity (t)</label>
    <div>
      <input
        id="qty"
        type="number"
        name="qty"
        min="0"
        step="0.01"
        required
        value={defaultQty} />
      <div class="hint">Enter tons (e.g., 12.5)</div>
    </div>
  </div>

  <div class="actions">
    <input type="submit" class="primary" value="Purchase" />
  </div>

  {#if form?.error}
    <p class="error">{form.error}</p>
  {:else if form?.success}
    <p class="success">
      Purchased {form.posted.qty}t → {data.mmaCode}
      (supplier {form.posted.supplierId}, {form.posted.shade}/{form.posted.size})
    </p>
  {/if}
</form>
