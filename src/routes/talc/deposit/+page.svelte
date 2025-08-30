<!-- /src/routes/talc/deposit/+page.svelte -->
<script lang="ts">
  import { enhance } from "$app/forms";
  export let data: {
    stationCode: string;
    grades: string[];
    oreOptions: { id: number; label: string }[];
  };
  export let form: any;
</script>

<div class="min-h-screen bg-[#0b1018] text-[#e6ebf1]">
  <div class="mx-auto max-w-2xl p-6 space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-semibold tracking-tight">Talc — Deposit</h1>
      <p class="text-sm text-[#9fb0c5]">
        Station: <span class="font-medium text-[#e6ebf1]">{data.stationCode}</span>
      </p>
    </header>

    {#if form?.success}
      <div class="rounded-md border border-green-700/60 bg-green-900/20 p-3 text-green-200 text-sm">
        Deposit recorded. ID: <strong class="text-green-100">{form.depositId}</strong>
      </div>
    {/if}

    {#if form?.error}
      <div class="rounded-md border border-red-700/60 bg-red-900/30 p-3 text-red-300 text-sm">
        {form.error}
      </div>
    {/if}

    <form method="POST" action="?/deposit" use:enhance class="space-y-5">
      <!-- Station provided by loader -->
      <input type="hidden" name="stationCode" value={data.stationCode} />

      <section class="rounded-xl border border-[#1c2433] bg-[#0f1521]/90 p-4 shadow-lg shadow-black/20">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Weight -->
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
              placeholder="e.g. 12.50"
              value={form?.values?.weightTon}
            />
            {#if form?.errors?.weightTon}
              <p class="text-xs text-red-300">{form.errors.weightTon}</p>
            {/if}
          </div>

          <!-- Grade -->
          <div class="grid gap-2">
            <label class="text-sm text-[#9fb0c5]" for="gradeCode">Grade</label>
            <select
              id="gradeCode"
              name="gradeCode"
              required
              class="w-full rounded-md border border-[#1c2433] bg-[#0f1521] px-3 py-2 text-[#e6ebf1] focus:outline-none focus:ring-2 focus:ring-[#23324a]"
            >
              <option value="" disabled selected={!(form?.values?.gradeCode)}>
                — select grade —
              </option>
              {#each data.grades as g}
                <option value={g} selected={form?.values?.gradeCode === g}>{g}</option>
              {/each}
            </select>
            {#if form?.errors?.gradeCode}
              <p class="text-xs text-red-300">{form.errors.gradeCode}</p>
            {/if}
          </div>
        </div>

        <!-- Source Ore (optional) -->
        <div class="mt-4 grid gap-2">
          <div class="flex items-center justify-between">
            <label class="text-sm text-[#9fb0c5]" for="oreTransportId">Source Ore Transport (optional)</label>
            <span class="text-[11px] text-[#7f8ca1]">
              Only received loads for {data.stationCode}
            </span>
          </div>

          <select
            id="oreTransportId"
            name="oreTransportId"
            class="w-full rounded-md border border-[#1c2433] bg-[#0f1521] px-3 py-2 text-[#e6ebf1] focus:outline-none focus:ring-2 focus:ring-[#23324a]"
          >
            <option value="">
              — {data.oreOptions?.length ? 'select received transport' : 'no received transports available'} —
            </option>
            {#if data.oreOptions?.length}
              {#each data.oreOptions as o}
                <option value={o.id} selected={String(form?.values?.oreTransportId ?? '') === String(o.id)}>
                  {o.label}
                </option>
              {/each}
            {/if}
          </select>

          {#if form?.errors?.oreTransportId}
            <p class="text-xs text-red-300">{form.errors.oreTransportId}</p>
          {/if}

          {#if !data.oreOptions?.length}
            <p class="text-xs text-[#9fb0c5]">
              Tip: Receive (unload) an in-transit ore first, then return to link it here.
            </p>
          {/if}
        </div>
      </section>

      <div class="pt-1">
        <button
          class="inline-flex items-center justify-center rounded-md bg-[#1a2a42] px-4 py-2 text-white transition hover:bg-[#23324a] focus:outline-none focus:ring-2 focus:ring-[#23324a]"
        >
          Deposit
        </button>
      </div>
    </form>
  </div>
</div>
