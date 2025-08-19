<script>
  import DispatchOre from '$lib/components/DispatchOre.svelte';
  export let form; // <-- action result arrives here after submit/fail
</script>

<div class="px-4 py-6">
  <!-- Top-level error banner -->
  {#if form?.message}
    <div role="alert"
         class="mb-4 rounded-xl border border-red-600/40 bg-red-900/30 px-4 py-3 text-red-100">
      {form.message}
    </div>
  {/if}

  <div class="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow">
    <h1 class="mb-4 text-2xl font-bold text-slate-100">Dispatch Ore — JSS</h1>
    <DispatchOre stationCode="JSS" {form} />
  </div>
</div>
