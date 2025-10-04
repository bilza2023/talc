<script>
  export let data; // { mmaCode, slots }
  const { mmaCode, slots = [] } = data;
</script>

<h1>{mmaCode} — Slots</h1>

{#if slots.length === 0}
  <p>No stock on hand for {mmaCode}.</p>
{:else}
  <table>
    <thead>
      <tr>
        <th>Supplier</th>
        <th>Shade</th>
        <th>Size</th>
        <th style="text-align:right;">Qty (t)</th>
      </tr>
    </thead>
    <tbody>
      {#each slots as s}
        <tr>
          <td>{s.supplierId}</td>
          <td>{s.shade}</td>
          <td>{s.size}</td>
          <td style="text-align:right;">{s.qty}</td>
        </tr>
      {/each}
    </tbody>
  </table>
{/if}

<style>
  table { width: 100%; border-collapse: collapse; margin-top: 0.5rem; }
  th, td { padding: 0.5rem; border-bottom: 1px solid var(--border, #333); }
  th { text-align: left; }
</style>
