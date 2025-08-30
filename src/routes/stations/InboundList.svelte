<script>
    // Props
    export let rows = [];                          // [{ id, material, truckNo, fromStation, gradeCode, weightTon, dispatchedAt?, unloadUrl }]
    export let title = 'Inbound (Awaiting Unload)';
    export let stationCode = '';
    export let emptyText = 'No inbound trucks currently en route.';
    export let actionLabel = 'Unload';             // fallback text
    export let showDispatchedAt = true;
    export let compact = false;
  
    const hasRows = Array.isArray(rows) && rows.length > 0;
    const headerColsClass = showDispatchedAt ? 'grid-cols-7' : 'grid-cols-6';
    const padY = compact ? 'py-2' : 'py-3';
  
    const fmtDate = (d) => {
      if (!d) return '—';
      const dt = new Date(d);
      return isNaN(dt.getTime()) ? '—' : dt.toLocaleString();
    };
  
    const iconForMaterial = (m) => (m === 'ore' ? '🪨' : '🧼');
  </script>
  
  <div class="space-y-3 border-2 border-gray-200 rounded-xl  p-2 m-2">
    <h2 class="text-xl">{title}</h2>
  
    {#if hasRows}
      <div class="overflow-hidden rounded-xl border border-[#1c2433]">
        <!-- Header -->
        <div class={`grid ${headerColsClass} gap-2 px-4 ${padY} bg-[#0f1521] text-sm text-[#9fb0c5]`}>
          <div>🚚 Truck</div>
          <div>Material</div>
          <div>From</div>
          <div>🏷️ Grade</div>
          <div>⚖️ Weight</div>
          {#if showDispatchedAt}<div>⏰ Dispatched</div>{/if}
          <div>Action</div>
        </div>
  
        <!-- Rows -->
        {#each rows as row}
          <div class={`grid ${headerColsClass} gap-2 px-4 ${padY} border-t border-[#1c2433] items-center`}>
            <div class="truncate">{row.truckNo}</div>
            <div class="uppercase flex items-center gap-1">
              <span>{iconForMaterial(row.material)}</span>
              <span>{row.material}</span>
            </div>
            <div>{row.fromStation}</div>
            <div class="font-mono text-sm">{row.gradeCode}</div>
            <div>{row.weightTon}</div>
            {#if showDispatchedAt}<div>{fmtDate(row.dispatchedAt)}</div>{/if}
            <div>
              <a href={row.unloadUrl} class="text-[#7cc4ff] hover:underline flex items-center gap-1">
                🏗️ {actionLabel}
              </a>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="text-[#9fb0c5]">
        {#if stationCode}
          No inbound trucks currently en route to {stationCode}.
        {:else}
          {emptyText}
        {/if}
      </div>
    {/if}
  </div>
  