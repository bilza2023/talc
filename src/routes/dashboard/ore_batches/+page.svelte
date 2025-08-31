<script>
  // v1-compatible demo using @vincjo/datatables@1.14.4 (Svelte 4)
  import { DataHandler } from '@vincjo/datatables';

  // --- Demo data (replace with real rows later) ---
  const data = [
    { id: 101, material: 'ore',  fromStation: 'JSS', toStation: 'PSS', gradeCode: 'WL', weightTon: 12.4, truckNo: 'ABK-123' },
    { id: 102, material: 'ore',  fromStation: 'PSS', toStation: 'KEF', gradeCode: 'GF', weightTon: 18.1, truckNo: 'KHI-221' },
    { id: 103, material: 'talc', fromStation: 'KEF', toStation: 'PSS', gradeCode: 'T90', weightTon: 10.0, truckNo: 'PSR-778' },
    { id: 104, material: 'ore',  fromStation: 'JSS', toStation: 'KEF', gradeCode: 'GC', weightTon: 7.8,  truckNo: 'ABK-987' },
    { id: 105, material: 'talc', fromStation: 'PSS', toStation: 'JSS', gradeCode: 'T88', weightTon: 14.3, truckNo: 'PES-552' },
    { id: 106, material: 'ore',  fromStation: 'KEF', toStation: 'PSS', gradeCode: 'WF', weightTon: 9.2,  truckNo: 'KHI-552' },
    { id: 107, material: 'ore',  fromStation: 'PSS', toStation: 'JSS', gradeCode: 'WL', weightTon: 21.7, truckNo: 'ABK-774' },
    { id: 108, material: 'talc', fromStation: 'JSS', toStation: 'PSS', gradeCode: 'T92', weightTon: 11.6, truckNo: 'PSR-330' },
    { id: 109, material: 'ore',  fromStation: 'KEF', toStation: 'JSS', gradeCode: 'GL', weightTon: 16.5, truckNo: 'KHI-008' },
    { id: 110, material: 'talc', fromStation: 'PSS', toStation: 'KEF', gradeCode: 'T95', weightTon: 13.9, truckNo: 'PES-991' }
  ];

  // Keep an immutable copy for filtering
  const original = data.slice();

  // Instantiate the v1 handler
  const handler = new DataHandler(original, { rowsPerPage: 10 });

  // Stores for table rendering/pagination
  const rows = handler.getRows();                 // readable: current page rows
  const rowCount = handler.getRowCount();         // { total, start, end }
  const pageNumber = handler.getPageNumber();     // 1-based
  const pageCount = handler.getPageCount();       // total pages
  const rowsPerPage = handler.getRowsPerPage();   // writable

  // --- Filters UI state ---
  let filterMaterial = '';
  let filterFrom = '';
  let filterTo = '';
  let filterGrade = '';
  let weightMin = '';
  let weightMax = '';

  // Distinct option lists
  const materials = Array.from(new Set(original.map(r => r.material))).sort();
  const stations = Array.from(new Set(original.flatMap(r => [r.fromStation, r.toStation]))).sort();

  // Apply filters to the original data, then feed the subset into the handler
  function applyFilters() {
    let filtered = original.filter((r) => (
      (!filterMaterial || r.material === filterMaterial) &&
      (!filterFrom || r.fromStation === filterFrom) &&
      (!filterTo || r.toStation === filterTo) &&
      (!filterGrade || String(r.gradeCode).toLowerCase().includes(filterGrade.toLowerCase())) &&
      (weightMin === '' || Number(r.weightTon) >= Number(weightMin)) &&
      (weightMax === '' || Number(r.weightTon) <= Number(weightMax))
    ));

    handler.setRows(filtered);
    handler.setPage(1);
  }

  function clearFilters() {
    filterMaterial = '';
    filterFrom = '';
    filterTo = '';
    filterGrade = '';
    weightMin = '';
    weightMax = '';
    handler.setRows(original);
    handler.setPage(1);
  }

  // Sorting & search
  function sortBy(field) { handler.sort(field); }
  function onSearch(e) { handler.search(e.target.value); }
  function goPrev() { handler.setPage('previous'); }
  function goNext() { handler.setPage('next'); }
</script>

