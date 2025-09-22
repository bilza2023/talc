
<script>
  import { enhance } from '$app/forms';
  export let data;

  let flash = { type: '', message: '' };

  function onSuccess(ev) {
    const d = ev.detail || {};
    if (d?.result?.data?.success) {
      flash = { type: 'success', message: d.result.data.message || 'Dispatch created.' };
      // Clear inputs we own
      qty = '';
      truckNo = '';
      note = '';
      return;
    }
    if (d?.result?.data?.message) {
      flash = { type: 'error', message: d.result.data.message };
    }
  }

  function onError(ev) {
    const d = ev.detail || {};
    flash = { type: 'error', message: d?.result?.data?.message || 'Failed.' };
  }

  const { fromMma, toMma, supplierId, shade, size, onHand } = data;

  // Form fields (qty is the only required input for v1)
  let qty = '';
  let truckNo = '';
  let note = '';
  let toMmaLocal = toMma; // editable only if URL didn't provide one
</script>

<h1 class="title">Dispatch</h1>
<p class="context">
  <span class="chip">{fromMma}</span>
  <span class="chip">Supplier #{supplierId}</span>
  <span class="chip">{shade}</span>
  <span class="chip">{size}</span>
</p>

<div class="onhand">
  On-hand in this slot: <strong>{onHand}</strong> t
</div>

{#if flash.message}
  <div class="alert {flash.type === 'success' ? 'alert--success' : 'alert--error'}">
    {flash.message}
  </div>
{/if}

<form method="POST" action="?/dispatch" use:enhance={{ onError, onResult: onSuccess }} class="form">
  <!-- Locked identity fields -->
  <input type="hidden" name="fromMma" value={fromMma} />
  <input type="hidden" name="supplierId" value={supplierId} />
  <input type="hidden" name="shade" value={shade} />
  <input type="hidden" name="size" value={size} />

  <!-- Destination -->
  {#if toMma}
    <div class="field">
      <label>To MMA</label>
      <div class="chip chip--lock">{toMma}</div>
      <input type="hidden" name="toMma" value={toMma} />
    </div>
  {:else}
    <div class="field">
      <label for="toMma">To MMA</label>
      <input id="toMma" name="toMma" type="text" bind:value={toMmaLocal} required />
      <p class="hint">Enter a valid destination MMA code (e.g., PSS_SORTED).</p>
    </div>
  {/if}

  <!-- Qty -->
  <div class="field">
    <label for="qty">Weight (t)</label>
    <input id="qty" name="qty" type="number" step="0.01" min="0.01" bind:value={qty} required />
    <p class="hint">Must be ≤ on-hand ({onHand}).</p>
  </div>

  <!-- Optional -->
  <details class="more">
    <summary>Truck & note (optional)</summary>
    <div class="field">
      <label for="truckNo">Truck No</label>
      <input id="truckNo" name="truckNo" type="text" bind:value={truckNo} placeholder="ABC-123" />
    </div>
    <div class="field">
      <label for="note">Note</label>
      <textarea id="note" name="note" rows="2" bind:value={note} placeholder="Any short note…"></textarea>
    </div>
  </details>

  <button class="btn" type="submit">Dispatch</button>
</form>

<style>
  .title { margin: 0 0 .25rem; font-size: 1.25rem; }
  .context { margin: 0 0 .75rem; display: flex; gap: .5rem; flex-wrap: wrap; }
  .chip { padding: .25rem .5rem; border: 1px solid currentColor; border-radius: .5rem; opacity: .8; }
  .chip--lock { background: color-mix(in oklab, currentColor 10%, transparent); }
  .onhand { margin: .25rem 0 1rem; opacity: .85; }

  .alert { margin: .75rem 0; padding: .6rem .75rem; border-radius: .5rem; border: 1px solid; }
  .alert--success { border-color: var(--successColor, #16a34a); background: color-mix(in oklab, var(--successColor, #16a34a) 14%, transparent); color: var(--successText, #dce9e2); }
  .alert--error { border-color: var(--errorColor, #dc2626); background: color-mix(in oklab, var(--errorColor, #dc2626) 10%, transparent); color: var(--errorText, #f8dada); }

  .form { display: grid; gap: .75rem; max-width: 520px; }
  .field { display: grid; gap: .35rem; }
  .hint { opacity: .7; font-size: .9rem; }
  .btn { justify-self: start; padding: .6rem .9rem; border-radius: .5rem; border: 1px solid currentColor; background: color-mix(in oklab, currentColor 12%, transparent); }
  .more summary { cursor: pointer; opacity: .8; }
</style>
