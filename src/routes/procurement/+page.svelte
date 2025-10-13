<script>
    export let data;
    const { suppliers, shades, sizes, defaults } = data;
  </script>
  
  <form method="POST" use:enhance>
    <h1>Purchase (Screened / Unscreened)</h1>
  
    <label>Supplier</label>
    <select name="supplierId" required>
      {#each suppliers as s}
        <option value={s.id} selected={s.id === defaults.supplierId}>{s.name}</option>
      {/each}
    </select>
  
    <label>Shade</label>
    <select name="shade" required>
      {#each shades as sh}
        <option value={sh} selected={sh === defaults.shade}>{sh}</option>
      {/each}
    </select>
  
    <label>Size</label>
    <select name="size" required>
      {#each sizes as sz}
        <option value={sz} selected={sz === defaults.size}>{sz}</option>
      {/each}
    </select>
  
    <label>Quantity (t)</label>
    <input type="number" step="0.01" name="qty" required />
  
    <label>Rate / MT</label>
    <input type="number" step="0.01" name="ratePerMt" />
  
    <label>Freight / MT</label>
    <input type="number" step="0.01" name="freightPerMt" />
  
    <label>Supplier Freight</label>
    <input type="number" step="0.01" name="supplierFreight" />
  
    <label>Road Exp</label>
    <input type="number" step="0.01" name="roadExp" />
  
    <label>Cash Paid</label>
    <input type="number" step="0.01" name="cashPaid" />
  
    <label>Payment Mode</label>
    <input type="text" name="paymentMode" />
  
    <label>Remarks</label>
    <textarea name="remarks"></textarea>
  
    <button type="submit" formaction="?/purchase">Submit</button>
  </form>
  
  <style>
    form {
      max-width: 420px;
      margin: 2rem auto;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }
    label { font-weight: 500; }
    input, select, textarea {
      padding: 0.4rem;
      font-size: 0.95rem;
    }
    button {
      margin-top: 1rem;
      padding: 0.6rem;
      font-weight: bold;
    }
  </style>
  