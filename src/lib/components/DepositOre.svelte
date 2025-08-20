<script>
  import { enhance } from '$app/forms';

  export let form = null;
  export let stationCode = 'JSS';
  export let suppliers = [];                  // [{ id, code, name }]
  export let grades = ['WL','WC','WF','GL','GC','GF']; // REQUIRED options

  let localForm = form;
  const v = (k, d = '') => localForm?.values?.[k] ?? d;

  const onEnhance = () => {
    return async ({ result, update }) => {
      if (result.type === 'failure') {
        localForm = result.data;              // { message, values }
        return;
      }
      await update();                         // follows redirect
    };
  };
</script>

{#if localForm?.message}
  <div role="alert" class="mb-3 rounded-lg border border-red-600/40 bg-red-900/30 px-3 py-2 text-red-200">
    {localForm.message}
  </div>
{/if}

<form method="post" action="/stations?/deposit" use:enhance={onEnhance} class="space-y-4">
  <input type="hidden" name="stationCode" value={stationCode} />

  <label class="flex flex-col gap-1">
    <span class="text-sm text-slate-400">Supplier</span>
    <select name="supplierId" required class="rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-slate-100 focus:ring-2 focus:ring-sky-400">
      <option value="">-- Select supplier --</option>
      {#each suppliers as s}
        <option value={s.id} selected={String(v('supplierId')) === String(s.id)}>{s.code} — {s.name}</option>
      {/each}
    </select>
  </label>

  <label class="flex flex-col gap-1">
    <span class="text-sm text-slate-800">Truck No</span>
    <input name="truckNo" type="text" required class="rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-sky-400" placeholder="e.g. LES-1234" value={v('truckNo')} />
  </label>

  <label class="flex flex-col gap-1">
    <span class="text-sm text-slate-400">Weight (tons)</span>
    <input name="weightTon" type="number" min="0.001" step="0.001" required class="rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-sky-400" placeholder="e.g. 20" value={v('weightTon')} />
  </label>

  <!-- NEW: gradeCode is REQUIRED -->
  <label class="flex flex-col gap-1">
    <span class="text-sm text-slate-400">Grade</span>
    <select name="gradeCode" required class="rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-slate-100 focus:ring-2 focus:ring-sky-400">
      <option value="">-- Select grade --</option>
      {#each grades as g}
        <option value={g} selected={v('gradeCode') === g}>{g}</option>
      {/each}
    </select>
  </label>

  <div class="flex justify-end pt-2">
    <button type="submit" class="inline-flex items-center rounded-lg bg-sky-500 px-4 py-2 font-semibold text-slate-900 shadow hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400">
      Deposit
    </button>
  </div>
</form>
