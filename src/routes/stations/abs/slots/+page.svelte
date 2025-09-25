<script>
    export let data;
  </script>
  
  <h1>ABS — Slots</h1>
  
  {#each data.sections as sec}
    <h2>{sec.mmaCode}</h2>
    {#if sec.rows.length === 0}
      <p>No stock available.</p>
    {:else}
      <table>
        <thead>
          <tr><th>Supplier</th><th>Shade</th><th>Size</th><th>On-hand (t)</th><th>Process</th><th>Dispatch</th></tr>
        </thead>
        <tbody>
          {#each sec.rows as r}
            <tr>
              <td>{r.supplierId}</td>
              <td>{r.shade}</td>
              <td>{r.size}</td>
              <td>{r.qty}</td>
              <td>
                {#each r.processLinks as link}
                  <a href={link.href}>{link.label}</a>{' '}
                {/each}
              </td>
              <td>
                {#each r.dispatchLinks as link}
                  <a href={link.href}>{link.label}</a>{' '}
                {/each}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  {/each}
  