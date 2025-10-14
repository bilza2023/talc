<script>
  import H1 from "$lib/components/H1.svelte";
  // import { enhance } from '$app/forms';  // ← add this

  export let data;
  const { suppliers, shades, sizes, defaults } = data;
</script>

<H1 text="Purchase"   />


<form method="POST"  class="form compact">

  <div class="row">
    <label>Supplier</label>
    <select name="supplierId" required>
      <option value="">Pick supplier</option>
      {#each suppliers as s}
        <option value={s.id} selected={s.id === defaults.supplierId}>{s.name}</option>
      {/each}
    </select>
  </div>

  <div class="row">
    <label>Shade</label>
    <select name="shade" required>
      <option value="">Pick shade</option>
      {#each shades as sh}
        <option value={sh} selected={sh === defaults.shade}>{sh}</option>
      {/each}
    </select>
  </div>

  <div class="row">
    <label>Size</label>
    <select name="size" required>
      <option value="">Pick size</option>
      {#each sizes as sz}
        <option value={sz} selected={sz === defaults.size}>{sz}</option>
      {/each}
    </select>
  </div>

  <div class="row">
    <label>Quantity (t)</label>
    <input type="number" step="0.01" name="qty" required />
  </div>

  <div class="row">
    <label>Rate / MT</label>
    <input type="number" step="0.01" name="ratePerMt" />
  </div>

  <div class="row">
    <label>Freight / MT</label>
    <input type="number" step="0.01" name="freightPerMt" />
  </div>

  <div class="row">
    <label>Supplier Freight</label>
    <input type="number" step="0.01" name="supplierFreight" />
  </div>

  <div class="row">
    <label>Road Exp</label>
    <input type="number" step="0.01" name="roadExp" />
  </div>

  <div class="row">
    <label>Cash Paid</label>
    <input type="number" step="0.01" name="cashPaid" />
  </div>

  <div class="row">
    <label>Payment Mode</label>
    <input type="text" name="paymentMode" placeholder="e.g. Cash, Bank, etc." />
  </div>

  <div class="row stack">
    <label>Remarks</label>
    <textarea name="remarks" rows="3" placeholder="Optional notes..."></textarea>
  </div>

  <div class="actions" style="margin-top: 1rem;">
    <button type="submit" formaction="?/purchase" class="primary">Submit</button>
  </div>

</form>


<style>
  /* structure uses tokens + forms only */
  form.form {
    max-width: 420px;
    margin: 0 auto;
    background: var(--surfaceColor);
    border: 1px solid var(--borderColor);
    border-radius: var(--radiusMd);
    padding: 1rem;
  }

  .row {
    display: flex;
    flex-direction: column;
    margin-bottom: 0.6rem;
  }

  label {
    font-size: 0.9rem;
    font-weight: 500;
    margin-bottom: 0.25rem;
    color: var(--secondaryText);
  }

  input,
  select,
  textarea {
    background: var(--inputBg);
    border: 1px solid var(--borderColor);
    color: var(--primaryText);
    border-radius: var(--radiusSm);
    padding: 0.4rem 0.5rem;
    font-size: 0.95rem;
  }

  .actions {
    display: flex;
    justify-content: center;
  }

  button.primary {
    background: var(--accentColor);
    color: var(--onAccentText);
    font-weight: 600;
    padding: 0.6rem 1.25rem;
    border: none;
    border-radius: var(--radiusSm);
    cursor: pointer;
  }

  button.primary:hover {
    filter: brightness(1.1);
  }
</style>
