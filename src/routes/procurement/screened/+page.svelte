<script>
  export let data; // { mmaCode, sizes, suppliers }

  const shades = ['WHITE', 'GREY', 'LIGHTGREY', 'GREEN', 'MIXED'];

  // Keep Supplier & Size preselected; only Shade asks to pick
  let supplierId = data.suppliers[0]?.id ?? '';
  let shade = ''; // force user to pick
  let size = data.sizes[0];
  let qty = 1;

  let status = null; // { ok:boolean, msg:string }

  async function onSubmit(e) {
    e.preventDefault();
    status = null;

    if (!supplierId) { status = { ok:false, msg:'Please select a supplier.' }; return; }
    if (!shade)      { status = { ok:false, msg:'Please select a shade.' }; return; }
    if (!qty || Number(qty) <= 0) { status = { ok:false, msg:'Quantity must be > 0.' }; return; }

    const params = new URLSearchParams({
      toMmaCode: data.mmaCode,
      supplierId: String(supplierId),
      shade,
      size,
      qty: String(qty)
    });

    const res = await fetch(`/api/deposit?${params.toString()}`, { method: 'POST' });
    const j = await res.json().catch(() => ({ ok:false, error:'Invalid JSON' }));

    status = j.ok ? { ok:true, msg:'Purchase recorded.' } : { ok:false, msg:j.error || 'Failed' };
    if (j.ok) qty = 1; // keep selections, just reset qty
  }
</script>

<h1 class="page-title">ABS — Purchase (to {data.mmaCode})</h1>

{#if status}
  <div class="notice {status.ok ? 'success' : 'error'}" aria-live="polite">{status.msg}</div>
{/if}

<form class="form card" on:submit={onSubmit} autocomplete="off">
  <div class="grid">
    <div class="field">
      <label class="label">Supplier</label>
      <select class="control" bind:value={supplierId} required>
        {#if !data.suppliers.length}
          <option value="" disabled>(no suppliers found)</option>
        {:else}
          {#each data.suppliers as s}
            <option value={s.id}>{s.name} ({s.code})</option>
          {/each}
        {/if}
      </select>
    </div>

    <div class="field">
      <label class="label">Shade</label>
      <select class="control" bind:value={shade} required>
        <option value="" disabled>Pick a shade…</option>
        {#each shades as sh}
          <option value={sh}>{sh}</option>
        {/each}
      </select>
    </div>

    <div class="field">
      <label class="label">Size</label>
      <select class="control" bind:value={size} required>
        {#each data.sizes as z}
          <option value={z}>{z}</option>
        {/each}
      </select>
    </div>

    <div class="field">
      <label class="label">Quantity (t)</label>
      <input class="control" type="number" min="0.01" step="0.01" bind:value={qty} required />
    </div>
  </div>

  <div class="actions">
    <button
      type="submit"
      class="btn primary"
      disabled={!data.suppliers.length || !supplierId || !shade || !qty}
    >
      Add to {data.mmaCode}
    </button>
  </div>
</form>

<style>
  /* works with your forms.css */
  .page-title { margin-bottom: .75rem; }
  .card { padding: 1rem; }
  .grid { display: grid; gap: .75rem; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
  .notice.success { color: #1db954; }
  .notice.error { color: #ff4d4f; }
</style>
