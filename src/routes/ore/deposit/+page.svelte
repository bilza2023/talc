<script>
  import { enhance } from '$app/forms';

  export let data;
  const { stationCode, suppliers = [], grades = [] } = data;

  // Build options
  const supplierItems = suppliers.map(s => ({
    value: String(s.id),
    label: `${s.code} — ${s.name}`
  }));
  const gradeItems = grades.map(g => ({ value: g, label: g }));
</script>

<form method="POST" action="?/deposit" use:enhance class="form">
  <!-- Hidden station code -->
  <input type="hidden" name="stationCode" value={stationCode} />

  <!-- Grade (required) -->
  <div class="field">
    <label for="gradeCode">Grade</label>
    <select id="gradeCode" name="gradeCode" required>
      <option value="" disabled selected>Select grade</option>
      {#each gradeItems as g}
        <option value={g.value}>{g.label}</option>
      {/each}
    </select>
  </div>

  <!-- Quantity in tons (required) -->
  <div class="field">
    <label for="createdTon">Quantity (t)</label>
    <input
      id="createdTon"
      name="createdTon"
      type="number"
      inputmode="decimal"
      step="0.001"
      min="0.001"
      placeholder="e.g. 12.500"
      required
    />
  </div>

  <!-- Supplier (optional dropdown) -->
  <div class="field">
    <label for="supplierId">Supplier (optional)</label>
    <select id="supplierId" name="supplierId">
      <option value="">— None —</option>
      {#each supplierItems as s}
        <option value={s.value}>{s.label}</option>
      {/each}
    </select>
  </div>

  <!-- Amount (optional money) -->
  <div class="field">
    <label for="amount">Amount (optional)</label>
    <input
      id="amount"
      name="amount"
      type="number"
      inputmode="decimal"
      step="0.01"
      min="0.01"
      placeholder="e.g. 25000.00"
    />
  </div>

  <!-- Deposited at (optional) -->
  <div class="field">
    <label for="depositedAt">Deposited at (optional)</label>
    <input
      id="depositedAt"
      name="depositedAt"
      type="datetime-local"
      placeholder="YYYY-MM-DDTHH:mm"
    />
  </div>

  <div class="actions">
    <button type="submit">Save Deposit</button>
  </div>
</form>

<style>
  /* token-friendly, mobile-first */
  .form {
    width: min(96vw, 720px);
    margin-inline: auto;
    padding: var(--space-4, 1rem);
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-4, 1rem);
    background: var(--surface-1, #0b0f19);
    border: 1px solid var(--border-1, #334155);
    border-radius: var(--radius-lg, 14px);
  }

  .field {
    display: grid;
    gap: var(--space-2, 0.5rem);
  }

  label {
    font-size: var(--font-size-2, 0.9rem);
    color: var(--text-2, #94a3b8);
  }

  input,
  select {
    width: 100%;
    min-height: 44px;
    padding: var(--space-3, 0.75rem);
    font-size: var(--font-size-3, 1rem);
    color: var(--text-1, #e5e7eb);
    background: var(--field-bg, var(--surface-2, #111827));
    border: 1px solid var(--border-1, #334155);
    border-radius: var(--radius-md, 12px);
  }

  input:focus,
  select:focus {
    outline: none;
    border-color: var(--brand-5, #3b82f6);
    box-shadow: 0 0 0 3px var(--focus-ring, rgba(59,130,246,.25));
  }

  .actions {
    display: flex;
    justify-content: flex-end;
  }

  button {
    min-height: 44px;
    padding: 0 var(--space-5, 1.25rem);
    border-radius: var(--radius-full, 999px);
    border: 1px solid var(--brand-6, #2563eb);
    background: var(--brand-5, #3b82f6);
    color: white;
    font-weight: 600;
  }

  button:hover {
    filter: brightness(1.03);
  }
</style>
