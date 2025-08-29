<!-- /src/routes/talc/unload/+page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  export let data: {
    stationCode: string;
    grades: string[];
  };
  export let form: any;
</script>

<div class="max-w-xl mx-auto space-y-6">
  <header class="space-y-1">
    <h1 class="text-2xl font-semibold">Talc – Unload</h1>
    <p class="text-sm text-gray-500">Receiving station: <span class="font-medium">{data.stationCode}</span></p>
  </header>

  {#if form?.success}
    <div class="rounded-md bg-green-50 p-3 text-green-800 text-sm">
      Transport <strong>{form.transportId}</strong> marked as <strong>{form.status}</strong>.
    </div>
  {/if}

  {#if form?.error}
    <div class="rounded-md bg-red-50 p-3 text-red-800 text-sm">
      {form.error}
    </div>
  {/if}

  <form method="POST" action="?/unload" use:enhance class="space-y-4">
    <input type="hidden" name="stationCode" value={data.stationCode} />

    <div class="grid gap-2">
      <label class="text-sm font-medium" for="transportId">Transport ID</label>
      <input
        id="transportId"
        name="transportId"
        type="number"
        min="1"
        required
        class="w-full rounded-md border px-3 py-2"
        placeholder="Enter Talc transport ID"
        value={form?.values?.transportId}
      />
      {#if form?.errors?.transportId}
        <p class="text-xs text-red-600">{form.errors.transportId}</p>
      {/if}
    </div>

    <div class="grid gap-2">
      <label class="text-sm font-medium" for="receiveWeightTon">Received Weight (tons)</label>
      <input
        id="receiveWeightTon"
        name="receiveWeightTon"
        type="number"
        step="0.01"
        min="0.01"
        required
        class="w-full rounded-md border px-3 py-2"
        value={form?.values?.receiveWeightTon}
      />
      {#if form?.errors?.receiveWeightTon}
        <p class="text-xs text-red-600">{form.errors.receiveWeightTon}</p>
      {/if}
    </div>

    <div class="grid gap-2">
      <label class="text-sm font-medium" for="receiveGradeCode">Received Grade</label>
      <select
        id="receiveGradeCode"
        name="receiveGradeCode"
        required
        class="w-full rounded-md border px-3 py-2"
        value={form?.values?.receiveGradeCode}
      >
        <option value="" disabled selected>Select grade</option>
        {#each data.grades as g}
          <option value={g}>{g}</option>
        {/each}
      </select>
      {#if form?.errors?.receiveGradeCode}
        <p class="text-xs text-red-600">{form.errors.receiveGradeCode}</p>
      {/if}
    </div>

    <div class="grid gap-2">
      <label class="text-sm font-medium" for="receivedBy">Received By</label>
      <input
        id="receivedBy"
        name="receivedBy"
        type="text"
        required
        class="w-full rounded-md border px-3 py-2"
        placeholder="Operator name"
        value={form?.values?.receivedBy}
      />
      {#if form?.errors?.receivedBy}
        <p class="text-xs text-red-600">{form.errors.receivedBy}</p>
      {/if}
    </div>

    <div class="pt-2">
      <button class="rounded-md bg-black text-white px-4 py-2">Mark Received</button>
    </div>
  </form>
</div>
