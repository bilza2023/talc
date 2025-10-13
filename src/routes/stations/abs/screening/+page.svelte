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
  // Prefer action result, then URL/merged fromView, then server .from
  $: available = Number(
      (form?.availableDb ?? fromView.availableDb ?? from.availableDb) || 0
    );
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

<form method="POST" action="?/screen" use:enhance class="form-grid" autocomplete="off">
  <!-- Use merged values so URL params flow into the action without server changes -->
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
    <button type="submit" disabled={allocated <= 0}>Run Screening</button>
    <button type="submit" formaction="?/cancel" formmethod="POST" class="secondary">Cancel</button>
  </div>
</form>

<style>
  @import '$lib/styles/tokens.css';

  /* ===== Summary panel (uses tokens) ===== */
  .panel {
    margin: 1rem 0;
    padding: .9rem;
    background: var(--surfaceColor);
    border: 1px solid var(--borderColor);
    border-radius: 12px;
    box-shadow: 0 1px 0 rgba(0,0,0,.1), 0 8px 20px rgba(0,0,0,.08);
    color: var(--primaryText);
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0,1fr));
    gap: .6rem;
    align-items: end;
  }
  @media (max-width: 960px){
    .info-grid { grid-template-columns: repeat(3, minmax(0,1fr)); }
  }
  @media (max-width: 640px){
    .info-grid { grid-template-columns: repeat(2, minmax(0,1fr)); }
  }

  .panel label {
    display:block;
    font-size: .92rem;
    color: var(--secondaryText);
    margin-bottom: .25rem;
  }
  .ro {
    padding: .55rem .7rem;
    border: 1px dashed color-mix(in oklab, var(--borderColor) 85%, transparent);
    border-radius: 10px;
    font-weight: 600;
    background: color-mix(in oklab, var(--surfaceColor) 88%, black 0%);
    color: var(--primaryText);
  }

  /* ===== Messages ===== */
  .success {
    margin-top: .25rem;
    color: var(--successColor, #29d37d);
  }
  .error {
    margin-top: .25rem;
    color: var(--errorColor, #ff6b6b);
  }

  /* ===== Form layout (keep your classes; style with tokens) ===== */
  .form-grid {
    display: grid;
    gap: 1rem;
  }

  .sizes-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 220px));
    gap: .9rem;
  }
  @media (max-width: 960px){
    .sizes-grid { grid-template-columns: repeat(2, minmax(0, 220px)); }
  }
  @media (max-width: 640px){
    .sizes-grid { grid-template-columns: 1fr; }
  }

  .size-card {
    display: grid;
    gap: .4rem;
    padding: .9rem;
    background: var(--surfaceColor);
    border: 1px solid var(--borderColor);
    border-radius: 12px;
  }
  .size-card > label {
    font-size: .92rem;
    color: var(--secondaryText);
  }

  /* Inputs — token background, border, and focus ring */
  .size-card input,
  .form-grid input,
  .form-grid select,
  .form-grid textarea {
    width: 100%;
    box-sizing: border-box;
    padding: .65rem .8rem;
    background: color-mix(in oklab, var(--surfaceColor) 88%, black 0%);
    color: var(--primaryText);
    border: 1px solid var(--borderColor);
    border-radius: 12px;
    outline: none;
    transition: border-color .15s ease, box-shadow .15s ease, background .15s ease;
  }
  .size-card input::placeholder,
  .form-grid input::placeholder,
  .form-grid textarea::placeholder {
    color: color-mix(in oklab, var(--secondaryText) 70%, transparent);
  }
  .size-card input:focus,
  .form-grid input:focus,
  .form-grid select:focus,
  .form-grid textarea:focus {
    border-color: var(--primaryColor);
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--primaryColor) 30%, transparent);
  }

  .size-card input { padding: .6rem .7rem; }

  /* ===== Actions / Buttons (tokens + sensible variants) ===== */
  .actions {
    display: flex;
    gap: .6rem;
    flex-wrap: wrap;
  }

  .actions button,
  .actions input[type="submit"],
  .actions input[type="button"] {
    appearance: none;
    border: 1px solid var(--borderColor);
    background: color-mix(in oklab, var(--primaryColor) 16%, var(--surfaceColor));
    color: var(--primaryText);
    padding: .6rem .9rem;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: background .15s ease, border-color .15s ease, transform .06s ease;
  }
  .actions button:hover,
  .actions input[type="submit"]:hover {
    background: color-mix(in oklab, var(--primaryColor) 24%, var(--surfaceColor));
    border-color: color-mix(in oklab, var(--primaryColor) 55%, var(--borderColor));
  }
  .actions button:active,
  .actions input[type="submit"]:active {
    transform: translateY(1px);
  }

  /* Primary submit (Run Screening) */
  .actions button[type="submit"]:not(.secondary) {
    background: var(--primaryColor);
    color: var(--accentText, #fff);
    border-color: color-mix(in oklab, var(--primaryColor) 60%, var(--borderColor));
  }
  .actions button[type="submit"]:not(.secondary):hover {
    filter: brightness(1.05);
  }

  /* Secondary (Cancel) */
  .actions .secondary {
    background: color-mix(in oklab, var(--primaryColor) 10%, var(--surfaceColor));
    color: var(--primaryText);
    border-color: color-mix(in oklab, var(--primaryColor) 45%, var(--borderColor));
    opacity: .95;
  }

  /* Disabled state */
  .actions button[disabled] {
    opacity: .55;
    cursor: not-allowed;
    filter: grayscale(20%);
  }
</style>
