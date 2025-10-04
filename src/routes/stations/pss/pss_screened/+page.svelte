<script>
  export let data;
  const { mmaCode, slots = [] } = data;

  const toSort = (s) =>
    `/stations/pss/sort?supplierId=${s.supplierId}&shade=${encodeURIComponent(
      s.shade
    )}&size=${encodeURIComponent(s.size)}&qty=${s.qty}`;
</script>

<h1>{mmaCode} — Slots</h1>

{#if slots.length === 0}
  <p>No stock available.</p>
{:else}
  <table class="slots">
    <thead>
      <tr>
        <th>Supplier ID</th>
        <th>Shade</th>
        <th>Size</th>
        <th>Qty (t)</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
      {#each slots as s}
        <tr>
          <td>{s.supplierId}</td>
          <td>{s.shade}</td>
          <td>{s.size}</td>
          <td>{s.qty}</td>
          <td>
            <!-- Sorting: SCREENED → SORTED within PSS -->
            <a class="btn" href={toSort(s)}>Sort → PSS_SORTED</a>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
{/if}

<style>
  h1 { margin: 0 0 1rem; font-size: 1.25rem; }
  table.slots { border-collapse: collapse; width: 100%; }
  th, td { padding: .5rem .6rem; border-bottom: 1px solid var(--border, #333); text-align: left; }
  th { font-weight: 700; }
  .btn {
    display: inline-block;
    padding: .35rem .6rem;
    border: 1px solid var(--border, #333);
    border-radius: .4rem;
    text-decoration: none;
    font-weight: 600;
  }
  .btn:hover { outline: 1px solid currentColor; }
</style>
