<script>
  export let data;   // { stationCode, lane, rows }
  export let form;   // action state

  const { stationCode, lane, rows = [] } = data;
  const justId = form?.received?.transportId;

  const fmt = (ts) => new Date(ts).toLocaleString();
</script>

<h1>{stationCode} — Receive (PSS_SORTED → KEF_SORTED)</h1>
<p>Lane: <strong>{lane}</strong></p>

{#if form?.success}
  <p class="success" aria-live="polite">
    Received <code>{justId}</code>.
  </p>
{:else if form?.error}
  <p class="error" aria-live="assertive">
    {form.error}{#if form.detail} — <code>{form.detail}</code>{/if}
  </p>
{/if}

{#if rows.length === 0}
  <p>No inbound dispatches from PSS for KEF_SORTED.</p>
{:else}
  <table>
    <thead>
      <tr>
        <th>Transport</th>
        <th>When</th>
        <th>Supplier</th>
        <th>Shade</th>
        <th>Size</th>
        <th>Dispatched (t)</th>
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
          <td style="text-align:right">{r.dispatchedQty}</td>
          <td>
            <form method="POST" action="?/receiveOne" autocomplete="off">
              <input type="hidden" name="transportId" value={r.transportId} />
              <input type="hidden" name="supplierId" value={r.supplierId} />
              <label>
                Qty (t)
                <input name="qty" type="number" step="any" min="0.01" required />
              </label>
              <label>
                Amount (optional)
                <input name="amount" type="number" step="any" />
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
  table { width: 100%; border-collapse: collapse; }
  th, td { padding: 0.5rem; border-bottom: 1px solid var(--border, #333); }
  th { text-align: left; }
  .success { color: #1fbf75; }
  .error { color: #ff6b6b; }
  form label { display: block; margin-bottom: 0.25rem; font-size: 0.9rem; }
  form input { width: 8rem; }
  button { margin-top: 0.25rem; }
</style>
