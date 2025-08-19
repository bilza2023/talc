
<script>
    // From-station is the page context (e.g., JSS)
    export let stationCode = 'JSS';
  
    // Allowed stations; destination excludes the current station
    export let stations = ['JSS', 'PSS', 'KEF'];
  
    // Grade is optional for dispatch (kept for consistency)
    export let grades = ['WL', 'WC', 'WF', 'GL', 'GC', 'GF'];
  
    $: destinationOptions = stations.filter((s) => s !== stationCode);
  </script>
  
  <form method="post" action="/stations?/dispatch" class="space-y-4">
    <!-- Required by the server action -->
    <input type="hidden" name="fromStation" value={stationCode} />
  
    <label class="flex flex-col gap-1">
      <span class="text-sm text-slate-400">To Station</span>
      <select name="toStation" required
        class="rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-slate-100 outline-none focus:border-slate-600 focus:ring-2 focus:ring-sky-400">
        <option value="">-- Select destination --</option>
        {#each destinationOptions as s}
          <option value={s}>{s}</option>
        {/each}
      </select>
    </label>
  
    <label class="flex flex-col gap-1">
      <span class="text-sm text-slate-400">Truck No</span>
      <input name="truckNo" type="text" required
        class="rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-slate-100 outline-none placeholder-slate-500 focus:border-slate-600 focus:ring-2 focus:ring-sky-400"
        placeholder="e.g. LES-1234" />
    </label>
  
    <label class="flex flex-col gap-1">
      <span class="text-sm text-slate-400">Weight (tons)</span>
      <input name="weightTon" type="number" min="0.001" step="0.001" required
        class="rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-slate-100 outline-none placeholder-slate-500 focus:border-slate-600 focus:ring-2 focus:ring-sky-400"
        placeholder="e.g. 20" />
    </label>
  
    <label class="flex flex-col gap-1">
      <span class="text-sm text-slate-400">Grade (optional)</span>
      <select name="gradeCode"
        class="rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-slate-100 outline-none focus:border-slate-600 focus:ring-2 focus:ring-sky-400">
        <option value="">-- Optional --</option>
        {#each grades as g}
          <option value={g}>{g}</option>
        {/each}
      </select>
    </label>
  
    <div class="flex justify-end pt-2">
      <button type="submit"
        class="inline-flex items-center rounded-lg bg-sky-500 px-4 py-2 font-semibold text-slate-900 shadow hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400">
        Dispatch
      </button>
    </div>
  </form>
  