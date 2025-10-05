<script>
  import { enhance } from '$app/forms';

  export let data;   // { stationCode, lane, sizes, fromUrl }
  export let form;   // { success?, error?, detail?, screeningId?, allocated? }

  const { stationCode, lane, sizes, fromUrl } = data;

  // Local inputs for the three size fields
  let qty = Object.fromEntries(sizes.map(s => [s, 0]));

  $: allocated = sizes.reduce((sum, s) => sum + Number(qty[s] || 0), 0);
  $: remaining = Math.max(0, Number(fromUrl.fromQtyT || 0) - allocated);

  const fmt = (n) => Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 6 });
</script>

<h1>{stationCode} — Screening</h1>
<p>Lane: <strong>{lane}</strong></p>

<section class="panel">
  <div class="info-grid">
    <div>
      <label>Supplier</label>
      <div class="ro">{fromUrl.supplierId}</div>
    </div>
    <div>
      <label>Shade</label>
      <div class="ro">{fromUrl.fromShade}</div>
    </div>
    <div>
      <label>Available (t)</label>
      <div class="ro">{fmt(fromUrl.fromQtyT)}</div>
    </div>
    <div>
      <label>Allocated (t)</label>
      <div class="ro">{fmt(allocated)}</div>
    </div>
    <div>
      <label>Remaining (t)</label>
      <div class="ro">{fmt(remaining)}</div>
    </div>
  </div>
</section>

{#if form?.success}
  <p class="success" aria-live="polite">
    Screening posted. Header ID: <code>{form.screeningId}</code> — Allocated: <strong>{fmt(form.allocated)}</strong>t
  </p>
{:else if form?.error}
  <p class="error" aria-live="assertive">
    {form.error}{#if form.detail} — <code>{form.detail}</code>{/if}
  </p>
{/if}

<form method="POST" action="?/screen" use:enhance class="form-grid" autocomplete="off">
  <input type="hidden" name="supplierId" value={fromUrl.supplierId} />
  <input type="hidden" name="fromShade"   value={fromUrl.fromShade} />
  <input type="hidden" name="fromQtyT"    value={fromUrl.fromQtyT} />

  <div class="sizes-grid">
    {#each sizes as size}
      <div class="size-card">
        <label>{size}</label>
        <input
          type="number"
          name={"qty_" + size}
          step="any"
          min="0"
          bind:value={qty[size]}
          placeholder="0"
        />
      </div>
    {/each}
  </div>

  <div class="actions">
    <button type="submit" disabled={allocated <= 0}>Run Screening</button>
    <button type="submit" formaction="?/cancel" formmethod="POST" class="secondary">Cancel</button>
  </div>
</form>

<style>
  /* summary panel */
  .panel { margin: 1rem 0; padding: .9rem; border: 1px solid var(--accents-2); border-radius: .6rem; }
  .info-grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0,1fr));
    gap: .6rem;
    align-items: end;
  }
  .ro { padding: .45rem .6rem; border: 1px dashed var(--accents-3); border-radius: .45rem; font-weight: 600; }

  /* form layout */
  .form-grid { display: grid; gap: 1rem; }
  .sizes-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 220px)); /* three neat columns */
    gap: .9rem;
  }
  .size-card {
    display: grid;
    gap: .35rem;
    padding: .9rem;
    border: 1px solid var(--accents-2);
    border-radius: .6rem;
  }
  .size-card input { padding: .55rem .65rem; }

  .actions { display: flex; gap: .6rem; }
  .success { color: var(--success); margin-top: .25rem; }
  .error { color: var(--error); margin-top: .25rem; }
  .secondary { opacity: .85; }
</style>
