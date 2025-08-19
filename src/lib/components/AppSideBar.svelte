<script>
  // Props
  export let entries = [];                  // [{ title, url, type?: 'normal'|'heading', icon?: '…' }]
  export let textColor = 'text-zinc-100';   // Tailwind class for text color
  export let bgColor = 'bg-zinc-900';       // Tailwind class for background
  export let collapsed = false;             // bindable
  export let activeUrl = '';                // optional: highlight current link

  const toggle = () => (collapsed = !collapsed);

  // Use provided icon; fallback to title initial
  const getIcon = (e) => {
    if (e.icon) return e.icon;
    const ch = (e.title || '?').trim().charAt(0).toUpperCase() || '?';
    return ch;
  };

  const isActive = (e) => activeUrl && e.url && activeUrl === e.url;
</script>

<aside
  class={`h-screen ${bgColor} ${textColor} flex flex-col shadow-xl
          ${collapsed ? 'w-16' : 'w-64'} transition-[width] duration-300`}
  aria-label="App sidebar"
  aria-expanded={!collapsed}
>
  <!-- Top bar -->
  <div class="flex items-center justify-between h-14 px-2">
    {#if !collapsed}
      <span class="text-sm font-semibold tracking-wide">Navigation</span>
    {/if}
    <button
      class="grid place-items-center w-9 h-9 rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-sky-400"
      on:click={toggle}
      type="button"
      aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      title={collapsed ? 'Expand' : 'Collapse'}
    >
      {#if collapsed}»{:else}«{/if}
    </button>
  </div>

  <!-- Links -->
  <nav class="flex-1 overflow-y-auto px-2 space-y-1">
    {#each entries as e}
      {#if e.type === 'heading'}
        {#if !collapsed}
          <div class="mt-4 mb-1 px-2 text-[11px] uppercase tracking-wider text-zinc-400">{e.title}</div>
        {:else}
          <div class="mt-3 mb-2 h-px bg-white/10 mx-1" aria-hidden="true"></div>
        {/if}
      {:else}
        <a
          href={e.url}
          class={`group relative flex items-center gap-3 rounded-lg px-2 py-2 text-sm
                  hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-sky-400
                  ${isActive(e) ? 'bg-white/10 ring-1 ring-white/20' : ''}`}
          title={collapsed ? e.title : undefined}
        >
          <!-- Icon -->
          <span class="grid place-items-center text-base w-9 h-9 shrink-0 rounded-md bg-white/5">
            {getIcon(e)}
          </span>

          <!-- Label -->
          <span class={`whitespace-nowrap ${collapsed ? 'sr-only' : 'block'}`}>{e.title}</span>
        </a>
      {/if}
    {/each}
  </nav>

  <div class="p-2">
    {#if !collapsed}
      <div class="text-[10px] text-zinc-400/90 px-2">v1.0</div>
    {/if}
  </div>
</aside>
