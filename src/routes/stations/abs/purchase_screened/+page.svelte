<!-- /src/routes/stations/abs/purchase_screened/+page.svelte -->
<script>
  export let data; // { stationName, mmaCode, suppliers, shadeOptions, sizeOptions, urlQty? }
  export let form; // SvelteKit action result

  const suppliers = data.suppliers ?? [];
  const shades = data.shadeOptions ?? [];
  const sizes = data.sizeOptions ?? [];
  const defaultQty = form?.posted?.qty ?? (data.urlQty ?? '');
</script>

<h1>{data.stationName} — Purchase (Screened)</h1>
<p>MMA: <strong>{data.mmaCode}</strong></p>

{#if form?.success}
  <p class="success" aria-live="polite">
    Purchased {form.posted.qty}t → {data.mmaCode}
    (supplier {form.posted.supplierId}, {form.posted.shade}/{form.posted.size}).
  </p>
{:else if form?.error}
  <p class="error" aria-live="polite">{form.error}</p>
{/if}

<form class="form" method="POST" action="?/purchaseScreened" autocomplete="off">
  <div class="row">
    <label class="req" for="supplierId">Supplier</label>
    <select id="supplierId" name="supplierId" required>
      <option value="">Pick one…</option>
      {#each suppliers as s}
        <option
          value={s.id}
          selected={String(form?.posted?.supplierId ?? '') === String(s.id)}>
          {s.name} ({s.code})
        </option>
      {/each}
    </select>
  </div>

  <div class="row">
    <label class="req" for="shade">Shade</label>
    <select id="shade" name="shade" required>
      <option value="">Pick one…</option>
      {#each shades as opt}
        <option value={opt} selected={form?.posted?.shade === opt}>{opt}</option>
      {/each}
    </select>
  </div>

  <div class="row">
    <label class="req" for="size">Size</label>
    <select id="size" name="size" required>
      <option value="">Pick one…</option>
      {#each sizes as opt}
        <option value={opt} selected={form?.posted?.size === opt}>{opt}</option>
      {/each}
    </select>
  </div>

  <div class="row">
    <label class="req" for="qty">Quantity (tons)</label>
    <div>
      <input
        id="qty"
        name="qty"
        type="number"
        required
        step="0.001"
        min="0.001"
        placeholder="e.g., 12.500"
        value={defaultQty} />
      <div class="hint">Enter tons (e.g., 12.500)</div>
    </div>
  </div>

  <div class="row">
    <label for="note">Note</label>
    <input id="note" name="note" type="text" placeholder="Optional note" value={form?.posted?.note ?? ''} />
  </div>

  <div class="actions">
    <input type="submit" class="primary" value={`Purchase → ${data.mmaCode}`} />
  </div>
</form>
