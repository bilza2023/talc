<script>
  import { createEventDispatcher } from 'svelte';

  export let items = [];      // ['dashboards'] or [{ name, icon, label }]
  export let value = '';
  export let iconMap = {};    // { dashboards:'🚀', stations:'🏗️', admin:'⚙️' }

  const dispatch = createEventDispatcher();

  $: list = items.map(x => {
    const name  = typeof x === 'string' ? x : (x.name ?? '');
    const icon  = typeof x === 'string' ? (iconMap[name] ?? '') : (x.icon ?? iconMap[name] ?? '');
    const label = typeof x === 'string' ? name : (x.label ?? name);
    return { name, icon, label };
  });

  function select(name){
    value = name;
    dispatch('change', name);
  }
</script>

<nav class="home-nav" role="tablist" aria-label="Categories">
  {#each list as it}
    <div class="item">
      <button
        type="button"
        role="tab"
        class="pill {value === it.name ? 'active' : ''}"
        aria-selected={value === it.name}
        aria-label={it.label}
        on:click={() => select(it.name)}
      >
        <span class="icon">{it.icon || (it.name?.[0]?.toUpperCase() ?? '•')}</span>
      </button>
      <span class="label {value === it.name ? 'active' : ''}">{it.label}</span>
    </div>
  {/each}
</nav>

<style>
  /* Container */
  .home-nav {
    display: flex;
    gap: 12px;
    padding: 12px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
    background: var(--backgroundColor);
  }

  .item {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    min-width: 72px;
  }

  /* Pill buttons */
  .pill {
    width: var(--navBtnSize, 64px);
    height: var(--navBtnSize, 64px);
    border-radius: 9999px;
    border: 1px solid var(--borderColor);
    background: var(--surfaceColor);
    color: var(--baseTextColor);     /* ✅ text follows theme base text */
    display: grid;
    place-items: center;
    transition: transform .12s ease, border-color .12s ease, background .12s ease, color .12s ease;
  }

  .pill:hover {
    transform: translateY(-1px);
    border-color: var(--primaryColor);
  }

  .pill:active {
    transform: translateY(0);
  }

  .pill:focus-visible {
    outline: 2px solid var(--primaryColor);
    outline-offset: 3px;
  }

  .pill.active {
    background: var(--primaryColor);
    border-color: var(--primaryColor);
    color: var(--backgroundColor); /* good contrast when active */
  }

  /* Labels */
  .icon {
    font-size: clamp(1.1rem, 4.5vw, 1.6rem);
    line-height: 1;
  }

  .label {
    font-size: 0.8rem;
    color: var(--baseTextColor);   /* ✅ now uses baseTextColor */
    text-transform: capitalize;
    transition: color .12s ease;
  }

  .label.active {
    color: var(--baseTextColor);   /* stays same, not black */
    font-weight: 600;
  }
</style>
