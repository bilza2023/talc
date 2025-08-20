<script>
  export let data;
  export let form; // ✅ receive action result

  let stationCode = data.stationCode;
  let suppliers   = data.suppliers || [];
  let grades      = data.grades    || ['WL','WC','WF','GL','GC','GF'];

  const formatSupplier = (s) => (s?.code ? `${s.code} — ${s.name}` : s?.name ?? '');
</script>

<div class="min-h-screen bg-gradient-to-b from-[#0a0d13] to-[#0b1018] text-[#e6ebf1]">
  <div class="mx-auto max-w-3xl px-4 py-8">
    <header class="mb-6">
      <h1 class="text-2xl font-semibold">Deposit Ore</h1>
      <p class="text-sm text-[#a9b3c2] mt-1">
        Current station: <span class="font-mono">{stationCode}</span>.
        Change via <span class="font-mono">?station=JSS</span> (or PSS/KEF).
      </p>
    </header>

    {#if form?.success}
      <div class="mb-4 rounded-xl bg-green-600/20 text-green-200 px-4 py-3 ring-1 ring-green-700/40">
        Saved. Deposit ID: {form.depositId} — Station {form.station}.
      </div>
    {:else if form && !form.success}
      <div class="mb-4 rounded-xl bg-red-600/20 text-red-200 px-4 py-3 ring-1 ring-red-700/40">
        {form?.message || 'Could not save deposit.'}
      </div>
    {/if}

    <form method="post" action="?station={stationCode}&/deposit" class="space-y-6 bg-[#101721] rounded-2xl p-6 shadow-lg ring-1 ring-[#0f1724]">
      <input type="hidden" name="stationCode" value={stationCode} />

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div class="flex flex-col gap-2">
          <label class="text-sm text-[#a9b3c2]" for="supplierId">Supplier</label>
          <select id="supplierId" name="supplierId" class="w-full rounded-xl bg-[#0f1621] px-3 py-2 ring-1 ring-[#0f1724] focus:outline-none focus:ring-2 focus:ring-sky-400" required>
            <option value="" disabled selected>Choose a supplier…</option>
            {#each suppliers as s}
              <option value={s.id}>{formatSupplier(s)}</option>
            {/each}
          </select>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm text-[#a9b3c2]" for="gradeCode">Grade</label>
          <select id="gradeCode" name="gradeCode" class="w-full rounded-xl bg-[#0f1621] px-3 py-2 ring-1 ring-[#0f1724] focus:outline-none focus:ring-2 focus:ring-sky-400" required>
            <option value="" disabled selected>Select grade…</option>
            {#each grades as g}
              <option value={g}>{g}</option>
            {/each}
          </select>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm text-[#a9b3c2]" for="weightTon">Weight (tons)</label>
          <input id="weightTon" name="weightTon" type="number" step="0.01" min="0" placeholder="e.g. 88.50"
            class="w-full rounded-xl bg-[#0f1621] px-3 py-2 ring-1 ring-[#0f1724] focus:outline-none focus:ring-2 focus:ring-sky-400" required />
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm text-[#a9b3c2]" for="truckNo">Truck No.</label>
          <input id="truckNo" name="truckNo" type="text" placeholder="e.g. LES-1234"
            class="w-full rounded-xl bg-[#0f1621] px-3 py-2 ring-1 ring-[#0f1724] focus:outline-none focus:ring-2 focus:ring-sky-400" required />
        </div>

      </div>

      <div class="pt-2">
        <button type="submit"
          class="inline-flex items-center justify-center rounded-xl bg-sky-500/90 hover:bg-sky-400 px-5 py-2.5 font-medium text-black transition">
          Save Deposit
        </button>
      </div>
    </form>
  </div>
</div>
