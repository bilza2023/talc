
<script>
  import { enhance } from '$app/forms';
  export let data;
  export let form;

  const stationCode = data.stationCode;
  const parents     = data.parents || [];
  const grades      = data.grades  || ['TL1','TL2','TL3','GL','GC','GF'];
  const toStations  = data.toStations || [];

  const labelParent = (p) =>
    `#${p.id} · ${p.gradeCode} · rem ${p.remainingTon.toFixed(3)}t · committed ${p.committedTon.toFixed(3)}t · avail ${p.availableTon.toFixed(3)}t`;
</script>

<div class="min-h-screen bg-gradient-to-b from-[#0a0d13] to-[#0b1018] text-[#e6ebf1]">
  <div class="mx-auto max-w-3xl px-4 py-8">
    <header class="mb-6">
      <h1 class="text-2xl font-semibold">Dispatch Talc</h1>
      <p class="text-sm text-[#a9b3c2] mt-1">
        Current station: <span class="font-mono">{stationCode}</span>.
        Change via <span class="font-mono">?station=JSS</span> (or PSS/KEF).
      </p>
    </header>

    {#if form?.success}
      <div class="mb-4 rounded-xl bg-green-600/20 text-green-200 px-4 py-3 ring-1 ring-green-700/40">
        Talc edge created (ID: {form.edgeId}) → {form.toStation}
      </div>
    {:else if form && !form.success}
      <div class="mb-4 rounded-xl bg-red-600/20 text-red-200 px-4 py-3 ring-1 ring-red-700/40">
        {form?.message || 'Could not dispatch.'}
      </div>
    {/if}

    <form method="POST" action="?/dispatch" use:enhance class="space-y-6 bg-[#101721] rounded-2xl p-6 shadow-lg ring-1 ring-[#0f1724]">
      <input type="hidden" name="stationCode" value={stationCode} />

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div class="flex flex-col gap-2 md:col-span-2">
          <label class="text-sm text-[#a9b3c2]" for="parentBatchId">Parent talc batch</label>
          <select id="parentBatchId" name="parentBatchId" required
                  class="w-full rounded-xl bg-[#0f1621] px-3 py-2 ring-1 ring-[#0f1724] focus:outline-none focus:ring-2 focus:ring-sky-400">
            <option value="" disabled selected>Select a parent batch…</option>
            {#each parents as p}
              <option value={p.id} disabled={p.availableTon <= 0}>{labelParent(p)}</option>
            {/each}
          </select>
          <p class="text-xs text-[#7f8aa3]">You can dispatch up to the batch’s available (remaining − in-transit committed).</p>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm text-[#a9b3c2]" for="toStation">To station</label>
          <select id="toStation" name="toStation" required
                  class="w-full rounded-xl bg-[#0f1621] px-3 py-2 ring-1 ring-[#0f1724] focus:outline-none focus:ring-2 focus:ring-sky-400">
            <option value="" disabled selected>Select destination…</option>
            {#each toStations as s}<option value={s}>{s}</option>{/each}
          </select>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm text-[#a9b3c2]" for="dispatchGrade">Grade</label>
          <select id="dispatchGrade" name="dispatchGrade" required
                  class="w-full rounded-xl bg-[#0f1621] px-3 py-2 ring-1 ring-[#0f1724] focus:outline-none focus:ring-2 focus:ring-sky-400">
            <option value="" disabled selected>Select grade…</option>
            {#each grades as g}<option value={g}>{g}</option>{/each}
          </select>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm text-[#a9b3c2]" for="dispatchWeight">Weight (tons)</label>
          <input id="dispatchWeight" name="dispatchWeight" type="number" step="0.001" min="0.001" required
                 placeholder="e.g. 12.750"
                 class="w-full rounded-xl bg-[#0f1621] px-3 py-2 ring-1 ring-[#0f1724] focus:outline-none focus:ring-2 focus:ring-sky-400" />
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm text-[#a9b3c2]" for="truckNo">Truck No. (optional)</label>
          <input id="truckNo" name="truckNo" type="text" placeholder="e.g. LES-1234"
                 class="w-full rounded-xl bg-[#0f1621] px-3 py-2 ring-1 ring-[#0f1724] focus:outline-none focus:ring-2 focus:ring-sky-400" />
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm text-[#a9b3c2]" for="amount">Bags / Units (optional)</label>
          <input id="amount" name="amount" type="number" min="0" step="1"
                 class="w-full rounded-xl bg-[#0f1621] px-3 py-2 ring-1 ring-[#0f1724] focus:outline-none focus:ring-2 focus:ring-sky-400" />
        </div>

        <div class="flex flex-col gap-2 md:col-span-2">
          <label class="text-sm text-[#a9b3c2]" for="dispatchedAt">Dispatched at (optional)</label>
          <input id="dispatchedAt" name="dispatchedAt" type="datetime-local"
                 class="w-full rounded-xl bg-[#0f1621] px-3 py-2 ring-1 ring-[#0f1724] focus:outline-none focus:ring-2 focus:ring-sky-400" />
        </div>
      </div>

      <div class="pt-2">
        <button type="submit"
          class="inline-flex items-center justify-center rounded-xl bg-sky-500/90 hover:bg-sky-400 px-5 py-2.5 font-medium text-black transition">
          Create Dispatch
        </button>
      </div>
    </form>
  </div>
</div>
