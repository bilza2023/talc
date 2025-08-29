<script>
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';

  export let data;
  export let form;

  $: transportId = Number($page.url.searchParams.get('transportId') || 0);
  const stationCode = data?.stationCode;
  const grades = data?.grades || ['WL','WC','WF','GL','GC','GF'];
</script>

<div class="min-h-screen bg-gradient-to-b from-[#0a0d13] to-[#0b1018] text-[#e6ebf1]">
  <div class="mx-auto max-w-3xl px-4 py-8">
    <header class="mb-6">
      <h1 class="text-2xl font-semibold">Unload Ore</h1>
      <p class="text-sm text-[#a9b3c2] mt-1">
        Station: <span class="font-mono">{stationCode}</span>
        · Transport ID: <span class="font-mono">{transportId}</span>
      </p>
    </header>

    {#if form?.success}
      <div class="mb-4 rounded-xl bg-green-600/20 text-green-200 px-4 py-3 ring-1 ring-green-700/40">
        Received transport #{form.transportId} at {form.station}.
      </div>
    {:else if form && !form.success}
      <div class="mb-4 rounded-xl bg-red-600/20 text-red-200 px-4 py-3 ring-1 ring-red-700/40">
        {form?.message || 'Could not complete unload.'}
      </div>
    {/if}

    <!-- Post to the named action; enhance keeps us on the same page -->
    <form method="POST" action="?/unload" use:enhance
          class="space-y-6 bg-[#101721] rounded-2xl p-6 shadow-lg ring-1 ring-[#0f1724]">
      <!-- required hidden fields -->
      <input type="hidden" name="stationCode" value={stationCode} />
      <input type="hidden" name="transportId" value={transportId} />

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <!-- Receive weight -->
        <div class="flex flex-col gap-2">
          <label class="text-sm text-[#a9b3c2]" for="receiveWeightTon">Received weight (tons)</label>
          <input id="receiveWeightTon" name="receiveWeightTon" type="number" step="0.01" min="0.01"
                 class="w-full rounded-xl bg-[#0f1621] px-3 py-2 ring-1 ring-[#0f1724] focus:outline-none focus:ring-2 focus:ring-sky-400"
                 required value={form?.values?.receiveWeightTon} />
          {#if form?.errors?.receiveWeightTon}
            <p class="text-xs text-red-300">{form.errors.receiveWeightTon}</p>
          {/if}
        </div>

        <!-- Receive grade -->
        <div class="flex flex-col gap-2">
          <label class="text-sm text-[#a9b3c2]" for="receiveGradeCode">Received grade</label>
          <select id="receiveGradeCode" name="receiveGradeCode"
                  class="w-full rounded-xl bg-[#0f1621] px-3 py-2 ring-1 ring-[#0f1724] focus:outline-none focus:ring-2 focus:ring-sky-400"
                  required>
            <option value="" disabled selected>Select grade…</option>
            {#each grades as g}
              <option value={g} selected={form?.values?.receiveGradeCode === g}>{g}</option>
            {/each}
          </select>
          {#if form?.errors?.receiveGradeCode}
            <p class="text-xs text-red-300">{form.errors.receiveGradeCode}</p>
          {/if}
        </div>

        <!-- Received by -->
        <div class="flex flex-col gap-2 md:col-span-2">
          <label class="text-sm text-[#a9b3c2]" for="receivedBy">Received by</label>
          <input id="receivedBy" name="receivedBy" type="text" placeholder="Employee name/ID"
                 class="w-full rounded-xl bg-[#0f1621] px-3 py-2 ring-1 ring-[#0f1724] focus:outline-none focus:ring-2 focus:ring-sky-400"
                 required value={form?.values?.receivedBy} />
          {#if form?.errors?.receivedBy}
            <p class="text-xs text-red-300">{form.errors.receivedBy}</p>
          {/if}
        </div>
      </div>

      <div class="pt-2">
        <button type="submit"
                class="inline-flex items-center justify-center rounded-xl bg-sky-500/90 hover:bg-sky-400 px-5 py-2.5 font-medium text-black transition">
          Complete Unload
        </button>
      </div>
    </form>
  </div>
</div>
