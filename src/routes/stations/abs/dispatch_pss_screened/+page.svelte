

<script>
  export let data; // now includes data.available
  let qty = data.qty ?? 1;
  let status = null;

  $: if (data.available > 0 && qty > data.available) qty = data.available; // clamp

  async function onSubmit(e) {
    e.preventDefault();
    status = null;

    if (!(qty > 0)) { status = { ok:false, msg:'Quantity must be > 0.' }; return; }
    if (data.available <= 0) { status = { ok:false, msg:'No stock available for this selection.' }; return; }
    if (qty > data.available) { status = { ok:false, msg:`Max available is ${data.available}.` }; return; }

    const p = new URLSearchParams({
      fromMmaCode: data.fromMmaCode,
      toMmaCode: data.toMmaCode,
      supplierId: String(data.supplierId),
      shade: data.shade,
      size: data.size,
      qty: String(qty)
    });

    const res = await fetch(`/api/dispatch?${p.toString()}`, { method: 'POST' });
    const j = await res.json().catch(() => ({ ok:false, error:'Invalid JSON' }));
    status = j.ok ? { ok:true, msg:'Dispatched.' } : { ok:false, msg:j.error || 'Failed' };
    if (j.ok) window.location.href = '/stations/abs/abs_screened';
  }
</script>

<h1 class="page-title">Dispatch — ABS ➜ PSS (Screened)</h1>

{#if data.error}
  <div class="notice error">{data.error}</div>
{:else}
  <div class="card" style="margin-bottom:.75rem">
    <strong>Available:</strong> {data.available} t for
    <code>{data.fromMmaCode}</code> / supplier <code>{data.supplierId}</code> / {data.shade} / {data.size}
  </div>

  {#if status}
    <div class="notice {status.ok ? 'success' : 'error'}" aria-live="polite">{status.msg}</div>
  {/if}

  <form class="form card" on:submit={onSubmit} autocomplete="off">
    <div class="grid">
      <div class="field"><label class="label">From MMA</label><input class="control" value={data.fromMmaCode} readonly></div>
      <div class="field"><label class="label">To MMA</label><input class="control" value={data.toMmaCode} readonly></div>
      <div class="field"><label class="label">Supplier ID</label><input class="control" value={data.supplierId} readonly></div>
      <div class="field"><label class="label">Shade</label><input class="control" value={data.shade} readonly></div>
      <div class="field"><label class="label">Size</label><input class="control" value={data.size} readonly></div>
      <div class="field">
        <label class="label">Quantity (t)</label>
        <input class="control" type="number" min="0.01" step="0.01" bind:value={qty} required>
        <small>Max: {data.available}</small>
      </div>
    </div>
    <div class="actions">
      <button type="submit" class="btn primary" disabled={data.available <= 0}>Dispatch to PSS</button>
      <a class="btn" href="/stations/abs/abs_screened">Back</a>
    </div>
  </form>
{/if}

<style>
  .page-title { margin-bottom: .75rem; }
  .card { padding: 1rem; }
  .grid { display: grid; gap: .75rem; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
  .notice.success { color: #1db954; }
  .notice.error { color: #ff4d4f; }
</style>
