<script>
  export let data;
  export let form; // SvelteKit populates this with the action result
</script>

<h1>{data.stationName} — Purchase (Unscreened)</h1>
<p>MMA: <strong>{data.mmaCode}</strong></p>

{#if form?.success}
  <div class="alert alert-success" role="alert" style="margin: 12px 0;">
    Purchased {form.posted.qty}t → {data.mmaCode}
    (supplier {form.posted.supplierId}, {form.posted.shade}/{form.posted.size}).
  </div>
{:else if form?.error}
  <div class="alert alert-error" role="alert" style="margin: 12px 0;">
    {form.error}
  </div>
{/if}

<form method="POST" action="?/purchaseUnscreened" autocomplete="off">
  <div class="row" style="margin: 8px 0;">
    <label class="req" for="supplierId">Supplier</label>
    <select id="supplierId" name="supplierId" required>
      <option value="">Pick one…</option>
      {#each data.suppliers as s}
        <option value={s.id}>{s.name} ({s.code})</option>
      {/each}
    </select>
  </div>

  <div class="row" style="margin: 8px 0;">
    <label class="req" for="shade">Shade</label>
    <select id="shade" name="shade" required>
      <option value="">Pick one…</option>
      {#each data.shadeOptions as opt}
        <option value={opt}>{opt}</option>
      {/each}
    </select>
  </div>

  <div class="row" style="margin: 8px 0;">
    <label class="req" for="size">Size</label>
    <select id="size" name="size" required>
      <option value="">Pick one…</option>
      {#each data.sizeOptions as opt}
        <option value={opt}>{opt}</option>
      {/each}
    </select>
  </div>

  <div class="row" style="margin: 8px 0;">
    <label class="req" for="qty">Quantity (tons)</label>
    <input id="qty" name="qty" type="number" required step="0.001" min="0.001" placeholder="e.g., 12.500" />
  </div>

  <div class="row" style="margin: 8px 0;">
    <label for="note">Note</label>
    <input id="note" name="note" type="text" placeholder="Optional note" />
  </div>

  <div style="margin-top: 12px;">
    <button type="submit">Purchase → {data.mmaCode}</button>
  </div>
</form>
