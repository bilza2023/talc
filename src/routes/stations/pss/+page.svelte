<script>
  export let data;
  import StationStockCard from "../StationStockCard.svelte";
  const { stationCode, ore, talc, inbound } = data || {};
</script>

<div class="min-h-screen bg-[#0b1018] text-[#e6ebf1]">
  <div class="mx-auto max-w-6xl p-6 space-y-8">
    <header class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold">Station: {stationCode}</h1>
    </header>

    <StationStockCard
    title="Talc — Live Stock"
    stationCode={data.stationCode}
    deposits={talc.deposits}
    received={talc.received}
    inTransit={talc.inTransit}
    stock={talc.stock}
    unit="t"
    accent="#06b6d4"  
  />

    <!-- Quick Actions -->
    <section>
      <h2 class="text-xl mb-3">Actions</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <a
          href={ore.depositUrl}
          class="rounded-xl p-4 bg-[#111826] hover:bg-[#142136] transition shadow-md"
          >Deposit Ore</a
        >
        <a
          href={talc.depositUrl}
          class="rounded-xl p-4 bg-[#111826] hover:bg-[#142136] transition shadow-md"
          >Deposit Talc</a
        >
        <a
          href={ore.dispatchUrl}
          class="rounded-xl p-4 bg-[#111826] hover:bg-[#142136] transition shadow-md"
          >Dispatch Ore</a
        >
        <a
          href={talc.dispatchUrl}
          class="rounded-xl p-4 bg-[#111826] hover:bg-[#142136] transition shadow-md"
          >Dispatch Talc</a
        >
      </div>
    </section>

    <!-- Inbound (in_transit → Unload required) -->
    <section class="space-y-3">
      <h2 class="text-xl">Inbound (Awaiting Unload)</h2>

      {#if inbound && inbound.length}
        <div class="overflow-hidden rounded-xl border border-[#1c2433]">
          <div
            class="grid grid-cols-7 gap-2 px-4 py-3 bg-[#0f1521] text-sm text-[#9fb0c5]"
          >
            <div>Truck</div>
            <div>Material</div>
            <div>From</div>
            <div>Grade</div>
            <div>Weight (t)</div>
            <div>Dispatched</div>
            <div>Action</div>
          </div>

          {#each inbound as row}
            <div
              class="grid grid-cols-7 gap-2 px-4 py-3 border-t border-[#1c2433] items-center"
            >
              <div class="truncate">{row.truckNo}</div>
              <div class="uppercase">{row.material}</div>
              <div>{row.fromStation}</div>
              <div class="font-mono text-sm">{row.gradeCode}</div>
              <div>{row.weightTon}</div>
              <div>{new Date(row.dispatchedAt).toLocaleString()}</div>
              <div>
                <a href={row.unloadUrl} class="text-[#7cc4ff] hover:underline"
                  >Unload</a
                >
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <div class="text-[#9fb0c5]">
          No inbound trucks currently en route to {stationCode}.
        </div>
      {/if}
    </section>
  </div>
</div>
