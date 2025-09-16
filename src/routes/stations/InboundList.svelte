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
  const badge = (m) => (m === 'ore' ? 'bg-sky-500/15 text-sky-300 ring-sky-500/30' : 'bg-emerald-400/15 text-emerald-300 ring-emerald-500/30');

  function fallbackReceiveUrl(row) {
    const base = row.material === 'talc' ? '/talc/receive' : '/ore/receive';
    const params = new URLSearchParams();
    if (row?.id != null) params.set('edge', String(row.id));
    if (stationCode) params.set('station', stationCode);
    return `${base}?${params.toString()}`;
  }

  $: rows = (items ? items : [])
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

<section class="inbound-list rounded-xl bg-[#0f1621] p-4 ring-1 ring-[#1a2332] shadow-sm">
  <header class="mb-4 flex flex-col gap-3">
    <div>
      <h2 class="text-base font-semibold text-white">{title}</h2>
      <p class="text-xs text-[#a9b3c2]">Edges destined to this station (status: <span class="font-mono">in_transit</span>)</p>
    </div>

    <div class="flex flex-col gap-2">
      <div class="flex rounded-lg bg-[#1a2332] ring-1 ring-[#222b3e] overflow-hidden">
        <button
          class="flex-1 px-3 py-2 text-xs font-medium hover:bg-white/10"
          class:selected={filter === 'ALL'}
          on:click={() => (filter = 'ALL')}
        >
          All
        </button>
        <button
          class="flex-1 px-3 py-2 text-xs font-medium hover:bg-white/10"
          class:selected={filter === 'ORE'}
          on:click={() => (filter = 'ORE')}
        >
          Ore
        </button>
        <button
          class="flex-1 px-3 py-2 text-xs font-medium hover:bg-white/10"
          class:selected={filter === 'TALC'}
          on:click={() => (filter = 'TALC')}
        >
          Talc
        </button>
      </div>

      <input
        placeholder="Search truck/grade/from…"
        bind:value={q}
        class="w-full rounded-lg bg-[#1a2332] px-3 py-2 text-sm text-white ring-1 ring-[#222b3e] focus:outline-none focus:ring-2 focus:ring-sky-400 placeholder:text-[#7f8aa3]"
      />
    </div>
  </header>

  {#if rows.length === 0}
    <p class="text-sm text-[#7f8aa3] text-center py-4">No trucks currently in transit for this filter.</p>
  {:else}
    <div class="space-y-3">
      {#each rows as r (r.id)}
        <div class="rounded-lg bg-[#1a2332] p-3 ring-1 ring-[#222b3e] shadow-sm">
          <div class="grid gap-2 text-sm">
            <div class="flex justify-between items-center">
              <span class="text-[#a9b3c2] font-medium">ID</span>
              <span>#{r.id}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-[#a9b3c2] font-medium">Material</span>
              <span class={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${badge(r.material)}`}>
                {r.material?.toUpperCase()}
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-[#a9b3c2] font-medium">Route</span>
              <span>{r.fromStation} → {r.toStation}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-[#a9b3c2] font-medium">Grade</span>
              <span>{r.gradeCode || '—'}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-[#a9b3c2] font-medium">Weight</span>
              <span>{fmtTon(r.weightTon)}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-[#a9b3c2] font-medium">Truck</span>
              <span>{r.truckNo || '—'}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-[#a9b3c2] font-medium">Dispatched</span>
              <span>{dt(r.dispatchedAt)}</span>
            </div>
            <div class="mt-2">
              <a
                class={`block w-full text-center rounded-lg px-3 py-2 text-sm font-medium text-black hover:opacity-90 ${
                  r.material === 'talc' ? 'bg-emerald-400' : 'bg-sky-500'
                }`}
                href={r.receiveUrl || fallbackReceiveUrl(r)}
              >
                Receive
              </a>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</section>

<style>
  :global(button[selected]) {
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
  }

  .inbound-list {
    max-width: 100%;
    margin: 0 auto;
  }

  @media (min-width: 640px) {
    .inbound-list {
      padding: 1.5rem;
      border-radius: 1rem;
    }

    header {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }

    .inbound-list .space-y-3 {
      display: table;
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
    }

    .inbound-list .space-y-3 > div {
      display: table-row;
      background: none;
      border: none;
      box-shadow: none;
    }

    .inbound-list .grid {
      display: table-row;
    }

    .inbound-list .grid > div {
      display: table-cell;
      padding: 0.75rem 1rem;
      vertical-align: middle;
      border-top: 1px solid #222b3e;
    }

    .inbound-list .grid > div:first-child {
      border-left: 1px solid #222b3e;
      border-top-left-radius: 0.5rem;
      border-bottom-left-radius: 0.5rem;
    }

    .inbound-list .grid > div:last-child {
      border-right: 1px solid #222b3e;
      border-top-right-radius: 0.5rem;
      border-bottom-right-radius: 0.5rem;
    }

    .inbound-list .grid > div:not(:last-child) {
      border-right: none;
    }

    .inbound-list .grid  {
      display: none;
    }

    .inbound-list .grid > div:last-child a {
      display: inline-block;
      width: auto;
    }

    .inbound-list::before {
      content: '# Material Route Grade Weight Truck Dispatched Action';
      display: table;
      width: 100%;
      padding: 0.75rem 1rem;
      background: #1a2332;
      color: #a9b3c2;
      font-size: 0.75rem;
      font-weight: 500;
      border-bottom: 1px solid #222b3e;
      border-radius: 0.5rem 0.5rem 0 0;
    }
  }
</style>