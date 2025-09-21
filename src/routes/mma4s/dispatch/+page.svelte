<script>
  import { enhance } from '$app/forms';
  export let data;

  const { fromMmaCode, options, initial, locks } = data;

  // keep everything as strings (URL params are strings)
  let toMmaCode  = initial?.toMmaCode  ?? '';
  let supplierId = initial?.supplierId ?? '';
  let size       = initial?.size       ?? '';
  let shade      = initial?.shade      ?? '';
  let qty        = initial?.qty        ?? '';
  let amount     = initial?.amount     ?? '';
  let meta       = initial?.meta       ?? '';

  let isSubmitting = false;
  let serverMessage = '';
  let serverErrors = [];

  const handleEnhance = ({ form }) => {
    isSubmitting = true;
    serverMessage = '';
    serverErrors = [];
    return async ({ result }) => {
      isSubmitting = false;
      if (result.type === 'success') {
        const { success, message } = result.data || {};
        serverMessage = message || (success ? 'Success.' : 'Done.');
        serverErrors = [];
        form?.reset?.();
        // Keep URL-driven locks; reset only free fields
        toMmaCode = '';
        if (!locks?.supplierIdLocked) supplierId = '';
        if (!locks?.sizeLocked) size = '';
        if (!locks?.shadeLocked) shade = '';
        qty = '';
        amount = '';
        meta = '';
      } else if (result.type === 'failure') {
        const { message, errors, values } = result.data || {};
        serverMessage = message || 'Failed.';
        serverErrors = Array.isArray(errors) ? errors : [];
        if (values) {
          toMmaCode  = values.toMmaCode  ?? toMmaCode;
          if (!locks?.supplierIdLocked) supplierId = values.supplierId ?? supplierId;
          if (!locks?.sizeLocked)      size       = values.size       ?? size;
          if (!locks?.shadeLocked)     shade      = values.shade      ?? shade;
          qty    = values.qty    ?? qty;
          amount = values.amount ?? amount;
          meta   = values.meta   ?? meta;
        }
      }
    };
  };

  // label helper for supplier display
  function supplierLabel(id) {
    const s = options?.suppliers?.find(x => String(x.id) === String(id));
    return s ? `${s.code} — ${s.name}` : (id || '—');
  }
</script>

<svelte:head><title>MMA4S Dispatch</title></svelte:head>

