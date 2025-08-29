<!-- /src/routes/talc/dispatch/+page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  export let data: {
    stationCode: string;
    grades: string[];
    toStations: string[];
  };
  export let form: any;
</script>

<div class="max-w-xl mx-auto space-y-6">
  <header class="space-y-1">
    <h1 class="text-2xl font-semibold">Talc – Dispatch</h1>
    <p class="text-sm text-gray-500">From station: <span class="font-medium">{data.stationCode}</span></p>
  </header>

  {#if form?.success}
    <div class="rounded-md bg-green-50 p-3 text-green-800 text-sm">
      Dispatch recorded from <strong>{form.station}</strong> to <strong>{form.toStation}</strong>.
    </div>
  {/if}

  {#if form?.error}
    <div class="rounded-md bg-red-50 p-3 text-red-800 text-sm">
      {form.error}
    </div>
  {/if}

  <form method="POST" action="?/dispatch" use:enhance class="space-y-4">
    <input type="hidden" name="stationCode" value={data.stationCode} />

    <div class="grid gap-2">
      <label class="text-sm font-medium" for="toStation">To Station</label>
      <select
        id="toStation"
        name="toStation"
        required
        class="w-full rounded-md border px-3 py-2"
        value={form?.values?.toStation}
      >
        <option value="" disabled selected>Select destination</option>
        {#each data.toStations as s}
          <option value={s}>{s}</option>
        {/each}
      </select>
      {#if form?.errors?.toStation}
        <p class="text-xs text-red-600">{form.errors.toStation}</p>
      {/if}
    </div>

    <div class="grid gap-2">
      <label class="text-sm font-medium" for="truckNo">Truck #</label>
      <input
        id="truckNo"
        name="truckNo"
        type="text"
        required
        class="w-full rounded-md border px-3 py-2"
        placeholder="e.g. TR-123"
        value={form?.values?.truckNo}
      />
      {#if form?.errors?.truckNo}
        <p class="text-xs text-red-600">{form.errors.truckNo}</p>
      {/if}
    </div>

    <div class="grid gap-2">
      <label class="text-sm font-medium" for="weightTon">Weight (tons)</label>
      <input
        id="weightTon"
        name="weightTon"
        type="number"
        step="0.01"
        min="0.01"
        required
        class="w-full rounded-md border px-3 py-2"
        value={form?.values?.weightTon}
      />
      {#if form?.errors?.weightTon}
        <p class="text-xs text-red-600">{form.errors.weightTon}</p>
      {/if}
    </div>

    <div class="grid gap-2">
      <label class="text-sm font-medium" for="gradeCode">Grade</label>
      <select
        id="gradeCode"
        name="gradeCode"
        required
        class="w-full rounded-md border px-3 py-2"
        value={form?.values?.gradeCode}
      >
        <option value="" disabled selected>Select grade</option>
        {#each data.grades as g}
          <option value={g}>{g}</option>
        {/each}
      </select>
      {#if form?.errors?.gradeCode}
        <p class="text-xs text-red-600">{form.errors.gradeCode}</p>
      {/if}
    </div>

    <div class="pt-2">
      <button class="rounded-md bg-black text-white px-4 py-2">Dispatch</button>
    </div>
  </form>
</div>
