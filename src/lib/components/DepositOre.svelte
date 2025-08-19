<script>
  export let stationCode = 'JSS';
  export let suppliers = []; // [{ id, code, name }]
  export let grades = ['WL','WC','WF','GL','GC','GF'];
</script>

<form method="post" action="/stations?/deposit" class="space-y-4">
  <!-- formKey routes to ore.deposit in stations/+page.server.js -->
  <input type="hidden" name="formKey" value="ore:deposit" />
  <input type="hidden" name="stationCode" value={stationCode} />

  <label class="flex flex-col gap-1">
    <span class="text-sm text-slate-400">Supplier</span>
    <select name="supplierId" required
      class="rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-slate-100 outline-none focus:border-slate-600 focus:ring-2 focus:ring-sky-400">
      <option value="">-- Select supplier --</option>
      {#each suppliers as s}
        <option value={s.id}>{s.code} — {s.name}</option>
      {/each}
    </select>
  </label>

  <label class="flex flex-col gap-1">
    <span class="text-sm text-slate-400">Grade</span>
    <select name="gradeCode" required
      class="rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-slate-100 outline-none focus:border-slate-600 focus:ring-2 focus:ring-sky-400">
      {#each grades as g}
        <option value={g}>{g}</option>
      {/each}
    </select>
  </label>

  <label class="flex flex-col gap-1">
    <span class="text-sm text-slate-400">Weight (tons)</span>
    <input name="weightTon" type="number" min="0.001" step="0.001" required
      class="rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-slate-100 outline-none placeholder-slate-500 focus:border-slate-600 focus:ring-2 focus:ring-sky-400"
      placeholder="e.g. 20" />
  </label>

  <label class="flex flex-col gap-1">
    <span class="text-sm text-slate-400">Batch Ref (optional)</span>
    <input name="batchRef" type="text"
      class="rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-slate-100 outline-none placeholder-slate-500 focus:border-slate-600 focus:ring-2 focus:ring-sky-400"
      placeholder="e.g. SUP001-WL-20250818-001" />
  </label>

  <div class="flex justify-end pt-2">
    <button type="submit"
      class="inline-flex items-center rounded-lg bg-sky-500 px-4 py-2 font-semibold text-slate-900 shadow hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400">
      Deposit
    </button>
  </div>

  {#if !suppliers?.length}
    <p class="text-sm text-slate-400">
      No suppliers yet. Add some on the <a href="/suppliers" class="underline">Suppliers</a> page.
    </p>
  {/if}
</form>
