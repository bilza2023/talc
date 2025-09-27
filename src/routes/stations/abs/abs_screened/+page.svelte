<script>
  export let data;
  const { mmaCode, slots } = data;

  // Build confirm-form URLs for this processed MMA
  const toPss = (s) =>
    `/stations/abs/dispatch_pss_screened?supplierId=${s.supplierId}` +
    `&shade=${encodeURIComponent(s.shade)}` +
    `&size=${encodeURIComponent(s.size)}` +
    `&qty=${s.qty}`;

  const toKef = (s) =>
    `/stations/abs/dispatch_kef_sorted?supplierId=${s.supplierId}` +
    `&shade=${encodeURIComponent(s.shade)}` +
    `&size=${encodeURIComponent(s.size)}` +
    `&qty=${s.qty}`;
</script>


<h1>{mmaCode} — Slots</h1>

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
      {#each slots as s}
        <tr>
          <td>{s.supplierId}</td>
          <td>{s.shade}</td>
          <td>{s.size}</td>
          <td>{s.qty}</td>
          <td class="actions">
            <a class="btn" href={toPss(s)}>→ PSS_SCREENED</a>
            <a class="btn" href={toKef(s)}>→ KEF_SORTED</a>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
{/if}

<style>
  h1 { margin: 0 0 1rem 0; }
  table { width: 100%; border-collapse: collapse; }
  th, td { padding: .5rem .6rem; border-bottom: 1px solid #3a3a3a; text-align: left; }
  thead th { border-bottom-color: #555; font-weight: 600; }
  .actions { display: flex; gap: .5rem; }
  .btn {
    padding: .4rem .7rem;
    border: 1px solid #444;
    border-radius: .45rem;
    text-decoration: none;
    background: var(--surface-3, #272727);
  }
  .btn:hover { filter: brightness(1.1); }
</style>
