
<script>
    export let data;
  </script>
  
  <h1>Deposit</h1>
  
  {#if data.error}
    <p style="color:red">{data.error}</p>
  {:else}
    <form method="post">
      <input type="hidden" name="stationCode" value={data.stationCode} />
      <input type="hidden" name="mmaCode" value={data.mmaCode} />
  
      <div>
        <label>Supplier ID</label>
        <input name="supplierId" type="number" required />
      </div>
  
      <div>
        <label>Shade</label>
        <input name="shade" type="text" required />
      </div>
  
      <div>
        <label>Size</label>
        <input name="size" type="text" required />
      </div>
  
      <div>
        <label>Quantity</label>
        <input name="qty" type="number" step="0.01" required />
      </div>
  
      <button type="submit">Deposit</button>
    </form>
  {/if}
  