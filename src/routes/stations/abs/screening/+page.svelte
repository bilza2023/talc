<script>
  export let data; // { stationCode, lane, sizes, fromUrl }
  export let form;

  const { stationCode, lane, sizes = [], fromUrl = {} } = data;

  // Prefill from URL/loader
  let supplierId = fromUrl.supplierId ?? '';
  let fromShade  = fromUrl.fromShade ?? '';
  let available  = fromUrl.fromQtyT ?? 0;   // Available = fromQtyT from URL

  // Fixed rows as individual reactive vars
  let qty_LUMPS = '';
  let qty_CHIPS = '';
  let qty_FINE  = '';

  const num = (x) => {
    const n = Number(x);
    return Number.isFinite(n) ? n : 0;
  };

  const allocated = () => num(qty_LUMPS) + num(qty_CHIPS) + num(qty_FINE);
  const remaining = () => +(Number(available) - allocated()).toFixed(6);
  const disabled = () => !(allocated() > 0) || allocated() > Number(available);
</script>

<h1>{stationCode} — Screening</h1>
<p>Lane: <strong>{lane}</strong></p>

{#if form?.success}
  <p class="success" aria-live="polite">
    ✅ Screened. <code>{form.screenId}</code>
  </p>
{:else if form?.error}
  <p class="error" aria-live="assertive">
    {form.error}{#if form.detail} — <code>{form.detail}</code>{/if}
  </p>
{/if}

<form method="POST" action="?/screen" autocomplete="off">
  <!-- Hidden identity + Available from URL -->
  <input type="hidden" name="supplierId" value={supplierId} />
  <input type="hidden" name="fromShade" value={fromShade} />
  <input type="hidden" name="fromQtyT" value={available} />

  <fieldset>
    <legend>Source</legend>
    <div class="grid">
      <div class="read">
        <label>Supplier</label>
        <div class="pill">#{supplierId}</div>
      </div>
      <div class="read">
        <label>Shade</label>
        <div class="pill">{fromShade}</div>
      </div>
      <div class="read">
        <label>Available (t)</label>
        <div class="pill">{Number(available)}</div>
      </div>
    </div>
  </fieldset>

  <fieldset>
    <legend>Allocate by Size (SCREENED)</legend>
    <table class="targets">
      <thead>
        <tr>
          <th>#</th>
          <th>Size</th>
          <th>Qty (t)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td><strong>LUMPS</strong></td>
          <td>
            <input
              name="qty_LUMPS"
              bind:value={qty_LUMPS}
              type="number"
              step="0.000001"
              min="0"
              placeholder="0"
            />
          </td>
        </tr>
        <tr>
          <td>2</td>
          <td><strong>CHIPS</strong></td>
          <td>
            <input
              name="qty_CHIPS"
              bind:value={qty_CHIPS}
              type="number"
              step="0.000001"
              min="0"
              placeholder="0"
            />
          </td>
        </tr>
        <tr>
          <td>3</td>
          <td><strong>FINE</strong></td>
          <td>
            <input
              name="qty_FINE"
              bind:value={qty_FINE}
              type="number"
              step="0.000001"
              min="0"
              placeholder="0"
            />
          </td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3">
            <strong>Allocated:</strong> {+allocated().toFixed(6)}t
            &nbsp;|&nbsp;
            <strong>Cap remaining:</strong> {+remaining().toFixed(6)}t
          </td>
        </tr>
      </tfoot>
    </table>
  </fieldset>

  <div class="actions">
    <button type="submit" >
      Screen
    </button>
    <button formmethod="POST" formaction="?/cancel" class="secondary" type="submit">Cancel</button>
  </div>
</form>

<style>
  form { display: grid; gap: 1rem; }
  fieldset { border: 1px solid var(--border-color, #333); padding: .75rem 1rem; border-radius: .5rem; }
  legend { font-weight: 600; }
  .grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: .75rem; }
  .read label { display: block; font-size: .85rem; opacity: .9; margin-bottom: .25rem; }
  .pill { border: 1px solid #333; padding: .4rem .6rem; border-radius: .35rem; background: #1b1b1b; }
  table.targets { width: 100%; border-collapse: collapse; }
  table.targets th, table.targets td { border-bottom: 1px solid #333; padding: .4rem .5rem; }
  table.targets tfoot td { font-weight: 600; }
  .actions { display: flex; gap: .5rem; }
  .secondary { opacity: .85; }
  .success { color: #4caf50; }
  .error { color: #ff6b6b; }
  input { width: 100%; }
  code { padding: 0 .25rem; background: #222; border-radius: .25rem; }
</style>
