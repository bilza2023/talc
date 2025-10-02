<script>
  export let data;
  const { suppliers, shadeOptions, sizeOptions } = data;
</script>

<h1>{data.stationCode} — Purchase (Screened)</h1>

<form method="POST" action="?/purchaseScreened">
  <label>Supplier
    <select name="supplierId" required>
      <option value="">— choose —</option>
      {#each suppliers as s}
        <option value={s.id}>{s.name ?? s.id}</option>
      {/each}
    </select>
  </label>

  <label>Shade
    <select name="shade" required>
      {#each shadeOptions as sh}<option value={sh}>{sh}</option>{/each}
    </select>
  </label>

  <label>Size
    <select name="size" required>
      {#each sizeOptions as sz}<option value={sz}>{sz}</option>{/each}
    </select>
  </label>

  <label>Qty
    <input name="qty" type="number" min="0.01" step="0.01" required />
  </label>

  <button type="submit">Save</button>
</form>
