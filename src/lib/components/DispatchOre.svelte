<!-- src/lib/components/DispatchOre.svelte -->
<script>
    import { enhance } from '$app/forms';
  
    // Optional initial form from parent
    export let form = null;
  
    // Context + lists
    export let stationCode = 'JSS';
    export let stations = ['JSS', 'PSS', 'KEF'];
    export let grades   = ['WL', 'WC', 'WF', 'GL', 'GC', 'GF'];
  
    // Local state to display errors / sticky values
    let localForm = form;
  
    $: destinationOptions = stations.filter((s) => s !== stationCode);
    const v = (k, d = '') => localForm?.values?.[k] ?? d;
  
    // Correct enhance signature: first call receives submit info,
    // then we RETURN a function that gets { result, update }.
    const onEnhance = ({ form, data, action, cancel, submitter }) => {
      return async ({ result, update }) => {
        if (result.type === 'failure') {
          // fail(400, { message, values }) from the action
          localForm = result.data;
          return; // stay on page and show error
        }
        // success or redirect → let SvelteKit handle it
        await update();
      };
    };
  </script>
  
  {#if localForm?.message}
    <div role="alert"
         class="mb-3 rounded-lg border border-red-600/40 bg-red-900/30 px-3 py-2 text-red-200">
      {localForm.message}
    </div>
  {/if}
  
  <form
    method="post"
    action="/stations?/dispatch"     
    use:enhance={onEnhance}
    class="space-y-4"
  >
    <input type="hidden" name="fromStation" value={stationCode} />
  
    <label class="flex flex-col gap-1">
      <span class="text-sm text-slate-400">To Station</span>
      <select name="toStation" required
        class="rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-slate-100 outline-none focus:border-slate-600 focus:ring-2 focus:ring-sky-400">
        <option value="">-- Select destination --</option>
        {#each destinationOptions as s}
          <option value={s} selected={v('toStation') === s}>{s}</option>
        {/each}
      </select>
    </label>
  
    <label class="flex flex-col gap-1">
      <span class="text-sm text-slate-400">Truck No</span>
      <input name="truckNo" type="text" required
        class="rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-slate-100 outline-none placeholder-slate-500 focus:border-slate-600 focus:ring-2 focus:ring-sky-400"
        placeholder="e.g. LES-1234" value={v('truckNo')} />
    </label>
  
    <label class="flex flex-col gap-1">
      <span class="text-sm text-slate-400">Weight (tons)</span>
      <input name="weightTon" type="number" min="0.001" step="0.001" required
        class="rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-slate-100 outline-none placeholder-slate-500 focus:border-slate-600 focus:ring-2 focus:ring-sky-400"
        placeholder="e.g. 20" value={v('weightTon')} />
    </label>
  
    <label class="flex flex-col gap-1">
      <span class="text-sm text-slate-400">Grade (optional)</span>
      <select name="gradeCode"
        class="rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-slate-100 outline-none focus:border-slate-600 focus:ring-2 focus:ring-sky-400">
        <option value="" selected={!v('gradeCode')}>-- Optional --</option>
        {#each grades as g}
          <option value={g} selected={v('gradeCode') === g}>{g}</option>
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
  