<script>
    export let data;
    export let form; // SvelteKit action result
    const SHADES = ['WHITE','GREY','GREEN','LIGHTGREY','MIXED'];
    const SIZES = ['CHIPS','FINE','LUMPS'];
  
    function goBack() {
      history.back();
    }
  </script>
  
  <section class="page">
    <div class="card">
      <header class="card-head">
        <div class="eyebrow">Purchase Raw</div>
        <h1>{data.stationCode}</h1>
        <div class="sub">MMA: <strong>{data.mmaCode}</strong></div>
      </header>
  
      {#if form?.success}
        <div class="alert success">
          <strong>Success:</strong>
          Deposit posted for <em>{form.posted.supplierName}</em> — {form.posted.shade}/{form.posted.size}, Qty {form.posted.qty}
        </div>
      {:else if form?.error}
        <div class="alert error">
          <strong>Check & try again:</strong> {form.error}
        </div>
      {/if}
  
      <form class="form" method="post">
        <div class="field">
          <label for="supplierId">Supplier</label>
          <select id="supplierId" name="supplierId" required>
            {#each data.suppliers as s}
              <option value={s.id} selected={s.id === Number(data.defaults.supplierId)}>
                {s.name}
              </option>
            {/each}
          </select>
          <small class="hint">Mock list for now.</small>
        </div>
  
        <div class="field grid2">
          <div>
            <label for="shade">Shade</label>
            <select id="shade" name="shade" required>
              {#each SHADES as s}
                <option value={s} selected={s === data.defaults.shade}>{s}</option>
              {/each}
            </select>
          </div>
  
          <div>
            <label for="size">Size</label>
            <select id="size" name="size" required>
              {#each SIZES as s}
                <option value={s} selected={s === data.defaults.size}>{s}</option>
              {/each}
            </select>
          </div>
        </div>
  
        <div class="field">
          <label for="qty">Quantity</label>
          <input id="qty" name="qty" type="number" step="0.01" min="0.01" required value={data.defaults.qty} />
          <small class="hint">Use decimals as needed (e.g., 3.25).</small>
        </div>
  
        <div class="actions">
          <button type="submit" class="btn primary">Post Purchase</button>
          <button type="button" class="btn ghost" on:click={goBack}>Back</button>
        </div>
      </form>
    </div>
  </section>
  
  <style>
    /* import your design tokens (adjust the path if different) */
    @import '$lib/styles/tokens.css';
  
    :root {
      font-family: system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
    }
  
    .page {
      background: var(--backgroundColor);
      color: var(--primaryText);
      min-height: 100dvh;
      display: grid;
      place-items: start center;
      padding: 24px;
    }
  
    .card {
      width: min(720px, 92vw);
      background: var(--surfaceColor);
      border: 1px solid var(--borderColor);
      border-radius: 14px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
      padding: 20px 20px 8px;
    }
  
    .card-head {
      margin-bottom: 12px;
    }
    .eyebrow {
      color: var(--secondaryText);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: .08em;
    }
    h1 {
      margin: 6px 0 2px;
      font-size: 22px;
    }
    .sub {
      color: var(--secondaryText);
      font-size: 13px;
    }
  
    .alert {
      border: 1px solid var(--borderColor);
      background: color-mix(in oklab, var(--surfaceColor) 80%, var(--secondaryColor));
      padding: 10px 12px;
      border-radius: 10px;
      margin: 10px 0 14px;
      font-size: 14px;
    }
    .alert.success {
      border-color: color-mix(in oklab, var(--secondaryColor) 60%, var(--borderColor));
    }
    .alert.error {
      background: color-mix(in oklab, var(--surfaceColor) 85%, #d24a4a);
      border-color: #d24a4a;
    }
  
    .form {
      display: grid;
      gap: 14px;
      margin-top: 6px;
      padding-bottom: 8px;
    }
  
    .grid2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
  
    .field label {
      display: inline-block;
      margin-bottom: 6px;
      font-size: 13px;
      color: var(--secondaryText);
    }
  
    select,
    input[type="number"],
    input[type="text"] {
      width: 100%;
      background: var(--backgroundColor);
      color: var(--primaryText);
      border: 1px solid var(--borderColor);
      border-radius: 10px;
      padding: 10px 12px;
      font-size: 14px;
      outline: none;
      transition: border-color .15s ease, box-shadow .15s ease;
    }
    select:focus,
    input:focus {
      border-color: var(--primaryColor);
      box-shadow: 0 0 0 3px color-mix(in oklab, var(--primaryColor) 25%, transparent);
    }
  
    .hint {
      display: block;
      margin-top: 6px;
      color: var(--secondaryText);
      font-size: 12px;
    }
  
    .actions {
      display: flex;
      gap: 10px;
      margin-top: 6px;
    }
  
    .btn {
      appearance: none;
      border: 1px solid var(--borderColor);
      border-radius: 12px;
      padding: 10px 14px;
      font-size: 14px;
      cursor: pointer;
      background: var(--surfaceColor);
      color: var(--primaryText);
      transition: transform .02s ease, background .15s ease, border-color .15s ease;
    }
    .btn:hover { background: color-mix(in oklab, var(--surfaceColor) 80%, var(--backgroundColor)); }
    .btn:active { transform: translateY(1px); }
  
    .btn.primary {
      background: var(--primaryColor);
      border-color: var(--primaryColor);
      color: white;
    }
    .btn.primary:hover {
      background: color-mix(in oklab, var(--primaryColor) 90%, black);
      border-color: color-mix(in oklab, var(--primaryColor) 90%, black);
    }
  
    .btn.ghost {
      background: transparent;
    }
  
    @media (max-width: 560px) {
      .grid2 { grid-template-columns: 1fr; }
    }
  </style>
  