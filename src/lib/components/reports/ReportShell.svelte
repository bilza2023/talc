<script>
    import { onMount } from 'svelte';
  
    export let title = '';
    export let tabs = []; // [{ label, href }]
    export let dateRange = ''; // e.g., 'Last 30 days'
    export let activeHref = ''; // optional; falls back to window.location.pathname
  
    let pathname = '';
    onMount(() => {
      pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    });
  
    const isActive = (href) => (activeHref ? activeHref === href : pathname === href);
  </script>
  
  <section class="shell">
    <header class="head">
      <div class="lh">
        <h1>{title}</h1>
        {#if dateRange}<p class="range">{dateRange}</p>{/if}
      </div>
      <div class="rh">
        <slot name="actions" />
      </div>
    </header>
  
    {#if tabs?.length}
      <nav class="tabs" aria-label="Report sections">
        {#each tabs as t}
          <a class:active={isActive(t.href)} href={t.href}>{t.label}</a>
        {/each}
      </nav>
    {/if}
  
    <div class="content">
      <slot />
    </div>
  </section>
  
  <style>
    .shell {
      --bg: var(--backgroundColor, #0b0b0c);
      --fg: var(--primaryText, #e9e9ea);
      --muted: var(--mutedText, #a3a3a3);
      --card: var(--panelBg, #151518);
      --border: var(--borderColor, #2a2a2e);
      --accent: var(--accent, #6ee7ff);
  
      color: var(--fg);
    }
  
    .head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: .75rem;
      padding: .75rem 1rem 0;
    }
    h1 {
      margin: 0;
      font-size: clamp(1.05rem, 1rem + 1vw, 1.4rem);
      line-height: 1.2;
      letter-spacing: 0.2px;
    }
    .range {
      margin: .25rem 0 0;
      color: var(--muted);
      font-size: .9rem;
    }
    .tabs {
      display: flex;
      gap: .5rem;
      overflow-x: auto;
      padding: .5rem 1rem 0.25rem;
      border-bottom: 1px solid var(--border);
    }
    .tabs a {
      white-space: nowrap;
      padding: .5rem .75rem;
      border-radius: 999px;
      color: var(--muted);
      text-decoration: none;
      border: 1px solid var(--border);
      background: var(--card);
      transition: all .15s ease;
    }
    .tabs a:hover { color: var(--fg); border-color: var(--accent); }
    .tabs a.active {
      color: var(--fg);
      border-color: var(--accent);
      box-shadow: 0 0 0 1px color-mix(in oklab, var(--accent) 50%, transparent);
    }
    .content {
      padding: 1rem;
      max-width: 1200px;
      margin: 0 auto;
    }
  
    @media (min-width: 800px) {
      .head { padding: 1.25rem 1rem 0; }
      .tabs { padding-left: 1rem; padding-right: 1rem; }
    }
  </style>
  