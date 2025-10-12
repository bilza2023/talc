<script>
  export let data;
  const { suppliers = [], defaults = {} } = data;

  // Ensure a real initial value so supplierId doesn’t submit as empty/0
  let supplierId = defaults?.supplierId ?? (suppliers[0]?.id ?? '');
  let toMmaCode  = 'ABS_RAW';                 // only option for now
  let shade      = defaults?.shade ?? 'WHITE';

  // If suppliers load after hydration and supplierId is empty, pick the first
  $: if (!supplierId && suppliers.length) {
    supplierId = suppliers[0].id;
  }
</script>

<h1>Purchase — Unscreened (RAW)</h1>

<form method="POST" action="?/purchase" class="form spacious">
  <!-- Supplier -->
  <div class="row">
    <label>Supplier</label>
    <select name="supplierId" bind:value={supplierId} required>
      {#each suppliers as s}
        <option value={s.id}>{s.name}</option>
      {/each}
    </select>
  </div>

  <!-- Station / MMA (fixed option for now) -->
  <div class="row">
    <label>Station</label>
    <select name="toMmaCode" bind:value={toMmaCode} required>
      <option value="ABS_RAW">ABS — Unscreened (RAW)</option>
    </select>
  </div>

  <div class="row">
    <label>Date</label>
    <input type="date" name="date" required />
  </div>

  <div class="row">
    <label>Mode of Payment</label>
    <input type="text" name="paymentMode" placeholder="Cash / Credit" required />
  </div>

  <div class="row">
    <label>Lumps (t)</label>
    <input type="number" step="0.01" name="lumps" required />
  </div>

  <div class="row">
    <label>Chips (t)</label>
    <input type="number" step="0.01" name="chips" required />
  </div>

  <div class="row">
    <label>Fines (t)</label>
    <input type="number" step="0.01" name="fines" required />
  </div>

  <div class="row">
    <label>Rate / mt</label>
    <input type="number" step="0.01" name="ratePerMt" required />
  </div>

  <div class="row">
    <label>Freight / mt</label>
    <input type="number" step="0.01" name="freightPerMt" required />
  </div>

  <div class="row">
    <label>Supplier Freight</label>
    <input type="number" step="0.01" name="supplierFreight" required />
  </div>

  <div class="row">
    <label>Road Expense</label>
    <input type="number" step="0.01" name="roadExp" required />
  </div>

  <div class="row">
    <label>Cash Paid</label>
    <input type="number" step="0.01" name="cashPaid" required />
  </div>

  <!-- NEW: Remarks -->
  <div class="row stack">
    <label>Remarks</label>
    <textarea name="remarks" placeholder="Optional notes..."></textarea>
  </div>

  <!-- Hidden context for API -->
  <input type="hidden" name="shade" value={shade} />
  <input type="hidden" name="size" value="ANY" />

  <div class="actions">
    <input type="submit" value="Submit Purchase" class="primary" disabled={!suppliers.length} />
    <button type="submit" formaction="?/cancel" formmethod="POST">Cancel</button>
  </div>

  {#if !suppliers.length}
    <p class="muted" style="text-align:center;margin-top:8px">Add a supplier first to enable submission.</p>
  {/if}
</form>

<style>
  @import '$lib/styles/forms.css';
  @import '$lib/styles/tokens.css';

  h1 {
    color: var(--primaryText);
    background: var(--surfaceColor);
    border: 1px solid var(--borderColor);
    border-radius: 10px;
    text-align: center;
    font-size: 1.4rem;
    font-weight: 600;
    padding: 0.6rem 0.8rem;
    margin: 1rem auto 1.25rem;
    max-width: 520px;
  }
  h1::after {
    content: "";
    display: block;
    height: 3px;
    margin: 6px auto 0;
    width: 72px;
    background: var(--primaryColor);
    border-radius: 999px;
  }
  .form { max-width: 520px; margin: 1.5rem auto; }
</style>
