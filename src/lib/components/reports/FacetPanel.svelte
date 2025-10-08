<script>
    import { createEventDispatcher } from 'svelte';
  
    // facets: [
    //   { key, label, type: 'select'|'chips', options: string[], value?: string }
    // ]
    export let facets = [];
  
    const dispatch = createEventDispatcher();
  
    function update(key, value) {
      const next = Object.fromEntries(facets.map(f => [f.key, f.value ?? '']));
      next[key] = value;
      dispatch('change', next);
    }
  
    function isActive(f, opt) {
      return (f.value ?? '') === String(opt);
    }
  </script>
  
  <div class="panel">
    {#each facets as f}
      <div class="facet">
        <label class="flabel">{f.label}</label>
  
        {#if f.type === 'select'}
          <select bind:value={f.value} on:change={(e)=>update(f.key, e.target.value)}>
            {#each f.options as opt}
              <option value={opt}>{opt}</option>
            {/each}
          </select>
        {:else if f.type === 'chips'}
          <div class="chips">
            {#each f.options as opt}
              <button
                type="button"
                class:active={isActive(f, opt)}
                on:click={() => { f.value = String(opt); update(f.key, f.value); }}>
                {opt}
              </button>
            {/each}
          </div>
        {/if}
      </div>
    {/each}
  </div>
  
  <style>
    .panel {
      display: grid;
      gap: .75rem;
      background: var(--panelBg, #141417);
      border: 1px solid var(--borderColor, #2a2a2e);
      border-radius: 12px;
      padding: .75rem;
    }
    .facet { display: grid; gap: .4rem; }
    .flabel { color: var(--mutedText, #a3a3a3); font-size: .9rem; }
  
    select {
      width: 100%;
      padding: .55rem .65rem;
      border-radius: 10px;
      background: var(--inputBg, #0f0f12);
      color: var(--primaryText, #e9e9ea);
      border: 1px solid var(--borderColor, #2a2a2e);
    }
  
    .chips { display: flex; flex-wrap: wrap; gap: .4rem; }
    .chips button {
      padding: .45rem .65rem;
      border-radius: 999px;
      border: 1px solid var(--borderColor, #2a2a2e);
      background: var(--chipBg, #121216);
      color: var(--primaryText, #e9e9ea);
      font-size: .9rem;
    }
    .chips button.active {
      border-color: var(--accent, #6ee7ff);
      box-shadow: 0 0 0 1px color-mix(in oklab, var(--accent, #6ee7ff) 45%, transparent);
    }
  </style>
  