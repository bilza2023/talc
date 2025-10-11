<script>
  import { createEventDispatcher } from 'svelte';

  // Accept either: ['stations','dashboards',...] or
  // [{ name:'stations', label:'Stations', icon:'🏗️' }, ...]
  export let items = [];
  export let value = '';             // current selected tab name
  export let iconMap = {};           // optional: { stations:'🏗️', ... }

  const dispatch = createEventDispatcher();

  $: list = (items ?? []).map((x) => {
    const name  = typeof x === 'string' ? x : (x?.name ?? '');
    const label = typeof x === 'string' ? x : (x?.label ?? name);
    const icon  = typeof x === 'string'
      ? (iconMap?.[name] ?? '')
      : (x?.icon ?? iconMap?.[name] ?? '');
    return { name, label, icon };
  });

  function select(name) {
    if (value !== name) {
      value = name;                 // enables bind:value if used
      dispatch('change', name);     // e.detail is a STRING (the name)
    }
  }
</script>
<nav class="home-nav" role="tablist" aria-label="Categories">
  {#each list as it (it.name)}
    <button
      type="button"
      class="tab {value === it.name ? 'is-active' : ''}"
      role="tab"
      aria-selected={value === it.name}
      on:click={() => select(it.name)}
      style="display:inline-flex;flex-direction:column;align-items:center;justify-content:center;gap:.35rem;text-align:center;"
    >
      {#if it.icon}
        <span class="icon" style="margin:0">{it.icon}</span>
      {/if}
      <span class="label">{it.label}</span>
    </button>
  {/each}
</nav>

<style>
  .label {
    font-size: 0.75rem;
  }
  /* Wrapper: unchanged except tokens only */
  .home-nav-wrap {
    display: flex;
    justify-content: center;
    width: 100%;
    padding: var(--spaceXs, 8px) var(--spaceSm, 12px);
    margin-inline: auto;
    overflow: hidden;
  }

  /* Inner nav */
  :global(nav.home-nav) {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: flex-start;   /* center on >=640px below */
    gap: var(--home-nav-gap, 0.5rem);
    width: 100%;
    max-width: 100vw;
    box-sizing: border-box;
    padding-inline: var(--spaceSm, 12px);

    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    scroll-snap-type: x proximity;
  }
  :global(nav.home-nav::-webkit-scrollbar){ display:none; }

  /* Tabs: stacked (icon over text), tokens only */
  :global(nav.home-nav .tab) {
    flex: 0 0 auto;
    display: inline-flex;
    flex-direction: column;         /* icon on top, text under */
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    width: var(--navTabW, 84px);
    padding: 0.5rem;
    min-height: 64px;
    font-size: 0.92rem;
    text-align: center;
    scroll-snap-align: center;

    color: var(--primaryText);
    background: transparent;
    border: 1px solid var(--borderColor);
    border-radius: 9999px;
  }

  /* Selected: calm, token-mixed background */
  :global(nav.home-nav .tab.is-active) {
    background: color-mix(in srgb, var(--primaryColor) 12%, var(--surfaceColor) 88%);
    border-color: var(--primaryColor);
    color: var(--primaryText);
  }

  /* Icon badge (round) – tokens only */
  :global(nav.home-nav .tab .icon) {
    width: var(--navIconSize, 1.6rem);
    height: var(--navIconSize, 1.6rem);
    font-size: 0.95rem;
    line-height: 1;
    border-radius: 9999px;
    display: inline-grid;
    place-items: center;

    background: color-mix(in srgb, var(--surfaceColor) 85%, var(--backgroundColor) 15%);
    border: 1px solid var(--borderColor);
  }
  :global(nav.home-nav .tab.is-active .icon) {
    background: color-mix(in srgb, var(--primaryColor) 15%, var(--surfaceColor) 85%);
    border-color: var(--primaryColor);
  }

  /* Center strip on tablet/desktop */
  @media (min-width: 640px) {
    :global(nav.home-nav) {
      justify-content: center;
      padding-inline: var(--spaceMd, 16px);
    }
    :global(nav.home-nav .tab) {
      min-height: 70px;
    }
  }
</style>
