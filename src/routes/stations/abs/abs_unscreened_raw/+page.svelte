<script>
  export let data;
  const { stationCode, mmaCode, slots = [] } = data;

  // UNSCREENED_RAW -> (current flow) allow direct dispatch to SORTED lanes
  // (Matches your tested orchestration where UNSCREENED can be moved out.)
  const toPssSorted = (s) =>
    `/stations/abs/dispatch_pss_sorted?supplierId=${s.supplierId}&shade=${encodeURIComponent(s.shade)}&size=${encodeURIComponent(s.size)}`;

  const toKefSorted = (s) =>
    `/stations/abs/dispatch_kef_sorted?supplierId=${s.supplierId}&shade=${encodeURIComponent(s.shade)}&size=${encodeURIComponent(s.size)}`;
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
          <td style="white-space:nowrap">
            <a href={toPssSorted(s)}>Dispatch → PSS_SORTED</a>
            &nbsp;|&nbsp;
            <a href={toKefSorted(s)}>Dispatch → KEF_SORTED</a>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
{/if}
