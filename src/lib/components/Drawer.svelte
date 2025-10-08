<script>
    import { slide } from 'svelte/transition';
  
    export let title = 'Menu';
    // Accept either ["href", ...] or [{ label, href }, ...]
    export let urls = [];
    export let startOpen = false; // optional
  
    let open = !!startOpen;
  
    const getItem = (u) =>
      typeof u === 'string'
        ? { label: u.replace(/^https?:\/\/|^\//, ''), href: u }
        : { label: u.label ?? u.href, href: u.href };
  </script>
  
  <div class="drawer">
    <button
      type="button"
      class="drawer__title"
      on:click={() => (open = !open)}
      aria-expanded={open}
      aria-controls="drawer-panel"
    >
      <span class="drawer__chev" aria-hidden="true">{open ? '▾' : '▸'}</span>
      <span>{title}</span>
    </button>
  
    {#if open}
      <nav id="drawer-panel" class="drawer__panel" transition:slide>
        <ul>
          {#each urls as u}
            {#key u}
              {#if getItem(u).href}
                <li>
                  <a class="drawer__link" href={getItem(u).href}>
                    {getItem(u).label}
                  </a>
                </li>
              {/if}
            {/key}
          {/each}
        </ul>
      </nav>
    {/if}
  </div>
  
  <style>
    .drawer {
      border: 1px solid var(--borderColor, #2b3a36);
      border-radius: var(--radiusLg, 10px);
      background: color-mix(in srgb, var(--surfaceColor, #0f1a16) 85%, transparent);
      overflow: hidden;
    }
  
    .drawer__title {
      width: 100%;
      display: flex;
      align-items: center;
      gap: .5rem;
      padding: .65rem .9rem;
      background: transparent;
      color: var(--primaryText, #e6ebf1);
      border: 0;
      cursor: pointer;
      text-align: left;
      font-weight: 600;
      letter-spacing: .2px;
    }
    .drawer__title:hover {
      background: color-mix(in srgb, var(--surfaceColor, #0f1a16) 70%, transparent);
    }
    .drawer__title:focus-visible {
      outline: 2px solid var(--focusColor, #66afe9);
      outline-offset: 2px;
    }
  
    .drawer__chev {
      width: 1.1em;
      text-align: center;
      opacity: .9;
    }
  
    .drawer__panel {
      padding: .25rem .25rem .6rem;
    }
    .drawer__panel ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .drawer__panel li + li {
      margin-top: .25rem;
    }
  
    .drawer__link {
      display: block;
      padding: .5rem .75rem;
      border-radius: var(--radiusMd, 8px);
      color: var(--primaryColor, #09f);
      text-decoration: none;
      background: color-mix(in srgb, var(--surfaceColor, #0f1a16) 92%, transparent);
      border: 1px solid transparent;
      transition: background .12s ease, border-color .12s ease;
    }
    .drawer__link:hover {
      background: color-mix(in srgb, var(--surfaceColor, #0f1a16) 80%, transparent);
      border-color: var(--borderColor, #2b3a36);
    }
  </style>
  