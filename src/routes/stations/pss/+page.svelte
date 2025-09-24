
<script>
    export let data;
  </script>
  
  <h1>Station: {data.stationCode}</h1>
  
  {#if data.mmas && data.mmas.length}
    {#each data.mmas as mma}
      <section>
        <h2>MMA: {mma.mmaCode} (stock: {mma.stockKey})</h2>
        <p><strong>On Hand:</strong> {mma.onHand}</p>
  
        <h3>Slots</h3>
        {#if mma.slots.length}
          <ul>
            {#each mma.slots as slot}
              <li>
                Supplier {slot.supplierId} — {slot.shade} {slot.size} : {slot.qty}
              </li>
            {/each}
          </ul>
        {:else}
          <p>No slots available.</p>
        {/if}
  
        <h3>Inbound</h3>
        {#if mma.inbound.length}
          <ul>
            {#each mma.inbound as row}
              <li>Inbound transport {row.transportId}, qty {row.qty}</li>
            {/each}
          </ul>
        {:else}
          <p>No inbound transports.</p>
        {/if}
  
        <h3>Outbound</h3>
        {#if mma.outbound.length}
          <ul>
            {#each mma.outbound as row}
              <li>Outbound transport {row.transportId}, qty {row.qty}</li>
            {/each}
          </ul>
        {:else}
          <p>No outbound transports.</p>
        {/if}
      </section>
    {/each}
  {:else}
    <p>No MMAs configured for this station.</p>
  {/if}
  