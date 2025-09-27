<script>
    export let data;
    export let form;
  
    const {
      error,
      fromMmaCode,
      toMmaCode,
      supplierId,
      shade,
      size,
      availableQty
    } = data || {};
  </script>
  
  <h1>Dispatch (ABS → KEF)</h1>
  <p class="sub">Route: {fromMmaCode} → {toMmaCode}</p>
  
  {#if error}
    <div class="alert alert-error">{error}</div>
    <p>Open this page from the ABS Unscreened Slots page.</p>
  {:else}
    <div class="panel">
      <p><strong>Supplier:</strong> {supplierId}</p>
      <p><strong>Shade:</strong> {shade}</p>
      <p><strong>Size:</strong> {size}</p>
      <p><strong>Available:</strong> {availableQty}t</p>
    </div>
  
    {#if form?.error}
      <div class="alert alert-error">{form.error}</div>
    {/if}
  
    <form method="POST" autocomplete="off" class="frm">
      <input type="hidden" name="fromMmaCode" value={fromMmaCode} />
      <input type="hidden" name="toMmaCode" value={toMmaCode} />
      <input type="hidden" name="supplierId" value={supplierId} />
      <input type="hidden" name="shade" value={shade} />
      <input type="hidden" name="size" value={size} />
  
      <label>
        <span>Quantity (t)</span>
        <input
          name="qty"
          type="number"
          step="0.01"
          min="0.01"
          max={availableQty}
          required
          placeholder="e.g., 5.00"
        />
      </label>
  
      <div class="actions">
        <a href="/stations/abs/abs_unscreened_raw" class="btn ghost">Cancel</a>
        <button class="btn">Confirm Dispatch</button>
      </div>
    </form>
  {/if}
  
  <style>
    .sub{opacity:.8;margin-top:-.5rem}
    .panel{padding:.75rem;border:1px solid #333;border-radius:.5rem;margin:.75rem 0;background:var(--surface-2);}
    .frm{display:flex;flex-direction:column;gap:.75rem;max-width:420px;}
    label{display:flex;flex-direction:column;gap:.35rem}
    input[type="number"]{padding:.5rem .6rem;border:1px solid #444;border-radius:.5rem;background:var(--surface-1);color:inherit}
    .actions{display:flex;gap:.5rem;align-items:center}
    .btn{padding:.5rem 1rem;border:1px solid #444;border-radius:.5rem;background:var(--surface-3);cursor:pointer;text-decoration:none;display:inline-block}
    .btn.ghost{background:transparent}
    .alert{padding:.6rem .8rem;border-radius:.5rem}
    .alert-error{background:#3a1b1b;border:1px solid #5b2a2a}
  </style>
  