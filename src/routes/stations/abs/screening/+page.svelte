<!-- /src/routes/stations/abs/screening/+page.svelte -->
<script>
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';

  export let data;   // { stationCode, lane, sizes, from }
  export let form;   // { success?, error?, detail?, screeningId?, allocated?, availableDb? }

  const { stationCode, lane, sizes = [], from = {} } = data ?? {};

  // Read URL query params (non-breaking override layer)
  $: sp = $page.url.searchParams;
  $: supplierIdQS = sp.get('supplierId');
  $: shadeQS      = sp.get('shade');
  $: qtyQS        = sp.get('qty');

  // Merge: URL overrides server data only if present
  $: fromView = {
    supplierId: supplierIdQS != null ? Number(supplierIdQS) : from.supplierId,
    shade:      shadeQS ?? from.shade,
    availableDb: qtyQS != null ? Number(qtyQS) : from.availableDb
  };

  // Local inputs: one field per size
  let qty = Object.fromEntries(sizes.map(s => [s, 0]));

  // Derived numbers
  $: allocated = sizes.reduce((sum, s) => sum + Number(qty[s] || 0), 0);
  $: available = Number((form?.availableDb ?? fromView.availableDb ?? from.availableDb) || 0);
  $: remaining = Math.max(0, available - allocated);

  const fmt = (n) => Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 6 });
</script>

<h1>{stationCode} — Screening</h1>
<p>Lane: <strong>{lane}</strong></p>

<section class="panel">
  <div class="info-grid">
    <div>
      <label>Supplier</label>
      <div class="ro">{fromView.supplierId}</div>
    </div>
    <div>
      <label>Shade</label>
      <div class="ro">{fromView.shade}</div>
    </div>
    <div>
      <label>Available (t)</label>
      <div class="ro">{fmt(available)}</div>
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

<!-- Add .form to use your existing forms.css; keep existing structure/classes -->
<form method="POST" action="?/screen" use:enhance class="form form-grid" autocomplete="off">
  <input type="hidden" name="supplierId" value={fromView.supplierId} />
  <input type="hidden" name="fromShade"   value={fromView.shade} />
  <input type="hidden" name="availableDb" value={available} />

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
    <button type="submit" class="primary" disabled={allocated <= 0}>Run Screening</button>
    <button type="submit" formaction="?/cancel" formmethod="POST" class="secondary">Cancel</button>
  </div>
</form>

<style>
  /* Minimal layout only — visuals come from tokens.css + forms.css already loaded */

  .panel { margin: 1rem 0; padding: .9rem; }
  .info-grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0,1fr));
    gap: .6rem;
    align-items: end;
  }
  @media (max-width: 960px){ .info-grid { grid-template-columns: repeat(3, minmax(0,1fr)); } }
  @media (max-width: 640px){ .info-grid { grid-template-columns: repeat(2, minmax(0,1fr)); } }

  .panel label { display:block; margin-bottom: .25rem; }
  .ro { padding: .5rem .7rem; }

  .form-grid { display: grid; gap: 1rem; }

  .sizes-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 220px));
    gap: .9rem;
  }
  @media (max-width: 960px){ .sizes-grid { grid-template-columns: repeat(2, minmax(0, 220px)); } }
  @media (max-width: 640px){ .sizes-grid { grid-template-columns: 1fr; } }

  .size-card { display: grid; gap: .4rem; padding: .9rem; }

  .actions { display: flex; gap: .6rem; flex-wrap: wrap; }
</style>
