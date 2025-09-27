<!-- /src/routes/stations/pss/receive_screened/+page.svelte -->
<script>
  export let data; // { stationCode, lane, rows }
  export let form;

  const { stationCode, lane, rows = [] } = data;
  const justId = form?.received?.transportId;
  const fmt = (ts) => new Date(ts).toLocaleString();
</script>

<header class="page-h">
  <h1 class="page-title">{stationCode} — Receive (ABS → PSS_SCREENED)</h1>
  <p class="page-sub">Lane: <strong>{lane}</strong></p>
</header>

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
  <p class="muted">No inbound dispatches from ABS for <strong>PSS_SCREENED</strong>.</p>
{:else}
  <div class="stack">
    {#each rows as r}
      <section class="card {justId === r.transportId ? 'is-received' : ''}">
        <header class="card-h">
          <div class="title">
            <strong>Dispatch</strong> <code>{r.transportId}</code>
          </div>
          <div class="meta">
            <span>{fmt(r.createdAt)}</span>
            <span>Supplier #{r.supplierId}</span>
            <span>{r.shade} / {r.size}</span>
            <span>Dispatched: {r.dispatchedQty}t</span>
          </div>
        </header>

        <form method="POST" action="?/receiveOne" class="form compact" autocomplete="off">
          <input type="hidden" name="transportId" value={r.transportId} />
          <input type="hidden" name="supplierId" value={r.supplierId} />

          <div class="row">
            <label class="req" for={`qty-${r.transportId}`}>Incoming Qty (t)</label>
            <div>
              <input
                id={`qty-${r.transportId}`}
                name="qty"
                type="number"
                step="0.001"
                min="0.001"
                required
                value={r.dispatchedQty}
              />
              <div class="hint">Defaulted to dispatched; edit if needed</div>
            </div>
          </div>

          <div class="row">
            <label for={`amount-${r.transportId}`}>Amount</label>
            <input
              id={`amount-${r.transportId}`}
              name="amount"
              type="number"
              step="1"
              inputmode="numeric"
              placeholder="Optional"
            />
          </div>

          <div class="actions">
            {#if justId === r.transportId}
              <button type="button" class="secondary" disabled>Received</button>
            {:else}
              <input type="submit" class="primary" value="Receive" />
            {/if}
          </div>
        </form>
      </section>
    {/each}
  </div>
{/if}

<style>
  /* tiny, page-local polish for headings only (scoped, won't leak) */
  .page-h { margin: 0 0 12px; }
  .page-title { margin: 0 0 4px; font-size: clamp(1.05rem, 2.2vw, 1.35rem); }
  .page-sub { margin: 0; opacity: .8; font-size: .95rem; }

  /* keep meta line subtle; relies on your global tokens */
  .card-h .title { font-weight: 600; }
  .card-h .meta { opacity: .85; font-size: .9rem; display: flex; flex-wrap: wrap; gap: 10px; }
  .card-h .meta span::after { content: "•"; margin: 0 6px; opacity: .5; }
  .card-h .meta span:last-child::after { content: ""; }

  .muted { opacity: .75; }
</style>
