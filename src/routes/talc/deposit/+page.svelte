<script>
  import { enhance } from '$app/forms';
  export let data;
  export let form;

  const stationCode = data.stationCode;
  const oreParents  = data.oreParents || [];
  const grades      = data.grades || ['TL1','TL2','TL3','GL','GC','GF'];

  const labelParent = (p) =>
    `Ore #${p.id} · ${p.gradeCode} · rem ${(+p.remainingTon).toFixed(3)}t (created ${(+p.createdTon).toFixed(3)}t)`;
</script>

<div class="min-h-screen bg-gradient-to-b from-[#0a0d13] to-[#0b1018] text-[#e6ebf1]">
  <div class="mx-auto max-w-3xl px-4 py-8">
    <header class="mb-6">
      <h1 class="text-2xl font-semibold">Talc — Process (Deposit)</h1>
      <p class="text-sm text-[#a9b3c2] mt-1">
        Current station: <span class="font-mono">{stationCode}</span>.
        Change via <span class="font-mono">?station=JSS</span> (or PSS/KEF).
      </p>
    </header>

    {#if form?.success}
      <div class="mb-4 rounded-xl bg-green-600/20 text-green-200 px-4 py-3 ring-1 ring-green-700/40">
        Processed. New talc batch ID: {form.talcBatchId}.
      </div>
    {:else if form && !form.success}
      <div class="mb-4 rounded-xl bg-red-600/20 text-red-200 px-4 py-3 ring-1 ring-red-700/40">
        {form?.message || 'Could not process talc.'}
      </div>
    {/if}

    <form method="POST" action="?/deposit" use:enhance class="space-y-6 bg-[#101721] rounded-2xl p-6 shadow-lg ring-1 ring-[#0f1724]">
      <input type="hidden" name="stationCode" value={stationCode} />

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <!-- Parent ore batch to consume -->
        <div class="flex flex-col gap-2 md:col-span-2">
          <label class="text-sm text-[#a9b3c2]" for="parentOreBatchId">Parent ore batch</label>
          <select id="parentOreBatchId" name="parentOreBatchId" required
                  class="w-full rounded-xl bg-[#0f1621] px-3 py-2 ring-1 ring-[#0f1724] focus:outline-none focus:ring-2 focus:ring-sky-400">
            <option value="" disabled selected>Select ore batch…</option>
            {#each oreParents as p}
              <option value={p.id} disabled={(+p.remainingTon) <= 0}>{labelParent(p)}</option>
            {/each}
          </select>
        </div>

        <!-- Talc grade -->
        <div class="flex flex-col gap-2">
          <label class="text-sm text-[#a9b3c2]" for="gradeCode">Talc grade</label>
          <select id="gradeCode" name="gradeCode" required
                  class="w-full rounded-xl bg-[#0f1621] px-3 py-2 ring-1 ring-[#0f1724] focus:outline-none focus:ring-2 focus:ring-sky-400">
            <option value="" disabled selected>Select grade…</option>
            {#each grades as g}<option value={g}>{g}</option>{/each}
          </select>
        </div>

        <!-- Ore consumed -->
        <div class="flex flex-col gap-2">
          <label class="text-sm text-[#a9b3c2]" for="oreDeltaTon">Ore consumed (tons)</label>
          <input id="oreDeltaTon" name="oreDeltaTon" type="number" step="0.001" min="0.001" required
                 placeholder="e.g. 12.500"
                 class="w-full rounded-xl bg-[#0f1621] px-3 py-2 ring-1 ring-[#0f1724] focus:outline-none focus:ring-2 focus:ring-sky-400" />
        </div>

        <!-- Talc created -->
        <div class="flex flex-col gap-2">
          <label class="text-sm text-[#a9b3c2]" for="talcCreatedTon">Talc created (tons)</label>
          <input id="talcCreatedTon" name="talcCreatedTon" type="number" step="0.001" min="0.001" required
                 placeholder="e.g. 7.350"
                 class="w-full rounded-xl bg-[#0f1621] px-3 py-2 ring-1 ring-[#0f1724] focus:outline-none focus:ring-2 focus:ring-sky-400" />
        </div>

        <!-- Optional: attribute portion to this run (for multi-input/output accounting) -->
        <div class="flex flex-col gap-2">
          <label class="text-sm text-[#a9b3c2]" for="talcDeltaTon">Attribute to this run (tons, optional)</label>
          <input id="talcDeltaTon" name="talcDeltaTon" type="number" step="0.001" min="0"
                 placeholder="leave blank if same as created"
                 class="w-full rounded-xl bg-[#0f1621] px-3 py-2 ring-1 ring-[#0f1724] focus:outline-none focus:ring-2 focus:ring-sky-400" />
        </div>

        <!-- Optional run metadata -->
        <div class="flex flex-col gap-2">
          <label class="text-sm text-[#a9b3c2]" for="runKey">Run key (optional)</label>
          <input id="runKey" name="runKey" type="text" placeholder="e.g. RUN-2025-08-31-A"
                 class="w-full rounded-xl bg-[#0f1621] px-3 py-2 ring-1 ring-[#0f1724] focus:outline-none focus:ring-2 focus:ring-sky-400" />
        </div>

        <div class="flex flex-col gap-2 md:col-span-2">
          <label class="text-sm text-[#a9b3c2]" for="processAt">Processed at (optional)</label>
          <input id="processAt" name="processAt" type="datetime-local"
                 class="w-full rounded-xl bg-[#0f1621] px-3 py-2 ring-1 ring-[#0f1724] focus:outline-none focus:ring-2 focus:ring-sky-400" />
        </div>
      </div>

      <div class="pt-2">
        <button type="submit"
          class="inline-flex items-center justify-center rounded-xl bg-sky-500/90 hover:bg-sky-400 px-5 py-2.5 font-medium text-black transition">
          Save Talc Deposit (Process)
        </button>
      </div>
    </form>
  </div>
</div>
