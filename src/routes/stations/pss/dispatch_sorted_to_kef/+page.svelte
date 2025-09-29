
<script>
    export let data;  // { cfg, supplierId, shade, size, qty, error }
    export let form;  // action result
  
    const { cfg, supplierId, shade, size, qty, error } = data;
    const laneStations = `${cfg.fromStationCode} → ${cfg.toStationCode}`;
    const laneMmas     = `${cfg.fromMmaCode} → ${cfg.toMmaCode}`;
  </script>
  
  <h1>{cfg.fromStationCode} — Dispatch</h1>
  <p>Lane (stations): <strong>{laneStations}</strong></p>
  <p>Lane (MMAs): <strong>{laneMmas}</strong></p>
  
  {#if form?.error}
    <p class="error" aria-live="assertive">{form.error}</p>
  {:else if error}
    <p class="error" aria-live="polite">{error}</p>
  {/if}
  
  <form method="POST" action="?/default" autocomplete="off">
    <!-- Guard hidden fields -->
    <input type="hidden" name="fromMmaCode" value={cfg.fromMmaCode} />
    <input type="hidden" name="toMmaCode"   value={cfg.toMmaCode} />
  
    <label>Supplier
      <input name="supplierId" type="number" min="1" required value={supplierId || ''} />
    </label>
  
    <label>Shade
      <input name="shade" required value={shade} />
    </label>
  
    <label>Size
      <input name="size" required value={size} />
    </label>
  
    <label>Qty (t)
      <input name="qty" type="number" min="0.01" step="0.01" required value={qty || ''} />
    </label>
  
    <button type="submit">Confirm Dispatch</button>
  </form>
  
  <style>
    h1 { margin-bottom: .25rem }
    p  { margin: .2rem 0 }
    form { display: grid; gap: .75rem; max-width: 420px }
    label { display: grid; gap: .25rem }
    .error { color: #c33 }
  </style>
  