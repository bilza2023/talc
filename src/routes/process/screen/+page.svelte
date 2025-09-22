<script lang="ts">
    import { enhance } from '$app/forms';
  
    // Enums / choices (sync with your Prisma enums)
    const shades = ['WHITE', 'GREY', 'LIGHTGREY', 'GREEN', 'MIXED'] as const;
    const sizes  = ['LUMPS', 'CHIPS', 'FINE'] as const;
  
    // For screening, raw → processed
    const fromCodes = ['ABS_RAW'] as const;
    const toCodes   = ['ABS_PROCESSED', 'PSS_PROCESSED'] as const; // allow flexibility if needed
  
    // Form state for client-side UX
    let fromMmaCode: string = fromCodes[0];
    let toMmaCode: string   = toCodes[0];
    let supplierId: number | '' = '';
    let shade: string = shades[0];
    let inputQty: number | '' = '';
  
    // Output splits (can add/remove rows)
    type OutputRow = { size: string; qty: number | ''; shade?: string };
    let outputs: OutputRow[] = [{ size: sizes[0], qty: '' }];
  
    function addRow() {
      outputs = [...outputs, { size: sizes[0], qty: '' }];
    }
    function removeRow(i: number) {
      outputs = outputs.filter((_, idx) => idx !== i);
    }
  
    // Keep a JSON mirror for <input name="outputs">
    $: outputsJson = JSON.stringify(
      outputs.map(o => ({
        size: o.size,
        qty: Number(o.qty || 0),
        // Optional per-row shade override; if blank, server uses overall shade
        ...(o.shade ? { shade: o.shade } : {})
      }))
    );
  
    // SvelteKit action result
    export let form: any;
  </script>
  
  <svelte:head>
    <title>Process → Screening (raw → processed)</title>
  </svelte:head>
  
  <div class="max-w-3xl mx-auto p-4 space-y-6">
    <h1 class="text-2xl font-semibold">Screening (raw → processed)</h1>
    <p class="text-sm text-gray-600">
      Convert <strong>rawMaterial3s</strong> stock into <strong>processed4s</strong> with split outputs (e.g., LUMPS/CHIPS).
    </p>
  
    <form method="POST" use:enhance class="space-y-4">
      <fieldset class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label class="flex flex-col gap-1">
          <span class="text-sm font-medium">From MMA (raw)</span>
          <select name="fromMmaCode" bind:value={fromMmaCode} required class="border rounded p-2">
            {#each fromCodes as code}
              <option value={code}>{code}</option>
            {/each}
          </select>
        </label>
  
        <label class="flex flex-col gap-1">
          <span class="text-sm font-medium">To MMA (processed)</span>
          <select name="toMmaCode" bind:value={toMmaCode} required class="border rounded p-2">
            {#each toCodes as code}
              <option value={code}>{code}</option>
            {/each}
          </select>
        </label>
  
        <label class="flex flex-col gap-1">
          <span class="text-sm font-medium">Supplier ID</span>
          <input name="supplierId" type="number" min="1" bind:value={supplierId} required class="border rounded p-2" />
        </label>
  
        <label class="flex flex-col gap-1">
          <span class="text-sm font-medium">Shade</span>
          <select name="shade" bind:value={shade} required class="border rounded p-2">
            {#each shades as s}
              <option value={s}>{s}</option>
            {/each}
          </select>
        </label>
  
        <label class="flex flex-col gap-1 md:col-span-2">
          <span class="text-sm font-medium">Input Quantity (total raw to consume)</span>
          <input name="inputQty" type="number" min="0.0001" step="0.0001" bind:value={inputQty} required class="border rounded p-2" />
        </label>
      </fieldset>
  
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <h2 class="font-medium">Output splits (to processed4s)</h2>
          <button type="button" class="border rounded px-3 py-1" on:click={addRow}>+ Add split</button>
        </div>
  
        <div class="space-y-2">
          {#each outputs as row, i}
            <div class="grid grid-cols-1 md:grid-cols-12 gap-2 items-end border rounded p-3">
              <label class="flex flex-col gap-1 md:col-span-4">
                <span class="text-sm">Size</span>
                <select bind:value={row.size} class="border rounded p-2">
                  {#each sizes as sz}
                    <option value={sz}>{sz}</option>
                  {/each}
                </select>
              </label>
  
              <label class="flex flex-col gap-1 md:col-span-4">
                <span class="text-sm">Qty</span>
                <input type="number" min="0.0001" step="0.0001" bind:value={row.qty} class="border rounded p-2" />
              </label>
  
              <label class="flex flex-col gap-1 md:col-span-3">
                <span class="text-sm">Shade override (optional)</span>
                <select bind:value={row.shade} class="border rounded p-2">
                  <option value=''>— inherit —</option>
                  {#each shades as s}
                    <option value={s}>{s}</option>
                  {/each}
                </select>
              </label>
  
              <div class="md:col-span-1">
                <button type="button" class="border rounded px-2 py-2 w-full" on:click={() => removeRow(i)}>✕</button>
              </div>
            </div>
          {/each}
        </div>
      </div>
  
      <!-- Hidden JSON for outputs -->
      <input type="hidden" name="outputs" value={outputsJson} />
  
      <div class="pt-2">
        <button type="submit" class="bg-black text-white rounded px-4 py-2">Run screening</button>
      </div>
    </form>
  
    {#if form?.error}
      <div class="bg-red-50 border border-red-200 text-red-700 p-3 rounded">
        <strong>Error:</strong> {form.error}
      </div>
    {/if}
  
    {#if form?.success}
      <div class="bg-green-50 border border-green-200 text-green-800 p-3 rounded space-y-2">
        <div class="font-medium">Screening recorded</div>
        <pre class="text-xs overflow-auto p-2 bg-white border rounded">{JSON.stringify(form.result, null, 2)}</pre>
      </div>
    {/if}
  </div>
  
  <style>
    /* minimal styles for readability if Tailwind isn't present */
    .text-gray-600 { color: #4b5563 }
    .border { border: 1px solid #e5e7eb }
    .rounded { border-radius: .5rem }
    .p-2 { padding: .5rem } .p-3 { padding: .75rem } .p-4 { padding: 1rem }
    .px-2 { padding-left:.5rem; padding-right:.5rem }
    .px-3 { padding-left:.75rem; padding-right:.75rem }
    .px-4 { padding-left:1rem; padding-right:1rem }
    .py-1 { padding-top:.25rem; padding-bottom:.25rem }
    .py-2 { padding-top:.5rem; padding-bottom:.5rem }
    .space-y-2 > * + * { margin-top: .5rem }
    .space-y-4 > * + * { margin-top: 1rem }
    .space-y-6 > * + * { margin-top: 1.5rem }
    .max-w-3xl { max-width: 48rem }
    .mx-auto { margin-left: auto; margin-right: auto }
    .grid { display: grid }
    .gap-1 { gap: .25rem } .gap-2 { gap: .5rem } .gap-4 { gap: 1rem }
    .items-end { align-items: end }
    .justify-between { justify-content: space-between }
    .w-full { width: 100% }
    .bg-black { background: #000 } .text-white { color: #fff }
    .bg-red-50 { background: #fef2f2 } .border-red-200 { border-color: #fecaca } .text-red-700 { color: #b91c1c }
    .bg-green-50 { background: #ecfdf5 } .border-green-200 { border-color: #a7f3d0 } .text-green-800 { color: #065f46 }
    .overflow-auto { overflow: auto }
  </style>
  