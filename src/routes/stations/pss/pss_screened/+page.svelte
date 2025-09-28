<script>
    export let data;
    const { stationCode, mmaCode, slots = [] } = data;
  
    // Dispatch from PSS_SCREENED → PSS_SORTED
    const toSorted = (s) =>
      `/stations/pss/dispatch_sorted?supplierId=${s.supplierId}&shade=${encodeURIComponent(s.shade)}&size=${encodeURIComponent(s.size)}`;
  </script>
  
  <h1>{stationCode} — Slots: {mmaCode}</h1>
  
  {#if slots.length === 0}
    <p>No on-hand slots.</p>
  {:else}
    <table>
      <thead>
        <tr><th>Supplier</th><th>Shade</th><th>Size</th><th>Qty (t)</th><th>Actions</th></tr>
      </thead>
      <tbody>
        {#each slots as s}
          <tr>
            <td>{s.supplierId}</td>
            <td>{s.shade}</td>
            <td>{s.size}</td>
            <td>{s.qty}</td>
            <td><a href={toSorted(s)}>Dispatch → PSS_SORTED</a></td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
  