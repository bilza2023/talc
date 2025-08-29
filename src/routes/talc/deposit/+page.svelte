<!-- /src/routes/talc/deposit/+page.svelte -->
<script lang="ts">
  import { enhance } from "$app/forms";
  import { page } from "$app/stores";
  export let data: {
    stationCode: string;
    grades: string[];
  };
  export let form: any;
</script>

<div class="min-h-screen bg-[#0b1018] text-[#e6ebf1]">
  <div class="mx-auto max-w-2xl p-6 space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-semibold">Talc – Deposit</h1>
      <p class="text-sm text-[#9fb0c5]">
        Station: <span class="font-medium text-[#e6ebf1]">{data.stationCode}</span>
      </p>
    </header>

    {#if form?.success}
      <div class="rounded-md border border-green-700/60 bg-green-900/30 p-3 text-green-300 text-sm">
        Deposit recorded. ID: <strong class="text-green-200">{form.depositId}</strong>
      </div>
    {/if}

    {#if form?.error}
      <div class="rounded-md border border-red-700/60 bg-red-900/30 p-3 text-red-300 text-sm">
        {form.error}
      </div>
    {/if}

    <form method="POST" action="?/deposit" use:enhance class="space-y-4">
      <!-- Station is provided from loader -->
      <input type="hidden" name="stationCode" value={data.stationCode} />

      <div class="grid gap-2">
        <label class="text-sm text-[#9fb0c5]" for="weightTon">Weight (tons)</label>
        <input
          id="weightTon"
          name="weightTon"
          type="number"
          step="0.01"
          min="0.01"
          required
          class="w-full rounded-md border border-[#1c2433] bg-[#0f1521] px-3 py-2 text-[#e6ebf1] placeholder-[#9fb0c5] focus:outline-none focus:ring-2 focus:ring-[#23324a]"
          value={form?.values?.weightTon}
        />
        {#if form?.errors?.weightTon}
          <p class="text-xs text-red-300">{form.errors.weightTon}</p>
        {/if}
      </div>

      <div class="grid gap-2">
        <label class="text-sm text-[#9fb0c5]" for="gradeCode">Grade</label>
        <select
          id="gradeCode"
          name="gradeCode"
          required
          class="w-full rounded-md border border-[#1c2433] bg-[#0f1521] px-3 py-2 text-[#e6ebf1] focus:outline-none focus:ring-2 focus:ring-[#23324a]"
          value={form?.values?.gradeCode}
        >
          <option value="" disabled selected>Select grade</option>
          {#each data.grades as g}
            <option value={g}>{g}</option>
          {/each}
        </select>
        {#if form?.errors?.gradeCode}
          <p class="text-xs text-red-300">{form.errors.gradeCode}</p>
        {/if}
      </div>

      <!-- Optional traceability link to an OreTransport -->
      <div class="grid gap-2">
        <label class="text-sm text-[#9fb0c5]" for="oreTransportId">
          Source Ore Transport (optional)
        </label>
        <input
          id="oreTransportId"
          name="oreTransportId"
          type="number"
          min="1"
          class="w-full rounded-md border border-[#1c2433] bg-[#0f1521] px-3 py-2 text-[#e6ebf1] placeholder-[#9fb0c5] focus:outline-none focus:ring-2 focus:ring-[#23324a]"
          placeholder="Enter OreTransport ID (if applicable)"
          value={form?.values?.oreTransportId}
        />
        {#if form?.errors?.oreTransportId}
          <p class="text-xs text-red-300">{form.errors.oreTransportId}</p>
        {/if}
      </div>

      <div class="pt-2">
        <button class="rounded-md bg-[#1a2a42] hover:bg-[#23324a] text-white px-4 py-2 transition">
          Deposit
        </button>
      </div>
    </form>
  </div>
</div>
