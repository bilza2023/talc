<script>
  export let data;
  const d = data?.defaults ?? {};

  // canonical options (align with system enums)
  const SHADES = ['WHITE', 'LIGHTGREY', 'GREY', 'MIXED'];
  const SIZES  = ['LUMPS', 'CHIPS', 'FINE']; // sorting uses real sizes, not ANY
</script>

<h1 class="title">PSS — Sort (Screened → Sorted)</h1>

{#if d?.supplierId || d?.shade || d?.size || d?.qty}
  <div class="prefill">
    <span>Prefilled →</span>
    {#if d?.supplierId}<b>Supplier:</b> {d.supplierId}{/if}
    {#if d?.shade} <b>· Shade:</b> {d.shade}{/if}
    {#if d?.size}  <b>· Size:</b> {d.size}{/if}
    {#if d?.qty}   <b>· Qty(t):</b> {d.qty}{/if}
  </div>
{/if}

<form method="POST" class="form compact">
  <div class="row">
    <label for="supplierId">Supplier ID</label>
    <input
      id="supplierId"
      name="supplierId"
      type="number"
      min="1"
      step="1"
      placeholder="e.g. 1"
      value={d?.supplierId ?? ''}
      required
    />
  </div>

  <div class="row">
    <label for="shade">Shade</label>
    <select id="shade" name="shade" required>
      <option value="" disabled selected={!d?.shade}>Pick shade</option>
      {#each SHADES as sh}
        <option value={sh} selected={d?.shade === sh}>{sh}</option>
      {/each}
    </select>
  </div>

  <div class="row">
    <label for="size">Size</label>
    <select id="size" name="size" required>
      <option value="" disabled selected={!d?.size}>Pick size</option>
      {#each SIZES as sz}
        <option value={sz} selected={d?.size === sz}>{sz}</option>
      {/each}
    </select>
  </div>

  <div class="row">
    <label for="qty">Quantity (t)</label>
    <input
      id="qty"
      name="qty"
      type="number"
      min="0.01"
      step="0.01"
      placeholder="e.g. 3"
      value={d?.qty ?? ''}
      required
    />
  </div>

  <div class="row">
    <label for="ht">HT (optional)</label>
    <input
      id="ht"
      name="ht"
      type="number"
      step="0.01"
      placeholder="e.g. 6"
      value={d?.ht ?? ''}
    />
  </div>

  <div class="row">
    <label for="wastage">Wastage (optional)</label>
    <input
      id="wastage"
      name="wastage"
      type="number"
      step="0.01"
      placeholder="e.g. 0.25"
      value={d?.wastage ?? ''}
    />
  </div>

  <div class="actions">
    <button type="submit" name="intent" value="sort" class="btn-primary">Post Sort</button>
  </div>
</form>

<style>
  /* Tokens-first: rely on tokens.css + form.css already loaded */
  :global(body) {
    color: var(--baseTextColor);
    background: var(--backgroundColor);
  }

  .title {
    margin: 0.25rem 0 0.5rem;
    text-align: center;
    color: var(--baseTextColor);
    font-size: 1.25rem;
  }

  .prefill {
    margin: 0 0 0.75rem;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--borderColor);
    background: var(--surfaceColor);
    border-radius: var(--radius, 10px);
    font-size: 0.95rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .form.compact {
    max-width: 640px;
    margin: 0 auto;
  }

  .row {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    margin-bottom: 0.75rem;
  }

  label {
    font-size: 0.9rem;
    color: var(--mutedText, color-mix(in oklab, var(--baseTextColor) 70%, transparent));
  }

  input, select {
    width: 100%;
    border: 1px solid var(--borderColor);
    background: var(--inputBg, var(--surfaceColor));
    color: var(--baseTextColor);
    border-radius: var(--radius, 10px);
    padding: 0.6rem 0.7rem;
    outline: none;
  }

  input:focus, select:focus {
    border-color: var(--accentColor, var(--primary));
    box-shadow: 0 0 0 2px color-mix(in oklab, var(--accentColor, var(--primary)) 30%, transparent);
  }

  .actions {
    display: flex;
    justify-content: center;
    margin-top: 0.5rem;
  }

  .btn-primary {
    padding: 0.6rem 1rem;
    border-radius: var(--radius, 12px);
    border: 1px solid var(--borderColor);
    background: var(--primary, var(--accentColor));
    color: var(--onPrimary, white);
    cursor: pointer;
  }

  .btn-primary:hover {
    filter: brightness(1.05);
  }
</style>