<div class="wrap">
  <h1 class="title">Dispatch</h1>

  <!-- ===== Context summary at the TOP ===== -->
  <div class="context">
    <div class="row">
      <div class="kv"><span class="k">From</span><span class="v mono">{fromMmaCode}</span></div>

      {#if toMmaCode}
        <div class="kv"><span class="k">To</span><span class="v mono">{toMmaCode}</span></div>
      {/if}

      {#if supplierId}
        <div class="kv"><span class="k">Supplier</span><span class="v">{supplierLabel(supplierId)}</span></div>
      {/if}

      {#if size}
        <div class="kv"><span class="k">Size</span><span class="v mono">{size}</span></div>
      {/if}

      {#if shade}
        <div class="kv"><span class="k">Shade</span><span class="v mono">{shade}</span></div>
      {/if}
    </div>
  </div>

  {#if serverMessage}
    <div class="alert {serverErrors.length ? 'alert--error' : 'alert--success'}" role="status">
      {serverMessage}
    </div>
  {/if}

  {#if serverErrors.length}
    <ul class="errors">
      {#each serverErrors as err}<li>{err}</li>{/each}
    </ul>
  {/if}

  <form method="POST" action="?/dispatch" use:enhance={handleEnhance} class="form">
    <!-- authoritative source MMA (hidden) -->
    <input type="hidden" name="fromMmaCode" value={fromMmaCode} />

    <!-- lock-driven hidden inputs -->
    {#if locks?.supplierIdLocked}
      <input type="hidden" name="supplierId" value={supplierId} />
    {/if}
    {#if locks?.sizeLocked}
      <input type="hidden" name="size" value={size} />
    {/if}
    {#if locks?.shadeLocked}
      <input type="hidden" name="shade" value={shade} />
    {/if}

    <div class="grid">
      <!-- To MMA (always editable unless you decide to lock via URL later) -->
      <label class="field">
        <span>To MMA</span>
        <select name="toMmaCode" bind:value={toMmaCode} required>
          <option value="" disabled>Pick destination…</option>
          {#each options.mmaTargets as m}
            <option value={m}>{m}</option>
          {/each}
        </select>
      </label>

      <!-- Supplier: dropdown only if not locked -->
      {#if !locks?.supplierIdLocked}
        <label class="field">
          <span>Supplier</span>
          <select name="supplierId" bind:value={supplierId}>
            <option value="" disabled>Pick supplier…</option>
            {#each options.suppliers as s}
              <option value={String(s.id)}>{s.code} — {s.name}</option>
            {/each}
          </select>
        </label>
      {/if}

      <!-- Size: dropdown only if not locked -->
      {#if !locks?.sizeLocked}
        <label class="field">
          <span>Size</span>
          <select name="size" bind:value={size} required>
            <option value="" disabled>Pick size…</option>
            {#each options.sizes as s}
              <option value={s}>{s}</option>
            {/each}
          </select>
        </label>
      {/if}

      <!-- Shade: dropdown only if not locked -->
      {#if !locks?.shadeLocked}
        <label class="field">
          <span>Shade</span>
          <select name="shade" bind:value={shade} required>
            <option value="" disabled>Pick shade…</option>
            {#each options.shades as s}
              <option value={s}>{s}</option>
            {/each}
          </select>
        </label>
      {/if}

      <label class="field">
        <span>Quantity</span>
        <input
          name="qty"
          type="number"
          inputmode="decimal"
          step="any"
          min="0"
          bind:value={qty}
          required />
      </label>

      <label class="field">
        <span>Amount</span>
        <input
          name="amount"
          type="number"
          inputmode="decimal"
          step="any"
          min="0"
          bind:value={amount}
          required />
      </label>

      <label class="field field--wide">
        <span>Meta (JSON, optional)</span>
        <textarea
          name="meta"
          rows="4"
          bind:value={meta}
          placeholder='&#123;"truckNo":"ABC-123"&#125;' />
      </label>
    </div>

    <button type="submit" class="btn" disabled={isSubmitting}>
      {isSubmitting ? 'Submitting…' : 'Create Dispatch'}
    </button>
  </form>
</div>

<style>
  .wrap { max-width: 820px; margin: 0 auto; padding: 1rem; }
  .title { font-size: 1.25rem; margin-bottom: .5rem; }

  .context {
    border: 1px solid rgba(0,0,0,.15);
    border-radius: .75rem;
    padding: .75rem .9rem;
    background: rgba(0,0,0,.03);
    margin-bottom: .9rem;
  }
  .context .row {
    display: flex; flex-wrap: wrap; gap: .5rem 1rem;
  }
  .kv { display: inline-flex; gap: .4rem; align-items: baseline; }
  .k { font-weight: 600; color: #333; }
  .v { padding: .2rem .5rem; border-radius: .5rem; background: #fff; border: 1px solid rgba(0,0,0,.12); }
  .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }

  .alert { padding: .75rem .9rem; border-radius: .5rem; margin: .5rem 0 .75rem; }
  .alert--success { background: rgba(22,163,74,.12); border: 1px solid rgba(22,163,74,.45); }
  .alert--error   { background: rgba(220,38,38,.12); border: 1px solid rgba(220,38,38,.45); }

  .errors { margin: 0 0 1rem; padding-left: 1.25rem; }
  .form { display: block; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; margin-bottom: .75rem; }
  .field { display: flex; flex-direction: column; gap: .35rem; }
  .field--wide { grid-column: 1 / -1; }

  input, select, textarea {
    border: 1px solid rgba(0,0,0,.25);
    border-radius: .5rem;
    padding: .6rem .7rem;
    font-size: .95rem;
    background: var(--bg, #fff);
    color: var(--fg, #111);
  }

  .btn {
    display: inline-flex; align-items: center; justify-content: center;
    border: 1px solid rgba(0,0,0,.25);
    border-radius: .6rem;
    padding: .6rem .9rem;
    font-weight: 600;
    cursor: pointer;
  }

  @media (max-width: 640px) {
    .grid { grid-template-columns: 1fr; }
  }
</style>
