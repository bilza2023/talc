<script>
  export let data;
  export let form;

  const { stationName, mmaCode, suppliers, shadeOptions, sizeOptions } = data;
  const success = form?.success;
  const error   = form?.error;
  const posted  = form?.posted || {};
</script>

<h1>{stationName} — Purchase (Unscreened)</h1>
<p>MMA: <strong>{mmaCode}</strong></p>

{#if success}
  <div class="alert alert-success" role="alert">
    Purchased {posted.qty}t → {mmaCode}
    (supplier {posted.supplierId}, {posted.shade}/{posted.size}).
  </div>
{:else if error}
  <div class="alert alert-error" role="alert">{error}</div>
{/if}

<form method="POST" action="?/purchaseUnscreened" autocomplete="off">
  <div class="row">
    <label for="supplierId">Supplier</label>
    <select id="supplierId" name="supplierId" required>
      <option value="" disabled selected>Choose supplier</option>
      {#each suppliers as s}
        <option value={s.id} selected={posted.supplierId == s.id}>{s.id} — {s.name}</option>
      {/each}
    </select>
  </div>

  <div class="row">
    <label for="shade">Shade</label>
    <select id="shade" name="shade" required>
      <option value="" disabled selected>Choose shade</option>
      {#each shadeOptions as opt}
        <option value={opt} selected={posted.shade === opt}>{opt}</option>
      {/each}
    </select>
  </div>

  <div class="row">
    <label for="size">Size</label>
    <select id="size" name="size" required>
      <option value="" disabled selected>Choose size</option>
      {#each sizeOptions as opt}
        <option value={opt} selected={posted.size === opt}>{opt}</option>
      {/each}
    </select>
  </div>

  <div class="row">
    <label for="qty">Quantity (t)</label>
    <input id="qty" name="qty" type="number" step="0.01" min="0.01" required value={posted.qty ?? ''}/>
  </div>

  <div class="row">
    <label for="note">Note</label>
    <input id="note" name="note" type="text" placeholder="optional"/>
  </div>

  <button type="submit">Record Purchase</button>
</form>
