<script>
  export let data; // { mmaCode, sizes, suppliers }

  // Preselect first supplier (if any) so supplierId is never empty by default.
  let supplierId = data.suppliers[0]?.id ?? '';
  let shade = 'WHITE';
  let size = data.sizes[0];
  let qty = 1;

  let status = null; // { ok, msg }

  async function onSubmit(e) {
    e.preventDefault();
    status = null;

    // Manual validation because we're bypassing native form submit
    if (!supplierId) {
      status = { ok: false, msg: 'Please select a supplier.' };
      return;
    }
    if (!qty || Number(qty) <= 0) {
      status = { ok: false, msg: 'Quantity must be > 0.' };
      return;
    }

    const params = new URLSearchParams({
      toMmaCode: data.mmaCode,
      supplierId: String(supplierId),
      shade: String(shade || ''),
      size: String(size || 'ANY'),
      qty: String(qty)
    });

    const res = await fetch(`/api/deposit?${params.toString()}`, { method: 'POST' });
    const j = await res.json().catch(() => ({ ok: false, error: 'Invalid JSON' }));

    status = j.ok
      ? { ok: true,  msg: 'Purchase recorded.' }
      : { ok: false, msg: j.error || 'Failed' };

    if (j.ok) qty = 1;
  }
</script>

<h1>ABS — Purchase (to {data.mmaCode})</h1>

{#if status}
  <p class={status.ok ? 'success' : 'error'} aria-live="polite">{status.msg}</p>
{/if}

<form on:submit={onSubmit} autocomplete="off">
  <label>Supplier
    <select bind:value={supplierId} required>
      {#if !data.suppliers.length}
        <option value="" disabled>(no suppliers found)</option>
      {:else}
        {#each data.suppliers as s}
          <option value={s.id}>{s.name} ({s.code})</option>
        {/each}
      {/if}
    </select>
  </label>

  <label>Shade
    <input bind:value={shade} required />
  </label>

  <label>Size
    <select bind:value={size} required>
      {#each data.sizes as z}
        <option value={z}>{z}</option>
      {/each}
    </select>
  </label>

  <label>Quantity (t)
    <input type="number" min="0.01" step="0.01" bind:value={qty} required />
  </label>

  <button type="submit" disabled={!data.suppliers.length}>Add to {data.mmaCode}</button>
</form>

<style>
  form { display: grid; gap: .75rem; max-width: 420px; }
  label { display: grid; gap: .25rem; }
  .success { color: #1db954; }
  .error { color: #ff4d4f; }
</style>
