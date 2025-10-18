
<script>
    // Top-loop: renders one ReceiveRowForm per inbound transport row per lane
    // Assumes page has already loaded tokens.css/forms.css globally.
  
    import ReceiveRowForm from './ReceiveRowForm.svelte';
  
    export let lanes = []; // [{ fromMmaCode, toMmaCode }]
    export let rows  = []; // [{ transportId, supplierId, shade, size, qty, amount, ... }]
  
    // If rows carry lane markers we’ll match; otherwise we pass all rows (single-lane pages)
    const rowsForLane = (lane) =>
      rows.filter((r) =>
        (r?.fromMmaCode ? r.fromMmaCode === lane.fromMmaCode : true) &&
        (r?.toMmaCode   ? r.toMmaCode   === lane.toMmaCode   : true)
      );
  </script>
  
  <section class="receive-top">
    {#if !lanes || lanes.length === 0}
      <p class="muted">No receive lanes configured.</p>
    {:else}
      {#each lanes as lane (lane.fromMmaCode + '→' + lane.toMmaCode)}
        <h2 class="lane-title">{lane.fromMmaCode} → {lane.toMmaCode}</h2>
  
        {#if rowsForLane(lane).length === 0}
          <div class="empty">No in-transit rows for this lane.</div>
        {:else}
          <div class="forms">
            {#each rowsForLane(lane) as row (row.transportId)}
              <ReceiveRowForm {lane} {row} />
              <hr />
            {/each}
          </div>
        {/if}
      {/each}
    {/if}
  </section>
  
  <style>
    .receive-top { display: grid; gap: var(--spaceMd, 16px); }
    .lane-title  { margin: 0; font-size: 1.125rem; color: var(--primaryText, #e6ebf1); }
    .forms       { display: grid; gap: var(--spaceMd, 16px); }
    .empty       { padding: 12px; border: 1px dashed var(--borderColor, #22312c);
                   border-radius: var(--radius, 8px); color: var(--mutedText, #9fb2aa); }
    .muted       { color: var(--mutedText, #9fb2aa); }
  </style>
  