<script>
  export let data;
  const { days, since, rows, totals } = data;

  const fmtTon = (x) => {
    const n = Number(x || 0);
    return (Math.round(n * 10) / 10).toLocaleString();
  };
  const fmtPct = (x) =>
    `${(Math.round((Number(x || 0)) * 10) / 10).toLocaleString()}%`;
  const fmtHrs = (x) =>
    `${(Math.round((Number(x || 0)) * 10) / 10).toLocaleString()}`;
  const fmtDateTime = (iso) =>
    iso ? new Date(iso).toLocaleString() : "—";
</script>

<div class="min-h-screen bg-[#0b1018] text-[#e6ebf1]">
  <div class="mx-auto max-w-6xl p-6 space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-semibold">Trucks / Transport</h1>
      <p class="text-sm text-[#9fb0c5]">Window: last {days} days (since {new Date(since).toLocaleDateString()})</p>
      <div class="mt-2 inline-flex gap-2">
        <a href="?days=7"  class="rounded-md border border-white/10 px-3 py-1 text-sm hover:bg-white/5 {days===7  ? 'bg-white/10' : ''}">7d</a>
        <a href="?days=30" class="rounded-md border border-white/10 px-3 py-1 text-sm hover:bg-white/5 {days===30 ? 'bg-white/10' : ''}">30d</a>
        <a href="?days=90" class="rounded-md border border-white/10 px-3 py-1 text-sm hover:bg-white/5 {days===90 ? 'bg-white/10' : ''}">90d</a>
      </div>
    </header>

    <!-- Head stats -->
    <section class="grid gap-4 sm:grid-cols-4">
      <div class="rounded-xl bg-white/5 p-4 border border-white/10">
        <div class="text-xs text-[#9fb0c5]">Unique Trucks</div>
        <div class="text-3xl font-semibold">{totals.trucks}</div>
      </div>
      <div class="rounded-xl bg-white/5 p-4 border border-white/10">
        <div class="text-xs text-[#9fb0c5]">Trips</div>
        <div class="text-3xl font-semibold">{totals.trips}</div>
      </div>
      <div class="rounded-xl bg-white/5 p-4 border border-white/10">
        <div class="text-xs text-[#9fb0c5]">Total Sent</div>
        <div class="text-3xl font-semibold">{fmtTon(totals.sendTon)} t</div>
      </div>
      <div class="rounded-xl bg-white/5 p-4 border border-white/10">
        <div class="text-xs text-[#9fb0c5]">Total Received</div>
        <div class="text-3xl font-semibold">{fmtTon(totals.recvTon)} t</div>
      </div>
    </section>

    <!-- Table -->
    <div class="overflow-x-auto rounded-xl border border-white/10 bg-white/5">
      <table class="min-w-full text-sm">
        <thead class="text-left text-[#9fb0c5]">
          <tr>
            <th class="px-3 py-2">Truck</th>
            <th class="px-3 py-2">Trips</th>
            <th class="px-3 py-2">Ore Trips</th>
            <th class="px-3 py-2">Talc Trips</th>
            <th class="px-3 py-2">Sent (t)</th>
            <th class="px-3 py-2">Received (t)</th>
            <th class="px-3 py-2">Loss %</th>
            <th class="px-3 py-2">Avg Turnaround (h)</th>
            <th class="px-3 py-2">Last Trip</th>
          </tr>
        </thead>
        <tbody>
          {#if rows.length === 0}
            <tr><td colspan="9" class="px-3 py-4 text-center text-[#9fb0c5]">No data in this window.</td></tr>
          {:else}
            {#each rows as r}
              <tr class="border-t border-white/10">
                <td class="px-3 py-2 font-medium">{r.truckNo}</td>
                <td class="px-3 py-2">{r.tripsCount}</td>
                <td class="px-3 py-2">{r.oreTrips}</td>
                <td class="px-3 py-2">{r.talcTrips}</td>
                <td class="px-3 py-2">{fmtTon(r.totalSendTon)}</td>
                <td class="px-3 py-2">{fmtTon(r.totalReceiveTon)}</td>
                <td class="px-3 py-2">{fmtPct(r.lossPct)}</td>
                <td class="px-3 py-2">{fmtHrs(r.avgTurnaroundHrs)}</td>
                <td class="px-3 py-2 whitespace-nowrap">{fmtDateTime(r.lastTripAt)}</td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
  </div>
</div>
