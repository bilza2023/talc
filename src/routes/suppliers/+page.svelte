<!-- /home/bilal-tariq/ab/src/routes/suppliers/+page.svelte -->
<script>
  export let data;
  let { suppliers = [] } = data ?? {};

  // simple client-side helpers
  const fmtId = (n) => (n == null ? '—' : Number(n));
</script>

<div class="min-h-screen bg-gradient-to-b from-[#0a0d13] to-[#0b1018] text-[#e6ebf1]">
  <div class="mx-auto max-w-5xl px-4 py-8 space-y-8">
    <header class="space-y-1">
      <h1 class="text-2xl font-semibold tracking-tight">Suppliers</h1>
      <p class="text-sm text-[#9fb0c5]">Create, edit, and remove supplier records.</p>
    </header>

    <!-- Create Supplier -->
    <section class="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur">
      <h2 class="text-lg font-semibold mb-4">Add New Supplier</h2>
      <form method="post" action="?/create" class="grid gap-4 sm:grid-cols-3">
        <label class="flex flex-col gap-1">
          <span class="text-sm text-[#9fb0c5]">Code</span>
          <input name="code" class="rounded-md bg-black/20 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-600" required />
        </label>
        <label class="flex flex-col gap-1 sm:col-span-2">
          <span class="text-sm text-[#9fb0c5]">Name</span>
          <input name="name" class="rounded-md bg-black/20 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-600" required />
        </label>
        <div class="sm:col-span-3">
          <button class="rounded-lg bg-emerald-700/80 hover:bg-emerald-700 px-4 py-2 font-medium">
            Create
          </button>
        </div>
      </form>
    </section>

    <!-- Supplier List (inline update & delete) -->
    <section class="space-y-3">
      <h2 class="text-lg font-semibold">All Suppliers</h2>
      <div class="overflow-x-auto rounded-xl border border-white/10">
        <table class="min-w-full text-sm">
          <thead class="bg-white/5 text-left text-[#9fb0c5]">
            <tr>
              <th class="px-4 py-3 font-medium">ID</th>
              <th class="px-4 py-3 font-medium">Code</th>
              <th class="px-4 py-3 font-medium">Name</th>
              <th class="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {#if suppliers.length}
              {#each suppliers as s}
                <tr class="even:bg-white/[0.03] align-top">
                  <td class="px-4 py-3">{fmtId(s.id)}</td>
                  <td class="px-4 py-3">
                    <form method="post" action="?/update" class="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <input type="hidden" name="id" value={s.id} />
                      <input
                        name="code"
                        value={s.code}
                        class="w-36 rounded-md bg-black/20 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-600"
                        required
                      />
                      <input
                        name="name"
                        value={s.name}
                        class="min-w-[16rem] rounded-md bg-black/20 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-600"
                        required
                      />
                      <button class="rounded-lg bg-sky-700/80 hover:bg-sky-700 px-3 py-2 font-medium">
                        Save
                      </button>
                    </form>
                  </td>
                  <td class="px-4 py-3"></td>
                  <td class="px-4 py-3">
                    <form method="post" action="?/delete" on:submit={() => confirm('Delete this supplier?') || event.preventDefault()}>
                      <input type="hidden" name="id" value={s.id} />
                      <button class="rounded-lg bg-rose-700/80 hover:bg-rose-700 px-3 py-2 font-medium">
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              {/each}
            {:else}
              <tr>
                <td class="px-4 py-6 text-center text-[#9fb0c5]" colspan="4">No suppliers yet.</td>
              </tr>
            {/if}
          </tbody>
        </table>
      </div>
    </section>
  </div>
</div>
