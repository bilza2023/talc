<script>
  import { page } from '$app/stores';

  export let data;
  export let form;

  const suppliers = data?.suppliers ?? [];
  const d = data?.defaults ?? {};
  const today = new Date().toISOString().slice(0, 10);

  $: ok = $page.url.searchParams.get('ok');
</script>

<h1 class="title">Purchase — Screened</h1>

{#if form?.error}
  <div class="alert">{form.error}</div>
{/if}

<form method="POST" action="?/purchase" class="form">
  <!-- Required trio -->
  <div class="row">
    <label for="supplier">Supplier</label>
    <select id="supplier" name="supplierId" required>
      {#each suppliers as s}
        <option value={s.id} selected={String(s.id) === String(d.supplierId)}>{s.name}</option>
      {/each}
    </select>
  </div>

  <div class="row">
    <label for="shade">Shade</label>
    <select id="shade" name="shade" required>
      {#each ['WHITE','LIGHTGREY','GREY','BLACK','BROWN'] as sh}
        <option value={sh} selected={sh === d.shade}>{sh}</option>
      {/each}
    </select>
  </div>

  <!-- Screened MMA -->
  <input type="hidden" name="toMmaCode" value={d.toMmaCode || 'ABS_SCREENED'} />

  <!-- Breakdown (stacked; must sum > 0) -->
  <div class="stack">
    <div class="row">
      <label for="lumps">Lumps (t)</label>
      <input id="lumps" name="lumps" type="number" step="0.01" min="0" placeholder="0" />
    </div>
    <div class="row">
      <label for="chips">Chips (t)</label>
      <input id="chips" name="chips" type="number" step="0.01" min="0" placeholder="0" />
    </div>
    <div class="row">
      <label for="fines">Fines (t)</label>
      <input id="fines" name="fines" type="number" step="0.01" min="0" placeholder="0" />
    </div>
  </div>

  <!-- Date & payment -->
  <div class="row">
    <label for="date">Date</label>
    <input id="date" name="date" type="date" value={today} />
  </div>

  <div class="row">
    <label for="paymentMode">Payment Mode</label>
    <select id="paymentMode" name="paymentMode">
      <option value="">—</option>
      <option value="cash">Cash</option>
      <option value="bank">Bank</option>
      <option value="deferred">Deferred</option>
    </select>
  </div>

  <!-- Optional numeric costs -->
  <div class="row">
    <label for="ratePerMt">Rate per MT</label>
    <input id="ratePerMt" name="ratePerMt" type="number" step="0.01" placeholder="— optional —" />
  </div>

  <div class="row">
    <label for="freightPerMt">Freight per MT</label>
    <input id="freightPerMt" name="freightPerMt" type="number" step="0.01" placeholder="— optional —" />
  </div>

  <div class="row">
    <label for="supplierFreight">Supplier Freight</label>
    <input id="supplierFreight" name="supplierFreight" type="number" step="0.01" placeholder="— optional —" />
  </div>

  <div class="row">
    <label for="roadExp">Road Expense</label>
    <input id="roadExp" name="roadExp" type="number" step="0.01" placeholder="— optional —" />
  </div>

  <div class="row">
    <label for="cashPaid">Cash Paid</label>
    <input id="cashPaid" name="cashPaid" type="number" step="0.01" placeholder="— optional —" />
  </div>

  <!-- Remarks -->
  <div class="row">
    <label for="remarks">Remarks</label>
    <textarea id="remarks" name="remarks" rows="2" placeholder="— optional —"></textarea>
  </div>

  <div class="actions">
    <button type="submit" class="btn primary">Save Purchase</button>
    <button type="submit" formaction="?/cancel" class="btn">Cancel</button>
  </div>
</form>

{#if ok}
  <p class="ok">Saved.</p>
{/if}

<style>
  :global(body){
    background: var(--backgroundColor);
    color: var(--primaryText);
    font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Arial, "Apple Color Emoji", "Segoe UI Emoji";
  }
  .title{
    text-align:center;
    margin: 0.5rem 0 1rem;
    color: var(--baseTextColor, var(--primaryText));
  }
  .alert{
    background: color-mix(in oklab, var(--danger, #b00020) 15%, transparent);
    border: 1px solid var(--danger, #b00020);
    color: var(--dangerText, #fff);
    padding: .5rem .75rem;
    border-radius: .5rem;
    margin: 0 0 1rem;
  }
  .ok{ color: var(--success, #0a0); }

  .form{
    max-width: 560px;
    margin: 0 auto;
    padding: 1rem;
    background: var(--surfaceColor, #111);
    border: 1px solid var(--borderColor, #333);
    border-radius: 12px;
  }
  .row{
    display:flex;
    flex-direction:column;
    gap:.25rem;
    margin-bottom:.75rem;
  }
  /* Stacked breakdown */
  .stack{
    display:flex;
    flex-direction:column;
    gap:.5rem;
    margin-bottom:.5rem;
  }

  label{ font-size:.9rem; opacity:.9; }
  input, select, textarea{
    background: var(--inputBg, color-mix(in oklab, var(--surfaceColor,#111) 85%, var(--backgroundColor,#000)));
    color: var(--primaryText);
    border: 1px solid var(--borderColor,#333);
    border-radius: .5rem;
    padding: .55rem .7rem;
    outline: none;
  }
  input:focus, select:focus, textarea:focus{
    border-color: var(--accent, #46a);
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--accent,#46a) 30%, transparent);
  }
  .actions{
    display:flex;
    gap:.5rem;
    justify-content:center;
    margin-top:1rem;
  }
  .btn{
    background: var(--surfaceColor, #111);
    color: var(--primaryText);
    border: 1px solid var(--borderColor,#333);
    padding:.6rem 1rem;
    border-radius:.75rem;
    cursor:pointer;
  }
  .btn.primary{
    background: var(--accent, #46a);
    border-color: var(--accent, #46a);
    color: var(--buttonText, #fff);
  }
  .btn:hover{ opacity:.95; }
</style>
