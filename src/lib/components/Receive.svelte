<script>
  // Do NOT re-import global styles here.
  // Props (tolerant to old/new names)
  export let lane = undefined;            // string "A → B" OR { from, to }
  export let fromMmaCode = undefined;
  export let toMmaCode = undefined;

  export let stationCode = '';
  export let stationName = '';

  // From app-service listInboundFor()
  // rows: [{ transportId, createdAt, supplierId, shade, size, dispatchedQty }]
  export let rows = [];

  // Optional messages
  export let error = null;   // from loader
  export let message = null; // from action fail()

  // ---- lane normalization ----
  const laneFrom =
    (typeof lane === 'object' && lane?.from) ||
    fromMmaCode;
  const laneTo =
    (typeof lane === 'object' && lane?.to) ||
    toMmaCode;

  const fromCode = laneFrom ?? '(any)';
  const toCode = laneTo ?? '—';

  const fmt = (n) =>
    Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 3 });

  const fmtDate = (d) => {
    try {
      const dt = typeof d === 'string' ? new Date(d) : d;
      return dt?.toLocaleString?.() ?? String(d ?? '');
    } catch {
      return String(d ?? '');
    }
  };
</script>

<h1 class="page-title">Receive — {fromCode} → {toCode}</h1>
{#if stationName}
  <div class="subhead">{stationName}</div>
{/if}

{#if error || message}
  <div class="alert error">{error || message}</div>
{/if}

<section class="kpis">
  <div class="kpi">
    <div class="kpi-label">Inbound consignments</div>
    <div class="kpi-value"><b>{rows?.length ?? 0}</b></div>
  </div>
</section>

{#if (rows?.length ?? 0) === 0}
  <p>No inbound dispatches pending for {toCode}.</p>
{:else}
  <div class="table-wrap">
    <table class="list-table">
      <thead>
        <tr>
          <th>Transport</th>
          <th>Created</th>
          <th>Supplier</th>
          <th>Shade</th>
          <th>Size</th>
          <th class="num">Dispatched (t)</th>
          <th class="num">Receive Qty (t)</th>
          <th class="num">Amount</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {#each rows as r}
          <tr>
            <td>{r.transportId}</td>
            <td>{fmtDate(r.createdAt)}</td>
            <td>{r.supplierId}</td>
            <td>{r.shade}</td>
            <td>{r.size}</td>
            <td class="num">{fmt(r.dispatchedQty)}</td>
            <td colspan="3" class="no-pad">
              <!-- Inline receive form per row -->
              <form method="POST" class="form compact inline-form">
                <!-- Hidden required fields -->
                <input type="hidden" name="transportId" value={r.transportId} />
                <input type="hidden" name="toMmaCode" value={toCode} />
                <input type="hidden" name="supplierId" value={r.supplierId} />
                <input type="hidden" name="shade" value={r.shade} />
                <input type="hidden" name="size" value={r.size} />

                <div class="row tight">
                  <label class="sr-only">Quantity (t)</label>
                  <input
                    name="qty"
                    type="number"
                    min="0.001"
                    step="0.001"
                    required
                    value={Number(r.dispatchedQty ?? 0)}
                  />
                </div>

                <div class="row tight">
                  <label class="sr-only">Amount</label>
                  <input
                    name="amount"
                    type="number"
                    step="0.01"
                    placeholder="optional"
                  />
                </div>

                <div class="actions">
                  <button type="submit" class="btn">Receive</button>
                </div>
              </form>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}

<style>
  .subhead { margin-top: 4px; opacity: 0.9; }

  .table-wrap {
    overflow-x: auto;
    margin-top: var(--spaceSm, 10px);
  }

  .list-table {
    width: 100%;
    border-collapse: collapse;
    border-spacing: 0;
  }
  .list-table th,
  .list-table td {
    border-bottom: 1px solid var(--borderColor, #2b3a36);
    padding: 8px 10px;
    vertical-align: middle;
    white-space: nowrap;
  }
  .list-table th { text-align: left; opacity: 0.9; }
  .list-table .num { text-align: right; }
  .no-pad { padding: 0; }

  /* Inline form inside table row */
  .inline-form {
    display: grid;
    grid-auto-flow: column;
    gap: 8px;
    align-items: center;
    padding: 0 4px;
  }
  .row.tight {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0;
  }
  .row.tight input {
    width: 120px;
  }
  .sr-only {
    position: absolute;
    width: 1px; height: 1px; overflow: hidden;
    clip: rect(0 0 0 0); white-space: nowrap; border: 0; padding: 0; margin: -1px;
  }

  @media (max-width: 800px) {
    .inline-form { grid-auto-flow: row; align-items: stretch; gap: 6px; }
    .row.tight input { width: 100%; }
  }
</style>
