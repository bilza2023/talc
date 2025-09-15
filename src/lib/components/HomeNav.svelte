<script>
  import { createEventDispatcher } from 'svelte';

  export let items = [];      // ['dashboards'] or [{ name:'dashboards', icon:'🚀', label:'Dashboards' }]
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
  .home-nav {
    display: flex;
    gap: var(--spaceSm, 12px);
    padding: var(--spaceSm, 12px);
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
  }
  .item {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spaceXs, 6px);
    min-width: 72px;
  }
  .pill {
    width: var(--navBtnSize, 64px);
    height: var(--navBtnSize, 64px);
    border-radius: 9999px;
    border: 1px solid var(--borderColor, #2b3a36);
    background: color-mix(in srgb, var(--surfaceColor, #0f1a16) 80%, transparent);
    color: var(--primaryText, #e6ebf1);
    display: grid;
    place-items: center;
    box-shadow: var(--shadowSm, 0 2px 8px rgba(0,0,0,.2));
    transition: transform .12s ease, box-shadow .12s ease, background .12s ease, border-color .12s ease;
  }
  .pill:hover { transform: translateY(-1px); box-shadow: var(--shadowMd, 0 6px 14px rgba(0,0,0,.25)); }
  .pill:active { transform: translateY(0); box-shadow: var(--shadowSm, 0 2px 8px rgba(0,0,0,.2)); }
  .pill.active {
    background: linear-gradient(
      180deg,
      color-mix(in srgb, var(--brandColor, #0bb37d) 85%, white 15%),
      color-mix(in srgb, var(--brandColor, #0bb37d) 70%, black 10%)
    );
    color: var(--onBrand, #0b1813);
    border-color: transparent;
  }
  .icon { font-size: clamp(1.1rem, 4.5vw, 1.6rem); line-height: 1; }
  .label { font-size: .8rem; color: var(--secondaryText, #cfe0f5); text-transform: capitalize; }
  .label.active { color: var(--primaryText, #e6ebf1); font-weight: 600; }
  .pill:focus-visible { outline: 2px solid var(--focusColor, #66afe9); outline-offset: 3px; }
</style>
