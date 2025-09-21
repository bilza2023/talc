<script>
  import { enhance } from '$app/forms';
  export let data;

  const { mmaCode, options, initial } = data;

  // Page-level UI state
  let isSubmitting = false;
  let serverMessage = '';
  let serverErrors = [];

  // Form fields (bound to inputs)
  let supplierId = initial?.supplierId ?? '';
  let shade = initial?.shade ?? '';
  let size = initial?.size ?? '';
  let qty = initial?.qty ?? '';
  let amount = initial?.amount ?? '';
  let meta = initial?.meta ?? '';

  function clearForm() {
    supplierId = '';
    shade = '';
    size = '';
    qty = '';
    amount = '';
    meta = '';
  }

  // Safe enhance handler (no reliance on update signature)
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
        // Clear form—but keep mmaCode fixed (hidden input)
        clearForm();
        form?.reset?.(); // optional: reset native form
      } else if (result.type === 'failure') {
        const { message, errors, values } = result.data || {};
        serverMessage = message || 'Failed.';
        serverErrors = Array.isArray(errors) ? errors : [];
        if (values) {
          supplierId = values.supplierId ?? supplierId;
          shade = values.shade ?? shade;
          size = values.size ?? size;
          qty = values.qty ?? qty;
          amount = values.amount ?? amount;
          meta = values.meta ?? meta;
        }
      }
    };
  };
</script>

<svelte:head><title>MMA4S Deposit</title></svelte:head>

<div class="wrap">
  <h1 class="title">
    Deposit to: <span class="badge">{mmaCode}</span>
  </h1>

  {#if serverMessage}
    <div class="alert {serverErrors.length ? 'alert--error' : 'alert--success'}" role="status">
      {serverMessage}
    </div>
  {/if}

  {#if serverErrors.length}
    <ul class="errors">
      {#each serverErrors as err}
        <li>{err}</li>
      {/each}
    </ul>
  {/if}

  <form method="POST" action="?/deposit" use:enhance={handleEnhance} class="form">
    <!-- authoritative MMA code comes from URL -->
    <input type="hidden" name="mmaCode" value={mmaCode} />

    <div class="grid">

      <label class="field">
        <span>Supplier</span>
        <select name="supplierId" bind:value={supplierId}>
          <option value="" disabled selected={supplierId === ''}>Pick supplier…</option>
          {#each options.suppliers as s}
            <option value={s.id}>{s.code} — {s.name}</option>
          {/each}
        </select>
      </label>
      

      <label class="field">
        <span>Shade</span>
        <select name="shade" bind:value={shade} required>
          <option value="" disabled selected={shade === ''}>Pick shade…</option>
          {#each options.shades as s}
            <option value={s}>{s}</option>
          {/each}
        </select>
      </label>

      <label class="field">
        <span>Size</span>
        <select name="size" bind:value={size} required>
          <option value="" disabled selected={size === ''}>Pick size…</option>
          {#each options.sizes as s}
            <option value={s}>{s}</option>
          {/each}
        </select>
      </label>

      <label class="field">
        <span>Quantity</span>
        <input
          name="qty"
          type="number"
          inputmode="decimal"
          step="any"
          min="0"
          bind:value={qty}
          placeholder="e.g. 12.5"
          required />
      </label>

      <label class="field">
        <span>Amount (optional)</span>
        <input
          name="amount"
          type="number"
          inputmode="decimal"
          step="any"
          min="0"
          bind:value={amount}
          placeholder="e.g. 5000" />
      </label>

      <!-- <label class="field field--wide">
        <span>Meta (JSON, optional)</span>
        <textarea
          name="meta"
          rows="4"
          bind:value={meta}
          placeholder='' />
      </label> -->
    </div>

    <button type="submit" class="btn" disabled={isSubmitting}>
      {isSubmitting ? 'Submitting…' : 'Create Deposit'}
    </button>
  </form>
</div>

<style>
  .wrap { max-width: 760px; margin: 0 auto; padding: 1rem; }
  .title { font-size: 1.25rem; margin-bottom: .75rem; }
  .badge { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; background: rgba(0,0,0,.08); padding: .15rem .4rem; border-radius: .4rem; }
  .alert { padding: .75rem .9rem; border-radius: .5rem; margin: .5rem 0 .75rem; }
  .alert--success { background: rgba(22,163,74,.12); border: 1px solid rgba(22,163,74,.45); }
  .alert--error { background: rgba(220,38,38,.12); border: 1px solid rgba(220,38,38,.45); }
  .errors { margin: 0 0 1rem; padding-left: 1.25rem; }
  .form { display: block; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; margin-bottom: .75rem; }
  .field { display: flex; flex-direction: column; gap: .35rem; }
  .field--wide { grid-column: 1 / -1; }
  input, select, textarea { border: 1px solid rgba(0,0,0,.25); border-radius: .5rem; padding: .6rem .7rem; font-size: .95rem; background: var(--bg, #fff); color: var(--fg, #111); }
  .btn { display: inline-flex; align-items: center; justify-content: center; border: 1px solid rgba(0,0,0,.25); border-radius: .6rem; padding: .6rem .9rem; font-weight: 600; cursor: pointer; }
  @media (max-width: 640px) { .grid { grid-template-columns: 1fr; } }
</style>
