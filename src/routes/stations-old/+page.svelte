
<!-- src/routes/stations/+page.svelte -->
<script>
    export let form; // set when an action returns fail(...)
    const backHref = form?.values?.fromStation
      ? `/stations/${form.values.fromStation.toLowerCase()}/ore_dispatch`
      : '/stations/jss/ore_dispatch';
  </script>
  
  {#if form?.message}
    <div role="alert"
         class="mb-4 rounded-xl border border-red-600/40 bg-red-900/30 px-4 py-3 text-red-100">
      {form.message}
    </div>
    <a href={backHref}
       class="inline-flex items-center rounded-lg border border-slate-700 px-3 py-2 text-slate-100 hover:bg-slate-800/60">
      ⟵ Back to Dispatch
    </a>
  {:else}
    <div class="text-slate-400">This route processes station forms.</div>
  {/if}
  