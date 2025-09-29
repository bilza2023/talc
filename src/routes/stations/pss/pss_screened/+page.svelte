<script>
    export let data;
    const { stationCode, mmaCode, slots = [] } = data;
  
    // Dispatch from PSS_SCREENED → PSS_SORTED
    const toSort = (s) =>
    `/stations/pss/sort` +
    `?supplierId=${s.supplierId}` +
    `&shade=${encodeURIComponent(s.shade)}` +
    `&size=${encodeURIComponent(s.size)}` +
    (s.onHand != null ? `&qty=${s.onHand}` : ''); // or use s.qty if that’s your field
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
            <td><a class="btn" href={toSort(s)}>Sort</a></td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
  