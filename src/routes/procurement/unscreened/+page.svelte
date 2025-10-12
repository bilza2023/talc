<script>
  export let data;
  const { suppliers = [], defaults = {} } = data;
</script>

<h1>Purchase — Unscreened (RAW)</h1>

<form method="POST" action="?/purchase" class="form spacious">
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
    <input type="number" step="0.01" name="rate" required />
  </div>

  <div class="row">
    <label>Freight / mt</label>
    <input type="number" step="0.01" name="freightMt" required />
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

  <div class="actions">
    <input type="submit" value="Submit Purchase" class="primary" />
    <button type="submit" formaction="?/cancel" formmethod="POST">Cancel</button>
  </div>
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
  max-width: 520px; /* matches your form width */
}

/* optional tiny accent bar */
h1::after {
  content: "";
  display: block;
  height: 3px;
  margin: 6px auto 0;
  width: 72px;
  background: var(--primaryColor);
  border-radius: 999px;
}

  .form {
    max-width: 520px;
    margin: 1.5rem auto;
  }
</style>
