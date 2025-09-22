<script>
    export let data;
    const { mmaCode, supplierId, slots } = data;
  </script>
  
  <h1 class="page-title">Slots · {mmaCode} · Supplier #{supplierId}</h1>
  <p class="subtle">
    Showing active slots (shade × size) with on-hand &gt; 0 for this supplier at {mmaCode}.
    On-hand updates immediately after a dispatch (deducted at dispatch time).
  </p>
  
  {#if !slots || slots.length === 0}
    <div class="empty">No active slots found for this supplier.</div>
  {:else}
    <table class="slots">
      <thead>
        <tr>
          <th>Shade</th>
          <th>Size</th>
          <th class="num">On-hand</th>
        </tr>
      </thead>
      <tbody>
        {#each slots as s}
          <tr>
            <td>{s.shade}</td>
            <td>{s.size}</td>
            <td class="num">{s.qty}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
  
  <style>
    .page-title { margin: 0 0 .25rem; font-size: 1.25rem; }
    .subtle { margin: 0 0 1rem; opacity: 0.75; font-size: .95rem; }
    .empty { padding: 1rem; border: 1px dashed currentColor; opacity: 0.7; border-radius: .5rem; }
  
    .slots { width: 100%; border-collapse: collapse; }
    .slots thead th { text-align: left; padding: .5rem .6rem; font-weight: 600; border-bottom: 1px solid currentColor; opacity: .8; }
    .slots td { padding: .55rem .6rem; border-bottom: 1px dashed rgba(127,127,127,.35); }
    .slots .num { text-align: right; font-variant-numeric: tabular-nums; }
  
    /* Mobile-first: table looks fine on narrow screens; rows are compact. */
  </style>
  