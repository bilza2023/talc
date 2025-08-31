<script>
  export let data;

  const { totals, stationSummary, gradeTotals, gradeMatrix, inTransit } = data;

  function fmtTon(v) {
    return (Number(v || 0)).toLocaleString(undefined, { maximumFractionDigits: 3 });
  }
  function fmtDate(iso) {
    return iso ? new Date(iso).toLocaleString() : '—';
  }
</script>

<div class="min-h-screen bg-[#0b1018] text-[#e6ebf1]">
  <div class="mx-auto max-w-7xl p-6 space-y-8">
    <!-- Header -->
    <header class="space-y-1">
      <h1 class="text-2xl font-semibold">Talc — Dashboard</h1>
      <p class="text-sm text-[#9fb0c5]">As of: <span class="font-medium">{fmtDate(totals.asOf)}</span></p>
    </header>

    <!-- KPI Banner -->
    <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div class="text-sm text-[#9fb0c5]">Stations</div>
        <div class="mt-1 text-2xl font-semibold">{totals.stations}</div>
      </div>
      <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div class="text-sm text-[#9fb0c5]">Total Stock (t)</div>
        <div class="mt-1 text-2xl font-semibold">{fmtTon(totals.totalStock)}</div>
      </div>
      <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div class="text-sm text-[#9fb0c5]">In-Transit (t)</div>
        <div class="mt-1 text-2xl font-semibold">{fmtTon(totals.inTransitTon)}</div>
      </div>
      <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div class="text-sm text-[#9fb0c5]">In-Transit Shipments (count)</div>
        <div class="mt-1 text-2xl font-semibold">{totals.inTransitCount}</div>
      </div>
    </section>

    <!-- Station Cards -->
    <section class="space-y-3">
      <h2 class="text-xl font-semibold">Stations</h2>

      {#if stationSummary.length === 0}
        <div class="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-[#9fb0c5]">
          No stations with talc activity yet.
        </div>
      {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {#each stationSummary as s}
            <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div class="flex items-center justify-between">
                <div class="text-lg font-semibold">{s.stationCode}</div>
                <div class="text-xs text-[#9fb0c5]">Last: {fmtDate(s.lastActivity)}</div>
              </div>
              <div class="mt-3 grid grid-cols-3 gap-2 text-sm">
                <div class="rounded-lg bg-white/5 p-3">
                  <div class="text-[#9fb0c5]">Stock (t)</div>
                  <div class="font-semibold">{fmtTon(s.stock)}</div>
                </div>
                <div class="rounded-lg bg-white/5 p-3">
                  <div class="text-[#9fb0c5]">Inbound (t)</div>
                  <div class="font-semibold">{fmtTon(s.inbound)}</div>
                </div>
                <div class="rounded-lg bg-white/5 p-3">
                  <div class="text-[#9fb0c5]">Outbound (t)</div>
                  <div class="font-semibold">{fmtTon(s.outbound)}</div>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </section>

    <!-- Grade Totals -->
    <section class="space-y-3">
      <h2 class="text-xl font-semibold">Grade Totals (Live Stock)</h2>
      <div class="overflow-x-auto rounded-2xl border border-white/10">
        <table class="min-w-full bg-white/5 text-sm">
          <thead class="bg-white/10">
            <tr>
              <th class="px-4 py-2 text-left">Grade</th>
              <th class="px-4 py-2 text-right">Stock (t)</th>
            </tr>
          </thead>
          <tbody>
            {#if gradeTotals.length === 0}
              <tr class="border-t border-white/10">
                <td class="px-4 py-6 text-center text-[#9fb0c5]" colspan="2">No talc stock yet</td>
              </tr>
            {:else}
              {#each gradeTotals as g}
                <tr class="border-t border-white/10">
                  <td class="px-4 py-2">{g.gradeCode}</td>
                  <td class="px-4 py-2 text-right">{fmtTon(g.stock)}</td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>
    </section>

    <!-- Station × Grade Matrix -->
    <section class="space-y-3">
      <h2 class="text-xl font-semibold">Station × Grade Matrix (Live Stock)</h2>
      <div class="overflow-x-auto rounded-2xl border border-white/10">
        <table class="min-w-full bg-white/5 text-xs">
          <thead class="bg-white/10">
            <tr>
              <th class="px-3 py-2 text-left">Station</th>
              {#each gradeMatrix.grades as gc}
                <th class="px-3 py-2 text-right">{gc}</th>
              {/each}
              <th class="px-3 py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {#if gradeMatrix.rows.length === 0}
              <tr class="border-t border-white/10">
                <td class="px-3 py-6 text-center text-[#9fb0c5]" colspan={(gradeMatrix.grades?.length || 0) + 2}>
                  No station × grade data yet
                </td>
              </tr>
            {:else}
              {#each gradeMatrix.rows as r}
                <tr class="border-t border-white/10">
                  <td class="px-3 py-2 font-medium">{r.stationCode}</td>
                  {#each gradeMatrix.grades as gc}
                    <td class="px-3 py-2 text-right">{fmtTon(r.byGrade[gc] || 0)}</td>
                  {/each}
                  <td class="px-3 py-2 text-right font-semibold">{fmtTon(r.totalStock)}</td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>
    </section>

    <!-- In-Transit Table -->
    <section class="space-y-3">
      <h2 class="text-xl font-semibold">Shipments In-Transit</h2>
      <div class="overflow-x-auto rounded-2xl border border-white/10">
        <table class="min-w-full bg-white/5 text-xs">
          <thead class="bg-white/10">
            <tr>
              <th class="px-3 py-2 text-left">ID</th>
              <th class="px-3 py-2 text-left">Truck</th>
              <th class="px-3 py-2 text-left">From</th>
              <th class="px-3 py-2 text-left">To</th>
              <th class="px-3 py-2 text-right">Weight (t)</th>
              <th class="px-3 py-2 text-left">Grade</th>
              <th class="px-3 py-2 text-left">Dispatched</th>
            </tr>
          </thead>
          <tbody>
            {#if inTransit.length === 0}
              <tr class="border-t border-white/10">
                <td class="px-3 py-6 text-center text-[#9fb0c5]" colspan="7">No shipments in transit</td>
              </tr>
            {:else}
              {#each inTransit as t}
                <tr class="border-t border-white/10">
                  <td class="px-3 py-2">{t.id}</td>
                  <td class="px-3 py-2">{t.truckNo || '—'}</td>
                  <td class="px-3 py-2">{t.fromStation}</td>
                  <td class="px-3 py-2">{t.toStation}</td>
                  <td class="px-3 py-2 text-right">{fmtTon(t.dispatchWeight)}</td>
                  <td class="px-3 py-2">{t.dispatchGrade}</td>
                  <td class="px-3 py-2">{fmtDate(t.dispatchedAt)}</td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>
    </section>
  </div>
</div>
