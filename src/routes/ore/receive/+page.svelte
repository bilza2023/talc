<script>
  import { enhance } from '$app/forms';
  export let data;
  export let form;

  const stationCode   = data.stationCode;
  const incomingEdges = data.incomingEdges || [];
  const grades        = data.grades || ['WL','WC','WF','GL','GC','GF'];

  const labelEdge = (e) =>
    `#${e.id} · from ${e.fromStation} → ${e.toStation} · ${e.dispatchWeight.toFixed(3)}t @ ${e.dispatchGrade}` +
    (e.truckNo ? ` · truck ${e.truckNo}` : '');
</script>

<div class="min-h-screen bg-gradient-to-b from-[#0a0d13] to-[#0b1018] text-[#e6ebf1]">
  <div class="mx-auto max-w-3xl px-4 py-8">
    <header class="mb-6">
      <h1 class="text-2xl font-semibold">Receive Ore</h1>
      <p class="text-sm text-[#a9b3c2] mt-1">
        Current station: <span class="font-mono">{stationCode}</span>.
        Change via <span class="font-mono">?station=JSS</span> (or PSS/KEF).
      </p>
    </header>

    {#if form?.success}
      <div class="mb-4 rounded-xl bg-green-600/20 text-green-200 px-4 py-3 ring-1 ring-green-700/40">
        Received. Edge #{form.edgeId}. New child batch: {form.childBatchId}.
      </div>
    {:else if form && !form.success}
      <div class="mb-4 rounded-xl bg-red-600/20 text-red-200 px-4 py-3 ring-1 ring-red-700/40">
        {form?.message || 'Could not receive.'}
      </div>
    {/if}

    <form method="POST" action="?/receive" use:enhance class="space-y-6 bg-[#101721] rounded-2xl p-6 shadow-lg ring-1 ring-[#0f1724]">
      <input type="hidden" name="stationCode" value={stationCode} />

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div class="flex flex-col gap-2 md:col-span-2">
          <label class="text-sm text-[#a9b3c2]" for="edgeId">Incoming edge</label>
          <select id="edgeId" name="edgeId" required
                  class="w-full rounded-xl bg-[#0f1621] px-3 py-2 ring-1 ring-[#0f1724] focus:outline-none focus:ring-2 focus:ring-sky-400">
            <option value="" disabled selected>Select incoming…</option>
            {#each incomingEdges as e}
              <option value={e.id}>{labelEdge(e)}</option>
            {/each}
          </select>
          <p class="text-xs text-[#7f8aa3]">These are edges with status <span class="font-mono">in_transit</span> to this station.</p>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm text-[#a9b3c2]" for="receiveWeight">Received weight (tons)</label>
          <input id="receiveWeight" name="receiveWeight" type="number" step="0.001" min="0.001" required
                 placeholder="e.g. 19.750"
                 class="w-full rounded-xl bg-[#0f1621] px-3 py-2 ring-1 ring-[#0f1724] focus:outline-none focus:ring-2 focus:ring-sky-400" />
          <p class="text-xs text-[#7f8aa3]">Must be ≤ the dispatched weight for the selected edge.</p>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm text-[#a9b3c2]" for="receiveGrade">Grade (optional)</label>
          <select id="receiveGrade" name="receiveGrade"
                  class="w-full rounded-xl bg-[#0f1621] px-3 py-2 ring-1 ring-[#0f1724] focus:outline-none focus:ring-2 focus:ring-sky-400">
            <option value="">Same as dispatch grade</option>
            {#each grades as g}<option value={g}>{g}</option>{/each}
          </select>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm text-[#a9b3c2]" for="receivedBy">Received by (optional)</label>
          <input id="receivedBy" name="receivedBy" type="text" placeholder="Supervisor name"
                 class="w-full rounded-xl bg-[#0f1621] px-3 py-2 ring-1 ring-[#0f1724] focus:outline-none focus:ring-2 focus:ring-sky-400" />
        </div>

        <div class="flex flex-col gap-2 md:col-span-2">
          <label class="text-sm text-[#a9b3c2]" for="receivedAt">Received at (optional)</label>
          <input id="receivedAt" name="receivedAt" type="datetime-local"
                 class="w-full rounded-xl bg-[#0f1621] px-3 py-2 ring-1 ring-[#0f1724] focus:outline-none focus:ring-2 focus:ring-sky-400" />
        </div>
      </div>

      <div class="pt-2">
        <button type="submit"
          class="inline-flex items-center justify-center rounded-xl bg-sky-500/90 hover:bg-sky-400 px-5 py-2.5 font-medium text-black transition">
          Complete Receive
        </button>
      </div>
    </form>
  </div>
</div>
