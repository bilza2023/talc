<script>
  export let data; // { stationCode, lane, rows }
  export let form;

  const { stationCode, lane, rows = [] } = data;
  const justId = form?.received?.transportId;

  const fmt = (ts) => new Date(ts).toLocaleString();
</script>

<h1>{stationCode} — Receive (ABS → PSS_SCREENED)</h1>
<p>Lane: <strong>{lane}</strong></p>

{#if form?.success}
  <p class="success" aria-live="polite">
    Received <code>{justId}</code>.
  </p>
{:else if form?.error}
  <p class="error" aria-live="polite">
    {form.error}{#if form.detail} — <code>{form.detail}</code>{/if}
  </p>
{/if}

{#if rows.length === 0}
  <p>No inbound dispatches from ABS for PSS_SCREENED.</p>
{:else}
  <table class="inbound">
    <thead>
      <tr>
        <th>Transport</th>
        <th>When</th>
        <th>Supplier</th>
        <th>Shade</th>
        <th>Size</th>
        <th>Dispatched Qty</th>
        <th>Receive</th>
      </tr>
    </thead>
    <tbody>
      {#each rows as r}
        <tr>
          <td><code>{r.transportId}</code></td>
          <td>{fmt(r.createdAt)}</td>
          <td>{r.supplierId}</td>
          <td>{r.shade}</td>
          <td>{r.size}</td>
          <td>{r.dispatchedQty}</td>
          <td>
            <!-- Call the named action `receiveOne` -->
            <form method="POST" action="?/receiveOne">
              <input type="hidden" name="transportId" value={r.transportId} />
              <input type="hidden" name="supplierId"  value={r.supplierId} />

              <label>Incoming qty (t)
                <input name="qty" type="number" min="0.01" step="0.01" required />
              </label>

              <label>Amount (optional)
                <input name="amount" type="number" step="0.01" />
              </label>

              <button>Receive</button>
            </form>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
{/if}

<style>
  h1 { margin: 0 0 .5rem; font-size: 1.2rem; }
  .success { color: #2ecc71; }
  .error { color: #e74c3c; }
  table.inbound { border-collapse: collapse; width: 100%; margin-top: .5rem; }
  th, td { padding: .45rem .55rem; border-bottom: 1px solid var(--border, #333); text-align: left; }
  th { font-weight: 700; }
  form { display: grid; grid-template-columns: 1fr 1fr auto; gap: .4rem; align-items: center; }
  form label { display: grid; font-size: .9rem; }
  input, button { padding: .35rem .5rem; }
  button { border: 1px solid var(--border, #333); border-radius: .35rem; font-weight: 600; }
  button:hover { outline: 1px solid currentColor; }
</style>
