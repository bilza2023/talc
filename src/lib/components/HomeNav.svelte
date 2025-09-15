<script>
    import { createEventDispatcher } from 'svelte';
    export let items = [];
    export let value = '';
  
    const dispatch = createEventDispatcher();
    function select(name) {
      value = name;
      dispatch('change', name);
    }
  </script>
  
  <!-- svelte-ignore a11y-no-noninteractive-element-to-interactive-role -->
  <nav class="home-nav" role="tablist" aria-label="Categories">
    {#each items as name}
      <button
        type="button"
        role="tab"
        class="tab {value === name ? 'active' : ''}"
        aria-selected={value === name}
        on:click={() => select(name)}
      >
        {name}
      </button>
    {/each}
  </nav>
  
  <style>
    .home-nav {
      display: flex;
      gap: .5rem;
      padding: .5rem;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: thin;
    }
    .tab {
      appearance: none;
      border: 1px solid var(--borderColor, #2b3a36);
      background: var(--surfaceColor, #0f1a16);
      color: var(--primaryText, #e6ebf1);
      padding: .5rem .75rem;
      border-radius: 999px;
      font-size: .9rem;
      white-space: nowrap;
    }
    .tab.active {
      background: var(--brandColor, #0bb37d);
      color: var(--onBrand, #0b1813);
      border-color: transparent;
      font-weight: 600;
    }
    .tab:focus-visible {
      outline: 2px solid var(--focusColor, #66afe9);
      outline-offset: 2px;
    }
  </style>
  