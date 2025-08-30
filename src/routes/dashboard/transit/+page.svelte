
<script>
  import { page } from '$app/stores';
  export let data;

  const { days, since, filters, totals, summary, rows } = data;

  const fmtTon = (x) => (Math.round(Number(x || 0) * 10) / 10).toLocaleString();
  const fmtHrs = (x) => (Math.round(Number(x || 0) * 10) / 10).toLocaleString();
  const fmtDT  = (iso) => (iso ? new Date(iso).toLocaleString() : '—');

  // SSR-safe link builder using $page.url.searchParams
  function link(params) {
    const usp = new URLSearchParams($page.url.searchParams);
    for (const [k, v] of Object.entries(params)) {
      if (v == null || v === '') usp.delete(k);
      else usp.set(k, v);
    }
    return `?${usp.toString()}`;
  }
</script>

<div class="min-h-screen bg-[#0b1018] text-[#e6ebf1]">
  <div class="mx-auto max-w-6xl p-6 space-y-6">
    <header class="space-y-2">
      <h1 class="text-2xl font-semibold">In-Transit</h1>
      <p class="text-sm text-[#9fb0c5]">Window: last {days} days (since {new Date(since).toLocaleDateString()})</p>

      <!-- Filters -->
      <div class="flex flex-wrap gap-2 items-center">
        <div class="inline-flex gap-2">
          <a href={link({ days: 7 })}  class="rounded-md border border-white/10 px-3 py-1 text-sm hover:bg-white/5 {days===7  ? 'bg-white/10' : ''}">7d</a>
          <a href={link({ days: 30 })} class="rounded-md border border-white/10 px-3 py-1 text-sm hover:bg-white/5 {days===30 ? 'bg-white/10' : ''}">30d</a>
          <a href={link({ days: 90 })} class="rounded-md border border-white/10 px-3 py-1 text-sm hover:bg-white/5 {days===90 ? 'bg-white/10' : ''}">90d</a>
        </div>

        <form method="GET" class="ml-auto flex flex-wrap gap-2 items-center">
          <input name="from"  placeholder="From station" value={filters?.fromStation || ''} class="bg-transparent border border-white/10 rounded-md px-2 py-1 text-sm outline-none" />
          <input name="to"    placeholder="To station"   value={filters?.toStation   || ''} class="bg-transparent border border-white/10 rounded-md px-2 py-1 text-sm outline-none" />
          <input name="grade" placeholder="Grade"        value={filters?.grade       || ''} class="bg-transparent border border-white/10 rounded-md px-2 py-1 text-sm outline-none" />
          <input name="truck" placeholder="Truck"        value={filters?.truckNo     || ''} class="bg-transparent border border-white/10 rounded-md px-2 py-1 text-sm outline-none" />
          <input type="hidden" name="days" value={days} />
          <button class="rounded-md border border-white/10 px-3 py-1 text-sm hover:bg-white/5">Apply</button>
        </form>
      </div>
    </header>

    <!-- Head stats -->
    <section class="grid gap-4 sm:grid-cols-2">
      <div class="rounded-xl bg-white/5 p-4 border border-white/10">
        <div class="text-xs text-[#9fb0c5]">Shipments In-Transit</div>
        <div class="text-3xl font-semibold">{totals.shipments}</div>
      </div>
      <div class="rounded-xl bg-white/5 p-4 border border-white/10">
        <div class="text-xs text-[#9fb0c5]">Total Ton In-Transit</div>
        <div class="text-3xl font-semibold">{fmtTon(totals.totalTon)} t</div>
      </div>
    </section>

    <!-- Summary by destination -->
    <section class="space-y-2">
      <h2 class="text-lg font-semibold">By Destination</h2>
      <div class="overflow-x-auto rounded-xl border border-white/10 bg-white/5">
        <table class="min-w-full text-sm">
          <thead class="text-left text-[#9fb0c5]">
            <tr>
              <th class="px-3 py-2">To Station</th>
              <th class="px-3 py-2">Shipments</th>
              <th class="px-3 py-2">Total Ton</th>
              <th class="px-3 py-2">Avg Age (h)</th>
              <th class="px-3 py-2">Oldest (h)</th>
            </tr>
          </thead>
          <tbody>
            {#if summary.length === 0}
              <tr><td colspan="5" class="px-3 py-4 text-center text-[#9fb0c5]">No shipments in this window.</td></tr>
            {:else}
              {#each summary as s}
                <tr class="border-t border-white/10">
                  <td class="px-3 py-2">{s.toStation}</td>
                  <td class="px-3 py-2">{s.count}</td>
                  <td class="px-3 py-2">{fmtTon(s.totalTon)}</td>
                  <td class="px-3 py-2">{fmtHrs(s.avgAgeHrs)}</td>
                  <td class="px-3 py-2">{fmtHrs(s.oldestAgeHrs)}</td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>
    </section>

    <!-- Detailed table -->
    <section class="space-y-2">
      <h2 class="text-lg font-semibold">All In-Transit Shipments</h2>
      <div class="overflow-x-auto rounded-xl border border-white/10 bg-white/5">
        <table class="min-w-full text-sm">
          <thead class="text-left text-[#9fb0c5]">
            <tr>
              <th class="px-3 py-2">Material</th>
              <th class="px-3 py-2">Truck</th>
              <th class="px-3 py-2">Route</th>
              <th class="px-3 py-2">Grade</th>
              <th class="px-3 py-2">Ton</th>
              <th class="px-3 py-2">Dispatched At</th>
              <th class="px-3 py-2">Age (h)</th>
            </tr>
          </thead>
          <tbody>
            {#if rows.length === 0}
              <tr><td colspan="7" class="px-3 py-4 text-center text-[#9fb0c5]">No shipments in this window.</td></tr>
            {:else}
              {#each rows as r}
                <tr class="border-t border-white/10">
                  <td class="px-3 py-2 uppercase">{r.material}</td>
                  <td class="px-3 py-2">{r.truckNo}</td>
                  <td class="px-3 py-2">{r.fromStation} → {r.toStation}</td>
                  <td class="px-3 py-2">{r.sendGradeCode || '—'}</td>
                  <td class="px-3 py-2">{fmtTon(r.sendWeightTon)}</td>
                  <td class="px-3 py-2 whitespace-nowrap">{fmtDT(r.dispatchedAt?.toISOString?.() || null)}</td>
                  <td class="px-3 py-2">{fmtHrs(r.ageHrs)}</td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>
    </section>
  </div>
</div>
