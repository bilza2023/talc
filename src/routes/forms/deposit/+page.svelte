<script>
    import { enhance } from '$app/forms';
  
    // Shared data comes from /tests/+layout.server.js
    export let data; // { mmaList, shadeList, sizeList, suppliers, nowISO, inTransit }
    export let form; // action result (success/fail payload)
  
    let formEl;
  
    // Derive server message & errors from action result
    $: serverMessage = form?.message ?? '';
    $: serverErrors = Array.isArray(form?.errors) ? form.errors : [];
  
    // After a successful submit (SPA), clear the fields
    $: if (form?.ok && formEl) {
      formEl.reset();
    }
  </script>
  
  <style>
    .wrap { max-width: 720px; margin: 2rem auto; padding: 1rem; }
    .banner { padding: .75rem 1rem; border-radius: .5rem; margin-bottom: 1rem; border: 1px solid transparent; }
    .banner--success { border-color: #16a34a; background: color-mix(in oklab, #16a34a 12%, transparent); color: #dce9e2; }
    .banner--error { border-color: #dc2626; background: color-mix(in oklab, #dc2626 12%, transparent); color: #faddda; }
    form .row { display: grid; grid-template-columns: 1fr 2fr; gap: .75rem; align-items: center; margin-bottom: .75rem; }
    form label { font-weight: 600; }
    select, input, textarea { width: 100%; padding: .5rem .6rem; border-radius: .5rem; border: 1px solid #333; background: #111; color: #eee; }
    textarea { min-height: 90px; }
    .hint { font-size: .85rem; opacity: .8; }
    .actions { margin-top: 1rem; }
    button[type="submit"] { padding: .6rem 1rem; border-radius: .6rem; border: 1px solid #444; background: #222; color: #eee; cursor: pointer; }
    button[type="submit"]:hover { background: #2b2b2b; }
    .req::after { content: ' *'; color: #f87171; }
  </style>
  
  <div class="wrap">
    <h1>Deposit (tests)</h1>
  
    {#if serverMessage}
      <div class="banner banner--success" role="status">{serverMessage}</div>
    {/if}
  
    {#if serverErrors.length}
      <div class="banner banner--error" role="alert">
        <ul>
          {#each serverErrors as e}
            <li>{e}</li>
          {/each}
        </ul>
      </div>
    {/if}
  
    <form method="POST" action="?/submit" use:enhance bind:this={formEl}>
      <div class="row">
        <label class="req" for="mmaCode">MMA</label>
        <select id="mmaCode" name="mmaCode" required>
          <option value="">Pick one…</option>
          {#each data.mmaList as code}
            <option value={code}>{code}</option>
          {/each}
        </select>
      </div>
  
      <div class="row">
        <label class="req" for="supplierId">Supplier</label>
        <select id="supplierId" name="supplierId" required>
          <option value="">Pick one…</option>
          {#each data.suppliers as s}
            <option value={s.id}>{s.name}</option>
          {/each}
        </select>
      </div>
  
      <div class="row">
        <label class="req" for="shade">Shade</label>
        <select id="shade" name="shade" required>
          <option value="">Pick one…</option>
          {#each data.shadeList as shade}
            <option value={shade}>{shade}</option>
          {/each}
        </select>
      </div>
  
      <div class="row">
        <label class="req" for="size">Size</label>
        <select id="size" name="size" required>
          <option value="">Pick one…</option>
          {#each data.sizeList as size}
            <option value={size}>{size}</option>
          {/each}
        </select>
      </div>
  
      <div class="row">
        <label class="req" for="amount">Amount (tons)</label>
        <input id="amount" name="amount" type="number" step="0.01" min="0" placeholder="e.g., 12.5" required />
      </div>
  
      <div class="row">
        <label for="depositedAt">Deposited at</label>
        <!-- leave blank by default; backend can default to now if omitted -->
        <input id="depositedAt" name="depositedAt" type="datetime-local" />
      </div>
  
      <div class="row">
        <label for="meta">Meta (JSON)</label>
        <!-- Use single quotes for the attribute so JSON quotes don’t need escaping -->
        <textarea id="meta" name="meta" placeholder=''></textarea>
      </div>
      <div class="hint">Meta is optional. If provided, it must be valid JSON.</div>
  
      <div class="actions">
        <button type="submit">Create Deposit</button>
      </div>
    </form>
  </div>
  