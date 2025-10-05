<script>
  export let data;  // { suppliers, shades, defaults }
  export let form;  // { success?, error?, posted? }

  // Preselect sensible defaults from the server
  let supplierId = data?.defaults?.supplierId ?? '';
  let shade      = data?.defaults?.shade ?? (data.shades?.[0] ?? 'WHITE');
  let qty        = '';
</script>

<h1>ABS — Purchase Unscreened (RAW)</h1>
<p class="note">RAW purchases are stored with size <strong>ANY</strong>.</p>

{#if form?.success}
  <p class="flash success" aria-live="polite">
    Saved: supplier {form.posted.supplierId}, shade {form.posted.shade}, qty {form.posted.qty}t.
  </p>
{:else if form?.error}
  <p class="flash error" aria-live="assertive">{form.error}</p>
{/if}

<form method="POST" action="?/purchase" class="form" autocomplete="off">
  <label class="field">
    <span>Supplier</span>
    <select name="supplierId" bind:value={supplierId} required>
      {#each data.suppliers as s}
        <option value={s.id}>{s.name} ({s.code})</option>
      {/each}
    </select>
  </label>

  <label class="field">
    <span>Shade</span>
    <select name="shade" bind:value={shade} required>
      {#each data.shades as sh}
        <option value={sh}>{sh}</option>
      {/each}
    </select>
  </label>

  <label class="field">
    <span>Quantity (t)</span>
    <input type="number" name="qty" step="any" min="0" bind:value={qty} required />
  </label>

  <!-- No size input: server always writes size="ANY" for ABS_RAW -->

  <div class="actions">
    <button type="submit" class="btn">Purchase</button>
    <button type="submit" formaction="?/cancel" formmethod="POST" class="btn secondary">Cancel</button>
  </div>
</form>

<style>
  :root{
    --border:#e2e8f0;
    --text:#111827;
    --muted:#6b7280;
    --brand:#0ea5e9;
    --brand-weak: rgba(14,165,233,.2);
    --error:#dc2626;
    --success:#16a34a;
    --bg:#fff;
  }

  .note { margin:.25rem 0 .75rem; color:var(--muted); }

  .flash { margin:.5rem 0; font-weight:600; }
  .success { color: var(--success); }
  .error { color: var(--error); }

  /* Mobile-first grid: 1 → 2 → 3 columns */
  .form {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
    align-items: end;
  }
  @media (min-width: 480px) {
    .form { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .actions { grid-column: 1 / -1; }
  }
  @media (min-width: 900px) {
    .form { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  }

  .field { display: grid; gap: 6px; }
  .field > span { font-size: .9rem; color: var(--muted); }

  input[type="number"], select {
    width: 100%;
    height: 44px;
    padding: 8px 12px;
    border: 1px solid var(--border);
    border-radius: 10px;
    background: var(--bg);
    font-size: 0.95rem;
    color: var(--text);
  }
  input:focus, select:focus {
    outline: none;
    border-color: var(--brand);
    box-shadow: 0 0 0 3px var(--brand-weak);
  }

  .actions { display: flex; gap: 10px; margin-top: 4px; }
  .btn {
    height: 44px;
    padding: 0 14px;
    border-radius: 10px;
    border: 1px solid var(--brand);
    background: var(--brand);
    color: #fff;
    font-weight: 600;
    cursor: pointer;
  }
  .btn.secondary {
    background: transparent;
    color: var(--brand);
  }
</style>
