<!-- /src/routes/dashboard/transportation/+page.svelte -->
<script>
  export let data;
  const { filters, page, rows, grouped } = data;

  const fmtTon = (v) => (Number(v || 0)).toLocaleString(undefined, { maximumFractionDigits: 3 });
  const fmtInt = (v) => (Number(v || 0)).toLocaleString();
  const fmtDate = (iso) => (iso ? new Date(iso).toLocaleString() : '—');

  function qs(next = {}) {
    const params = new URLSearchParams({
      limit: String(filters.limit),
      material: filters.material,
      status: filters.status,
      group: filters.group,
      ...(filters.before ? { before: filters.before } : {}),
      ...next
    });
    return `?${params.toString()}`;
  }

  const groupLabel = (g) => (g === 'from' ? 'From Station' : g === 'to' ? 'To Station' : '');
</script>

<div class="min-h-screen bg-[#0b1018] text-[#e6ebf1]">
  <div class="mx-auto max-w-7xl p-6 space-y-8">
    <header class="space-y-1">
      <h1 class="text-2xl font-semibold">Transportation — All Edges</h1>
      <p class="text-sm text-[#9fb0c5]">Newest first. Filter by material and status, group by station if needed.</p>
    </header>

    <!-- Controls: limit, material, status, grouping, pagination -->
    <section class="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div class="flex flex-wrap items-center gap-2 text-sm">
        <span class="text-[#9fb0c5]">Limit:</span>
        <a class="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20" href={qs({ limit: 20, before: '' })}>20</a>
        <a class="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20" href={qs({ limit: 50, before: '' })}>50</a>
        <a class="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20" href={qs({ limit: 100, before: '' })}>100</a>

        <span class="mx-3 h-5 w-px bg-white/10"></span>

        <span class="text-[#9fb0c5]">Material:</span>
        <a class="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20" href={qs({ material: 'all', before: '' })}>All</a>
        <a class="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20" href={qs({ material: 'ore', before: '' })}>Ore</a>
        <a class="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20" href={qs({ material: 'talc', before: '' })}>Talc</a>

        <span class="mx-3 h-5 w-px bg-white/10"></span>

        <span class="text-[#9fb0c5]">Status:</span>
        <a class="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20" href={qs({ status: 'all', before: '' })}>All</a>
        <a class="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20" href={qs({ status: 'in_transit', before: '' })}>In-Transit</a>
        <a class="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20" href={qs({ status: 'received', before: '' })}>Received</a>
        <a class="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20" href={qs({ status: 'cancelled', before: '' })}>Cancelled</a>

        <span class="mx-3 h-5 w-px bg-white/10"></span>

        <span class="text-[#9fb0c5]">Group by station:</span>
        <a class="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20" href={qs({ group: 'none' })}>None</a>
        <a class="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20" href={qs({ group: 'from' })}>From</a>
        <a class="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20" href={qs({ group: 'to' })}>To</a>

        <span class="mx-3 h-5 w-px bg-white/10"></span>

        <span class="text-[#9fb0c5]">Page:</span>
        <a class="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20" href={qs({ before: '' })}>Reset (latest)</a>
        {#if page?.hasMore && page?.nextBefore}
          <a class="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20" href={qs({ before: page.nextBefore })}>Next (older)</a>
        {/if}
      </div>
    </section>

    {#if filters.group !== 'none'}
      <!-- Grouped summary -->
      <section class="space-y-3">
        <h2 class="text-xl font-semibold">Grouped by {groupLabel(filters.group)}</h2>
        <div class="overflow-x-auto rounded-2xl border border-white/10">
          <table class="min-w-full bg-white/5 text-xs">
            <thead class="bg-white/10">
              <tr>
                <th class="px-3 py-2 text-left">{groupLabel(filters.group)}</th>
                <th class="px-3 py-2 text-right">Edges</th>
                <th class="px-3 py-2 text-right">Dispatch (t)</th>
                <th class="px-3 py-2 text-right">Receive (t)</th>
                <th class="px-3 py-2 text-right">Ore (dispatch t)</th>
                <th class="px-3 py-2 text-right">Talc (dispatch t)</th>
              </tr>
            </thead>
            <tbody>
              {#if !grouped || grouped.length === 0}
                <tr class="border-t border-white/10">
                  <td class="px-3 py-6 text-center text-[#9fb0c5]" colspan="6">No data</td>
                </tr>
              {:else}
                {#each grouped as r}
                  <tr class="border-t border-white/10">
                    <td class="px-3 py-2">{r.station || '—'}</td>
                    <td class="px-3 py-2 text-right">{fmtInt(r.edges)}</td>
                    <td class="px-3 py-2 text-right">{fmtTon(r.dispatchTon)}</td>
                    <td class="px-3 py-2 text-right">{fmtTon(r.receiveTon)}</td>
                    <td class="px-3 py-2 text-right">{fmtTon(r.byMaterial.ore)}</td>
                    <td class="px-3 py-2 text-right">{fmtTon(r.byMaterial.talc)}</td>
                  </tr>
                {/each}
              {/if}
            </tbody>
          </table>
        </div>
      </section>
    {:else}
      <!-- Raw edges -->
      <section class="space-y-3">
        <h2 class="text-xl font-semibold">Latest Edges</h2>
        <div class="overflow-x-auto rounded-2xl border border-white/10">
          <table class="min-w-full bg-white/5 text-xs">
            <thead class="bg-white/10">
              <tr>
                <th class="px-3 py-2 text-left">Material</th>
                <th class="px-3 py-2 text-left">ID</th>
                <th class="px-3 py-2 text-left">Truck</th>
                <th class="px-3 py-2 text-left">From</th>
                <th class="px-3 py-2 text-left">To</th>
                <th class="px-3 py-2 text-left">Status</th>
                <th class="px-3 py-2 text-left">Grade</th>
                <th class="px-3 py-2 text-right">Dispatch (t)</th>
                <th class="px-3 py-2 text-right">Receive (t)</th>
                <th class="px-3 py-2 text-left">Dispatched</th>
                <th class="px-3 py-2 text-left">Received</th>
              </tr>
            </thead>
            <tbody>
              {#if rows.length === 0}
                <tr class="border-t border-white/10">
                  <td class="px-3 py-6 text-center text-[#9fb0c5]" colspan="11">No edges</td>
                </tr>
              {:else}
                {#each rows as r}
                  <tr class="border-t border-white/10">
                    <td class="px-3 py-2 uppercase">{r.material}</td>
                    <td class="px-3 py-2">{r.id}</td>
                    <td class="px-3 py-2">{r.truckNo || '—'}</td>
                    <td class="px-3 py-2">{r.fromStation}</td>
                    <td class="px-3 py-2">{r.toStation}</td>
                    <td class="px-3 py-2">{r.status}</td>
                    <td class="px-3 py-2">{r.gradeCode}</td>
                    <td class="px-3 py-2 text-right">{fmtTon(r.dispatchWeight)}</td>
                    <td class="px-3 py-2 text-right">{fmtTon(r.receiveWeight)}</td>
                    <td class="px-3 py-2">{fmtDate(r.dispatchedAt)}</td>
                    <td class="px-3 py-2">{fmtDate(r.receivedAt)}</td>
                  </tr>
                {/each}
              {/if}
            </tbody>
          </table>
        </div>

        <!-- Pager -->
        <div class="flex justify-end gap-2 text-sm">
          <a class="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20" href={qs({ before: '' })}>Reset (latest)</a>
          {#if page?.hasMore && page?.nextBefore}
            <a class="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20" href={qs({ before: page.nextBefore })}>Next (older)</a>
          {/if}
        </div>
      </section>
    {/if}
  </div>
</div>
