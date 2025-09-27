<script>
  export let data;
  export let form;

  const { stationCode, lane, rows } = data;
</script>

<h1>{stationCode} — Receive (ABS → PSS_SCREENED)</h1>
<p>Lane: <strong>{lane}</strong></p>

{#if form?.success}
  <div class="alert ok">Received <code>{form.received.transportId}</code>.</div>
{:else if form?.error}
  <div class="alert err">
    {form.error}{#if form.detail} — <code>{form.detail}</code>{/if}
  </div>
{/if}

{#if rows.length === 0}
  <p class="muted">No inbound dispatches from ABS for <strong>PSS_SCREENED</strong>.</p>
{:else}
  <table class="grid">
    <thead>
      <tr>
        <th>When</th>
        <th>SupplierId</th>
        <th>Shade / Size</th>
        <th>Dispatched Qty (t)</th>
        <th>Incoming Qty (t)</th>
        <th>Amount</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
      {#each rows as r}
        <tr>
          <td>{new Date(r.createdAt).toLocaleString()}</td>
          <td>{r.supplierId}</td>
          <td>{r.shade} / {r.size}</td>
          <td>{r.dispatchedQty}</td>
          <td>
            <form method="POST" action="?/receiveOne" class="inline">
              <input type="hidden" name="transportId" value={r.transportId} />
              <input type="hidden" name="supplierId" value={r.supplierId} />

              <!-- Incoming/measured qty (required). Default to dispatched qty, but editable -->
              <input
                type="number"
                name="qty"
                step="0.001"
                min="0.001"
                required
                value={r.dispatchedQty}
                title="Incoming weight in tons"
                style="width:8ch"
              />

              <!-- Optional amount -->
              <input
                type="number"
                name="amount"
                step="1"
                inputmode="numeric"
                placeholder="amount"
                title="Amount (optional)"
                style="width:9ch; margin-left:.4rem;"
              />

              <button type="submit" style="margin-left:.5rem;">Receive</button>
            </form>
          </td>
          <td><!-- amount column is in the form above; left empty for compactness --></td>
          <td><!-- submit button lives in the form, same cell --></td>
        </tr>
      {/each}
    </tbody>
  </table>
{/if}

<style>
  h1 { margin: 0 0 0.5rem; }
  .muted { opacity: 0.7; }
  .inline { display: inline-flex; align-items: center; }
  .alert {
    padding: .6rem .8rem; border-radius: .5rem; margin:.5rem 0;
    border:1px solid #444; background: rgba(255,255,255,.03);
  }
  .ok  { border-color:#2d7; box-shadow:0 0 0 2px rgba(45,215,120,.12); }
  .err { border-color:#e55; box-shadow:0 0 0 2px rgba(229,85,85,.12); }
  table.grid { width:100%; border-collapse: collapse; }
  table.grid th, table.grid td { padding:.5rem .6rem; border-bottom:1px solid #333; text-align:left; }
</style>
