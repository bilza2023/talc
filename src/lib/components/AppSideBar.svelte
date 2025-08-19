<script>
  // Props
  export let entries = []; // [{ title, url, type?: 'normal'|'heading', icon?: '…' }]
  export let textColor = "text-zinc-100";
  export let bgColor = "bg-zinc-900";
  export let collapsed = false; // bindable
  export let activeUrl = ""; // optional

  const toggle = () => (collapsed = !collapsed);

  // Icon: provided or first letter
  const getIcon = (e) =>
    e.icon || (e.title || "?").trim().charAt(0).toUpperCase() || "?";
  const isActive = (e) => activeUrl && e.url && activeUrl === e.url;

  // Group flat entries by headings
  $: groups = (() => {
    const out = [];
    let cur = { key: "root", title: null, items: [] };
    entries.forEach((e, i) => {
      if (e.type === "heading") {
        if (cur.title !== null || cur.items.length) out.push(cur);
        cur = {
          key: e.title || `heading-${i}`,
          title: e.title || "",
          items: [],
          icon: e.icon,
        };
      } else {
        cur.items.push(e);
      }
    });
    out.push(cur);
    return out;
  })();

  // Per-heading open state (default open)
  let open = {};
  $: groups.forEach((g) => {
    if (g.title && open[g.key] === undefined) open[g.key] = true;
  });
  const toggleSection = (key) => (open[key] = !open[key]);
</script>

<aside
  class={`h-screen ${bgColor} ${textColor} flex flex-col shadow-xl
          ${collapsed ? "w-16" : "w-64"} transition-[width] duration-300`}
  aria-label="App sidebar"
  aria-expanded={!collapsed}
>
  <!-- Top bar -->
  <div class="flex items-center justify-between h-14 px-2">
    {#if !collapsed}{/if}
    <button
      class="grid place-items-center w-9 h-9 rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-sky-400"
      on:click={toggle}
      type="button"
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      title={collapsed ? "Expand" : "Collapse"}
    >
      {#if collapsed}»{:else}«{/if}
    </button>
  </div>

  <!-- Links -->
  <nav class="flex-1 overflow-y-auto px-2 space-y-1">
    {#each groups as g (g.key)}
      {#if g.title}
        {#if !collapsed}
          <!-- Collapsible heading -->
          <button
            class="mt-4 mb-1 w-full flex items-center gap-2 px-2 text-[11px] uppercase tracking-wider text-zinc-400 hover:text-zinc-200"
            on:click={() => toggleSection(g.key)}
            aria-expanded={open[g.key]}
            type="button"
          >
            <span class="w-4 text-center">{open[g.key] ? "▾" : "▸"}</span>
            <span class="truncate">{g.title}</span>
          </button>
        {:else}
          <div class="mt-3 mb-2 h-px bg-white/10 mx-1" aria-hidden="true"></div>
        {/if}

        <!-- Children -->
        <!-- show items if the group is open OR the whole sidebar is collapsed -->
        {#if collapsed || open[g.key]}
          {#each g.items as e}
            <a
              href={e.url}
              class={`group flex items-center gap-3 rounded-lg px-2 py-2 text-sm
            hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-sky-400
            ${isActive(e) ? "bg-white/10 ring-1 ring-white/20" : ""}`}
              title={collapsed ? e.title : undefined}
            >
              <span
                class="grid place-items-center text-base w-9 h-9 shrink-0 rounded-md bg-white/5"
              >
                {getIcon(e)}
              </span>
              <span
                class={`whitespace-nowrap ${collapsed ? "sr-only" : "block"}`}
                >{e.title}</span
              >
            </a>
          {/each}
        {/if}
      {:else}
        <!-- Ungrouped items (before first heading) -->
        {#each g.items as e}
          <a
            href={e.url}
            class={`group relative flex items-center gap-3 rounded-lg px-2 py-2 text-sm
                    hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-sky-400
                    ${isActive(e) ? "bg-white/10 ring-1 ring-white/20" : ""}`}
            title={collapsed ? e.title : undefined}
          >
            <span
              class="grid place-items-center text-base w-9 h-9 shrink-0 rounded-md bg-white/5"
            >
              {getIcon(e)}
            </span>
            <span class={`whitespace-nowrap ${collapsed ? "sr-only" : "block"}`}
              >{e.title}</span
            >
          </a>
        {/each}
      {/if}
    {/each}
  </nav>

  <div class="p-2">
    {#if !collapsed}
      <div class="text-[10px] text-zinc-400/90 px-2">v1.0</div>
    {/if}
  </div>
</aside>
