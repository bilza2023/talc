<!-- src/lib/components/InboundList.svelte -->
<script>
  // Props:
  // - items: array from getStationDashboard().inbound
  //    { id, material: 'ore'|'talc', fromStation, toStation, gradeCode, weightTon, truckNo, dispatchedAt, receiveUrl }
  // - stationCode: current station (for fallback URLs)
  // - title: optional section title
  export let items = [];
  export let stationCode = '';
  export let title = 'Incoming (in transit)';

  // Simple filter (All | Ore | Talc)
  let filter = 'ALL'; // 'ALL' | 'ORE' | 'TALC'
  let q = '';         // quick search on truck/grade

  const fmtTon = (n) => (n == null ? '-' : Number(n).toFixed(3) + 't');
  const dt = (s) => (s ? new Date(s).toLocaleString() : '—');
  const badge = (m) => (m === 'ore' ? 'bg-sky-500/15 text-sky-300 ring-sky-600/30' : 'bg-emerald-400/15 text-emerald-300 ring-emerald-500/30');

  function fallbackReceiveUrl(row) {
    const base = row.material === 'talc' ? '/talc/receive' : '/ore/receive';
    const params = new URLSearchParams();
    if (row?.id != null) params.set('edge', String(row.id));
    if (stationCode) params.set('station', stationCode);
    return `${base}?${params.toString()}`;
  }

  $: rows = (items ?? [])
    .slice()
    .sort((a, b) => new Date(b.dispatchedAt || 0) - new Date(a.dispatchedAt || 0))
    .filter((r) => (filter === 'ALL' ? true : r.material?.toUpperCase() === filter))
    .filter((r) => {
      const needle = q.trim().toUpperCase();
      if (!needle) return true;
      return (
        (r.truckNo || '').toUpperCase().includes(needle) ||
        (r.gradeCode || '').toUpperCase().includes(needle) ||
        (r.fromStation || '').toUpperCase().includes(needle)
      );
    });
</script>

<section class="rounded-2xl bg-[#101721] ring-1 ring-[#0f1724] p-5">
  <header class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h2 class="text-lg font-medium">{title}</h2>
      <p class="text-xs text-[#a9b3c2]">Edges destined to this station (status: <span class="font-mono">in_transit</span>)</p>
    </div>

    <div class="flex items-center gap-2">
      <div class="flex rounded-xl bg-[#0f1621] ring-1 ring-[#0f1724] overflow-hidden">
        <button
          class="px-3 py-1.5 text-xs hover:bg-white/5"
          class:selected={filter === 'ALL'}
          on:click={() => (filter = 'ALL')}
        >
          All
        </button>
        <button
          class="px-3 py-1.5 text-xs hover:bg-white/5"
          class:selected={filter === 'ORE'}
          on:click={() => (filter = 'ORE')}
        >
          Ore
        </button>
        <button
          class="px-3 py-1.5 text-xs hover:bg-white/5"
          class:selected={filter === 'TALC'}
          on:click={() => (filter = 'TALC')}
        >
          Talc
        </button>
      </div>

      <input
        placeholder="Search truck/grade/from…"
        bind:value={q}
        class="rounded-xl bg-[#0f1621] px-3 py-1.5 text-sm ring-1 ring-[#0f1724] focus:outline-none focus:ring-2 focus:ring-sky-400"
      />
    </div>
  </header>

  {#if rows.length === 0}
    <p class="text-[#7f8aa3] text-sm">No trucks currently in transit for this filter.</p>
  {:else}
    <div class="overflow-x-auto">
      <table class="min-w-full text-sm">
        <thead class="text-[#a9b3c2]">
          <tr>
            <th class="py-2 pr-4 text-left">#</th>
            <th class="py-2 pr-4 text-left">Material</th>
            <th class="py-2 pr-4 text-left">From → To</th>
            <th class="py-2 pr-4 text-left">Grade</th>
            <th class="py-2 pr-4 text-right">Weight</th>
            <th class="py-2 pr-4 text-left">Truck</th>
            <th class="py-2 pr-4 text-left">Dispatched</th>
            <th class="py-2 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {#each rows as r (r.id)}
            <tr class="border-t border-[#0f1724]">
              <td class="py-2 pr-4">#{r.id}</td>
              <td class="py-2 pr-4">
                <span class={`inline-flex items-center rounded-lg px-2 py-0.5 text-xs ring-1 ${badge(r.material)}`}>
                  {r.material?.toUpperCase()}
                </span>
              </td>
              <td class="py-2 pr-4">{r.fromStation} → {r.toStation}</td>
              <td class="py-2 pr-4">{r.gradeCode || '—'}</td>
              <td class="py-2 pr-4 text-right">{fmtTon(r.weightTon)}</td>
              <td class="py-2 pr-4">{r.truckNo || '—'}</td>
              <td class="py-2 pr-4">{dt(r.dispatchedAt)}</td>
              <td class="py-2">
                <a
                  class={`rounded-lg px-3 py-1 text-black hover:opacity-90 ${
                    r.material === 'talc' ? 'bg-emerald-400/90' : 'bg-sky-500/90'
                  }`}
                  href={r.receiveUrl || fallbackReceiveUrl(r)}
                >
                  Receive
                </a>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</section>

<style>
  :global(button[selected]) {
    background: rgba(255,255,255,0.06);
  }
</style>
