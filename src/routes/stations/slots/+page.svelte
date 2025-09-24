
<script>
  export let data;

  function actionHref(verb, slot) {
    const q = new URLSearchParams({
      station: data.stationCode,
      mma: data.mmaCode,
      supplierId: String(slot.supplierId),
      shade: slot.shade,
      size: slot.size
    });
    return `/actions/${verb}?${q.toString()}`;
  }

  // Optional "Purchase" shortcut for RAW (uses your per-station purchase route)
  $: purchaseHref = data.isRaw
    ? `/stations/${(data.stationCode || '').toLowerCase()}/purchase`
    : null;
</script>

<style>
  @import '$lib/styles/tokens.css';

  .wrap { padding: 16px; color: var(--primaryText); }
  h1 { font-size: 18px; margin: 0 0 8px; }
  .meta { color: var(--secondaryText); font-size: 13px; margin-bottom: 12px; }
  .toolbar { display:flex; gap:10px; align-items:center; margin: 8px 0 14px; }
  .btn {
    appearance: none; border: 1px solid var(--borderColor);
    background: var(--surfaceColor); color: var(--primaryText);
    border-radius: 10px; padding: 8px 12px; font-size: 14px; cursor: pointer;
  }
  .btn.primary { background: var(--primaryColor); border-color: var(--primaryColor); color: #fff; }
  table { width: 100%; border-collapse: collapse; }
  th, td { padding: 8px 10px; border-bottom: 1px solid var(--borderColor); font-size: 14px; }
  th { text-align: left; color: var(--secondaryText); font-weight: 600; }
  .muted { opacity: .5; }
  .error { color: #d24a4a; margin: 8px 0; }
</style>

<div class="wrap">
  <h1>Slots — {data.stationCode} / {data.mmaCode}</h1>

  {#if data.error}
    <p class="error">{data.error}</p>
  {:else}
    <div class="meta">
      On Hand: <strong>{data.onHand ?? '—'}</strong>
    </div>

    <div class="toolbar">
      <a class="btn" href={`/actions/receive?station=${data.stationCode}&mma=${data.mmaCode}`}>
        Receive (inbound list)
      </a>
      {#if purchaseHref}
        <a class="btn primary" href={purchaseHref}>Purchase Raw</a>
      {/if}
    </div>

    {#if data.slots.length}
      <table>
        <thead>
          <tr>
            <th>Supplier</th>
            <th>Shade</th>
            <th>Size</th>
            <th>Qty</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each data.slots as slot}
            <tr>
              <td title={slot.supplierName || ''}>{slot.supplierId}</td>
              <td>{slot.shade}</td>
              <td>{slot.size}</td>
              <td>{slot.qty}</td>
              <td>
                <!-- Deposit is generally only for RAW (adjust if you allow admin deposit elsewhere) -->
                {#if data.isRaw}
                  <a href={actionHref('deposit', slot)}>Deposit</a>
                  &nbsp;|&nbsp;
                {/if}

                {#if Number(slot.qty) > 0}
                  <a href={actionHref('dispatch', slot)}>Dispatch</a>
                {:else}
                  <span class="muted">Dispatch</span>
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {:else}
      <p>No active slots.</p>
    {/if}
  {/if}
</div>
