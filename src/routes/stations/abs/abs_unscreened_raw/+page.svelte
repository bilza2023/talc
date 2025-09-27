<script>
  export let data;
  const { slots } = data;

  // Hard-coded dispatch endpoints for this MMA config:
  const ACTION_PSS = "/stations/abs/dispatch_pss_screened";
  const ACTION_KEF = "/stations/abs/dispatch_kef_screened";
</script>

<h1>ABS_UNSCREENED_RAW — Slots</h1>

{#if !slots || slots.length === 0}
  <p>No stock yet.</p>
{:else}
  <table>
    <thead>
      <tr>
        <th>Supplier</th>
        <th>Shade</th>
        <th>Size</th>
        <th>Qty (t)</th>
        <th>Dispatch</th>
      </tr>
    </thead>
    <tbody>
      {#each slots as slot}
        <tr>
          <td>{slot.supplierId}</td>
          <td>{slot.shade}</td>
          <td>{slot.size}</td>
          <td>{slot.qty}</td>
          <td>
            <div class="dispatch-row">
              <!-- ABS → PSS (screened) -->
              <form method="POST" action={ACTION_PSS} class="dispatch-form" autocomplete="off">
                <input type="hidden" name="fromMmaCode" value="ABS_UNSCREENED_RAW" />
                <input type="hidden" name="supplierId" value={slot.supplierId} />
                <input type="hidden" name="shade" value={slot.shade} />
                <input type="hidden" name="size" value={slot.size} />
                <input type="hidden" name="qty" value={slot.qty} />
                <button type="submit" class="dispatch-btn">Dispatch → PSS_SCREENED</button>
              </form>

              <!-- ABS → KEF (screened) -->
              <form method="POST" action={ACTION_KEF} class="dispatch-form" autocomplete="off">
                <input type="hidden" name="fromMmaCode" value="ABS_UNSCREENED_RAW" />
                <input type="hidden" name="supplierId" value={slot.supplierId} />
                <input type="hidden" name="shade" value={slot.shade} />
                <input type="hidden" name="size" value={slot.size} />
                <input type="hidden" name="qty" value={slot.qty} />
                <button type="submit" class="dispatch-btn">Dispatch → KEF_SCREENED</button>
              </form>
            </div>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
{/if}

<style>
  table { width: 100%; border-collapse: collapse; }
  th, td { padding: .5rem .6rem; border-bottom: 1px solid #3a3a3a; text-align: left; }
  thead th { border-bottom-color: #555; font-weight: 600; }
  .dispatch-row { display: flex; gap: .5rem; flex-wrap: wrap; }
  .dispatch-form {
    display: inline-flex; gap: .5rem; align-items: center;
    padding: .35rem .5rem; border: 1px solid #333; border-radius: .5rem;
    background: var(--surface-2, #1d1d1d);
  }
  .dispatch-btn {
    padding: .45rem .65rem; border: 1px solid #444; border-radius: .45rem;
    background: var(--surface-3, #272727); cursor: pointer;
  }
  .dispatch-btn:hover { filter: brightness(1.1); }
</style>
