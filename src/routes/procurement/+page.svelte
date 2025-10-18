<script>
  import H1 from "$lib/components/H1.svelte";
  export let data;

  const suppliers = data?.suppliers ?? [];
  const shades    = data?.shades ?? ['WHITE', 'GREY', 'LIGHTGREY', 'GREEN', 'MIXED'];
  const sizes     = data?.sizes ?? ['ANY', 'LUMPS', 'CHIPS', 'FINE'];
  const defaults  = data?.defaults ?? {};

  function logBeforeSubmit(e) {
    try {
      const fd  = new FormData(e.currentTarget);
      const obj = Object.fromEntries(fd);
      console.log('[Purchase Submit] payload →', obj);
      // micro-tick so the log flushes before nav
      setTimeout(() => {}, 0);
    } catch (err) {
      console.warn('[Purchase Submit] log failed:', err);
    }
  }
</script>

<H1 text="Purchase" />

<form method="POST" action="?/purchase" class="form compact" on:submit={logBeforeSubmit}>

  <div class="row">
    <label for="supplierId">Supplier</label>
    <select name="supplierId" id="supplierId" required>
      <!-- Disabled placeholder prevents empty value from being posted -->
      <option value="" disabled selected hidden>Pick supplier</option>
      {#each suppliers as s}
        <option value={String(s.id)} selected={String(s.id) === String(defaults?.supplierId)}>
          {s.name ?? s.code ?? s.id}
        </option>
      {/each}
    </select>
  </div>

  <div class="row">
    <label for="shade">Shade</label>
    <select name="shade" id="shade" required>
      <option value="" disabled selected hidden>Pick shade</option>
      {#each shades as sh}
        <!-- robust compare so default actually selects -->
        <option value={sh} selected={String(sh).toUpperCase() === String(defaults?.shade ?? '').toUpperCase()}>
          {sh}
        </option>
      {/each}
    </select>
  </div>

  <div class="row">
    <label for="size">Size</label>
    <select name="size" id="size" required>
      <option value="" disabled selected hidden>Pick size</option>
      {#each sizes as sz}
        <!-- show the label exactly as the value (ANY/LUMPS/CHIPS/FINE) -->
        <option
          value={sz}
          selected={String(sz).toUpperCase() === String(defaults?.size ?? 'ANY').toUpperCase()}>
          {sz}
        </option>
      {/each}
    </select>
  </div>
  

  <div class="row">
    <label for="qty">Quantity (t)</label>
    <input id="qty" name="qty" type="number" step="0.01" min="0.01" required />
  </div>

  <div class="row">
    <label for="ratePerMt">Rate / MT</label>
    <input id="ratePerMt" name="ratePerMt" type="number" step="0.01" min="0" />
  </div>

  <div class="row">
    <label for="freightPerMt">Freight / MT</label>
    <input id="freightPerMt" name="freightPerMt" type="number" step="0.01" min="0" />
  </div>

  <div class="row">
    <label for="supplierFreight">Supplier Freight</label>
    <input id="supplierFreight" name="supplierFreight" type="number" step="0.01" min="0" />
  </div>

  <div class="row">
    <label for="roadExp">Road Exp</label>
    <input id="roadExp" name="roadExp" type="number" step="0.01" min="0" />
  </div>

  <div class="row">
    <label for="cashPaid">Cash Paid</label>
    <input id="cashPaid" name="cashPaid" type="number" step="0.01" min="0" />
  </div>

  <div class="row">
    <label for="paymentMode">Payment Mode</label>
    <input id="paymentMode" name="paymentMode" type="text" placeholder="e.g. CASH, BANK, OTHER" />
  </div>

  <div class="row">
    <label for="date">Doc Date</label>
    <input id="date" name="date" type="date" />
  </div>

  <div class="row stack">
    <label for="remarks">Remarks</label>
    <textarea id="remarks" name="remarks" rows="3" placeholder="Optional notes..."></textarea>
  </div>

  <div class="actions" style="margin-top: 1rem;">
    <button type="submit" class="primary">Submit</button>
  </div>
</form>

<style>
  form.form {
    max-width: 420px;
    margin: 0 auto;
    background: var(--surfaceColor);
    border: 1px solid var(--borderColor);
    border-radius: var(--radiusMd);
    padding: 1rem;
  }
  .row { display: flex; flex-direction: column; margin-bottom: 0.6rem; }
  label { font-size: 0.9rem; font-weight: 500; margin-bottom: 0.25rem; color: var(--secondaryText); }
  input, select, textarea {
    background: var(--inputBg);
    border: 1px solid var(--borderColor);
    color: var(--primaryText);
    border-radius: var(--radiusSm);
    padding: 0.4rem 0.5rem;
    font-size: 0.95rem;
  }
  .actions { display: flex; justify-content: center; }
  button.primary {
    background: var(--accentColor);
    color: var(--onAccentText);
    font-weight: 600;
    padding: 0.6rem 1.25rem;
    border: none;
    border-radius: var(--radiusSm);
    cursor: pointer;
  }
  button.primary:hover { filter: brightness(1.1); }
</style>
