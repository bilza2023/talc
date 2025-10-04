<script>
  export let data; // { mmaCode, positiveOnly, slots }

  function params(r) {
    const p = new URLSearchParams({
      supplierId: String(r.supplierId),
      shade: r.shade,
      size: r.size,
      qty: String(r.qty) // prefill, can be edited on dispatch page
    });
    return p.toString();
  }
</script>

<h1 class="page-title">ABS — Slots (Screened / {data.mmaCode})</h1>

{#if !data.slots.length}
  <div class="notice">No slots found.</div>
{:else}
  <div class="card">
    <table class="table">
      <thead>
        <tr>
          <th>Supplier</th>
          <th>Shade</th>
          <th>Size</th>
          <th style="text-align:right;">Qty (t)</th>
          <th style="width:220px;">Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each data.slots as r}
          <tr>
            <td>{r.supplierName ?? r.supplierId}</td>
            <td>{r.shade}</td>
            <td>{r.size}</td>
            <td style="text-align:right;">{r.qty}</td>
            <td>
              <a class="btn small"
                 href={`/stations/abs/dispatch_pss_screened?${params(r)}`}>
                Dispatch → PSS
              </a>
              <a class="btn small"
                 href={`/stations/abs/dispatch_kef_screened?${params(r)}`}
                 style="margin-left:.5rem;">
                Dispatch → KEF
              </a>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}

<style>
  .page-title { margin-bottom: .75rem; }
  .card { padding: 1rem; }
  .table { width: 100%; border-collapse: collapse; }
  .table th, .table td { padding: .5rem; border-bottom: 1px solid #e5e5e5; }
  .btn.small { padding: .35rem .6rem; font-size: .9rem; }
  .notice { padding: .75rem 1rem; border: 1px solid #eee; border-radius: .5rem; }
</style>