<div class="min-h-screen bg-[#0b1018] text-[#e6ebf1]">
  <div class="mx-auto max-w-7xl p-6 space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-semibold">Test Table — Filters (SSD v1)</h1>
      <p class="text-sm text-[#9fb0c5]">@vincjo/datatables@1.14.4 — Svelte 4</p>
    </header>

    <!-- Toolbar: global search + rows per page -->
    <div class="flex flex-wrap items-center gap-3">
      <input
        placeholder="Global search..."
        class="w-72 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/20"
        on:input={onSearch}
      />

      <label class="ml-auto text-sm text-[#9fb0c5] flex items-center gap-2">
        Rows per page
        <select class="rounded-md border border-white/10 bg-white/5 px-2 py-1" bind:value={$rowsPerPage}>
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </label>
    </div>

    <!-- Filters row -->
    <div class="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
      <div class="grid grid-cols-1 md:grid-cols-6 gap-3">
        <div>
          <label class="block text-xs text-[#9fb0c5] mb-1">Material</label>
          <select class="w-full rounded-md border border-white/10 bg-white/5 px-2 py-2"
                  bind:value={filterMaterial}
                  on:change={applyFilters}>
            <option class="bg-gray-800 text-white"  value="">All</option>
            {#each materials as m}
              <option class="bg-gray-800 text-white" value={m}>{m}</option>
            {/each}
          </select>
        </div>
        <div>
          <label class="block text-xs text-[#9fb0c5] mb-1">From</label>
          <select class="w-full rounded-md border border-white/10 bg-white/5 px-2 py-2"
                  bind:value={filterFrom}
                  on:change={applyFilters}>
            <option class="bg-gray-800 text-white" value="">All</option>
            {#each stations as s}
              <option class="bg-gray-800 text-white" value={s}>{s}</option>
            {/each}
          </select>
        </div>
        <div>
          <label class="block text-xs text-[#9fb0c5] mb-1">To</label>
          <select class="w-full rounded-md border border-white/10 bg-white/5 px-2 py-2"
                  bind:value={filterTo}
                  on:change={applyFilters}>
            <option class="bg-gray-800 text-white" value="">All</option>
            {#each stations as s}
              <option class="bg-gray-800 text-white" value={s}>{s}</option>
            {/each}
          </select>
        </div>
        <div>
          <label class="block text-xs text-[#9fb0c5] mb-1">Grade contains</label>
          <input class="w-full rounded-md border border-white/10 bg-white/5 px-2 py-2"
                 placeholder="e.g. WL, T90"
                 bind:value={filterGrade}
                 on:input={applyFilters} />
        </div>
        <div>
          <label class="block text-xs text-[#9fb0c5] mb-1">Weight min (t)</label>
          <input type="number" step="0.1" min="0"
                 class="w-full rounded-md border border-white/10 bg-white/5 px-2 py-2"
                 bind:value={weightMin}
                 on:input={applyFilters} />
        </div>
        <div>
          <label class="block text-xs text-[#9fb0c5] mb-1">Weight max (t)</label>
          <input type="number" step="0.1" min="0"
                 class="w-full rounded-md border border-white/10 bg-white/5 px-2 py-2"
                 bind:value={weightMax}
                 on:input={applyFilters} />
        </div>
      </div>
      <div class="flex justify-end">
        <button class="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm" on:click={clearFilters}>Clear filters</button>
      </div>
    </div>

    <!-- Table -->
    <div class="rounded-xl border border-white/10 bg-white/[0.02] p-3 shadow">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-[#9fb0c5]">
            <th class="cursor-pointer" on:click={() => sortBy('id')}>ID</th>
            <th class="cursor-pointer" on:click={() => sortBy('material')}>Material</th>
            <th class="cursor-pointer" on:click={() => sortBy('fromStation')}>From</th>
            <th class="cursor-pointer" on:click={() => sortBy('toStation')}>To</th>
            <th class="cursor-pointer" on:click={() => sortBy('gradeCode')}>Grade</th>
            <th class="cursor-pointer" on:click={() => sortBy('weightTon')}>Weight (t)</th>
            <th class="cursor-pointer" on:click={() => sortBy('truckNo')}>Truck</th>
          </tr>
        </thead>
        <tbody>
          {#each $rows as row}
            <tr class="border-t border-white/5 hover:bg-white/[0.04]">
              <td class="py-2">{row.id}</td>
              <td class="py-2">{row.material}</td>
              <td class="py-2">{row.fromStation}</td>
              <td class="py-2">{row.toStation}</td>
              <td class="py-2">{row.gradeCode}</td>
              <td class="py-2">{row.weightTon}</td>
              <td class="py-2">{row.truckNo}</td>
            </tr>
          {/each}
        </tbody>
      </table>

      <!-- Footer / pagination -->
      <div class="mt-3 flex items-center justify-between text-xs text-[#9fb0c5]">
        <div>
          Showing { $rowCount.start }–{ $rowCount.end } of { $rowCount.total }
        </div>
        <div class="flex items-center gap-2">
          <button class="rounded-md border border-white/10 bg-white/5 px-2 py-1" on:click={goPrev}>Prev</button>
          <span>Page { $pageNumber } / { $pageCount }</span>
          <button class="rounded-md border border-white/10 bg-white/5 px-2 py-1" on:click={goNext}>Next</button>
        </div>
      </div>
    </div>
  </div>
</div>

