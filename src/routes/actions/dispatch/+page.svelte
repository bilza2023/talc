<script>
    export let data;
    export let form;
  
    function goBack() { history.back(); }
  </script>
  
  <style>
    @import '$lib/styles/tokens.css';
  
    .page { min-height: 100dvh; background: var(--backgroundColor); color: var(--primaryText); padding: 24px; display:grid; place-items:start center; }
    .card {
      width: min(760px, 92vw);
      background: var(--surfaceColor);
      border: 1px solid var(--borderColor);
      border-radius: 14px;
      box-shadow: 0 4px 24px rgba(0,0,0,.08);
      padding: 20px;
    }
    .eyebrow { color: var(--secondaryText); font-size: 12px; text-transform: uppercase; letter-spacing: .08em; }
    h1 { margin: 6px 0 2px; font-size: 22px; }
    .sub { color: var(--secondaryText); font-size: 13px; margin-bottom: 8px; }
  
    .alert { border: 1px solid var(--borderColor); border-radius: 10px; padding: 10px 12px; margin: 10px 0 14px; font-size: 14px; }
    .alert.success { background: color-mix(in oklab, var(--surfaceColor) 80%, var(--secondaryColor)); }
    .alert.error { background: color-mix(in oklab, var(--surfaceColor) 85%, #d24a4a); border-color: #d24a4a; }
  
    .kv { display:grid; grid-template-columns: 140px 1fr; gap: 8px 12px; font-size: 14px; margin: 8px 0 14px; }
    .kv .k { color: var(--secondaryText); }
    .muted { color: var(--secondaryText); }
  
    .form { display:grid; gap: 14px; }
    label { display:block; margin-bottom: 6px; font-size: 13px; color: var(--secondaryText); }
    input {
      width: 100%; background: var(--backgroundColor); color: var(--primaryText);
      border: 1px solid var(--borderColor); border-radius: 10px; padding: 10px 12px; font-size: 14px;
    }
    input:focus {
      outline: none; border-color: var(--primaryColor);
      box-shadow: 0 0 0 3px color-mix(in oklab, var(--primaryColor) 25%, transparent);
    }
    .actions { display:flex; gap: 10px; }
    .btn { appearance: none; border: 1px solid var(--borderColor); border-radius: 12px; padding: 10px 14px; font-size: 14px; cursor: pointer; background: var(--surfaceColor); color: var(--primaryText); }
    .btn.primary { background: var(--primaryColor); border-color: var(--primaryColor); color: #fff; }
    .btn.ghost { background: transparent; }
  </style>
  
  <section class="page">
    <div class="card">
      <header>
        <div class="eyebrow">Dispatch (transfer)</div>
        <h1>{data.stationCode} / {data.mmaCode}</h1>
        <div class="sub">Stock: <span class="muted">{data.stockKey}</span></div>
      </header>
  
      {#if data.error}
        <div class="alert error">{data.error}</div>
      {:else}
        {#if form?.success}
          <div class="alert success">
            <strong>Success:</strong>
            Dispatched {form.posted.qty} from {form.posted.supplierId} — {form.posted.shade}/{form.posted.size}
            → {form.posted.toStationCode} / {form.posted.toMmaCode}
          </div>
        {:else if form?.error}
          <div class="alert error">{form.error}</div>
        {/if}
  
        <div class="kv">
          <div class="k">From</div><div>{data.stationCode} / {data.mmaCode}</div>
          <div class="k">Supplier</div><div>{data.supplierId}</div>
          <div class="k">Shade</div><div>{data.shade}</div>
          <div class="k">Size</div><div>{data.size}</div>
          <div class="k">On hand (slot)</div><div>{data.currentQty}</div>
          <div class="k">To</div><div>{data.toStationCode} / {data.toMmaCode}</div>
        </div>
  
        <form class="form" method="post">
          <!-- Identity fields from URL -->
          <input type="hidden" name="stationCode" value={data.stationCode} />
          <input type="hidden" name="mmaCode" value={data.mmaCode} />
          <input type="hidden" name="supplierId" value={data.supplierId} />
          <input type="hidden" name="shade" value={data.shade} />
          <input type="hidden" name="size" value={data.size} />
          <input type="hidden" name="toStationCode" value={data.toStationCode} />
          <input type="hidden" name="toMmaCode" value={data.toMmaCode} />
  
          <div>
            <label for="qty">Quantity to dispatch</label>
            <input id="qty" name="qty" type="number" step="0.01" min="0.01" placeholder="e.g. 3.25" required />
          </div>
  
          <div class="actions">
            <button type="submit" class="btn primary">Dispatch</button>
            <button type="button" class="btn ghost" on:click={goBack}>Back</button>
          </div>
        </form>
      {/if}
    </div>
  </section>
  