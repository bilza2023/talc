<script>
  import '$lib/styles/tokens.css';
  import '$lib/styles/themes.css';
  import Nav from '$lib/components/Nav.svelte';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  const THEME_DEFAULT = 'theme-royalBlue';
  let theme = browser ? (localStorage.getItem('theme') || THEME_DEFAULT) : THEME_DEFAULT;

  function applyTheme(t) {
    if (!browser) return;
    const root = document.documentElement;
    const keep = [...root.classList].filter(c => !c.startsWith('theme-'));
    root.className = keep.join(' ');
    root.classList.add(t);
    localStorage.setItem('theme', t);
  }

  onMount(() => applyTheme(theme));
  $: if (browser) applyTheme(theme); // runs only in browser when theme changes
</script>
<div class="app">
  <Nav title="Northwest Minerals" bind:theme />
  <slot />
</div>

<style>
  :global(html, body){ margin:0; padding:0; background:var(--backgroundColor); color:var(--primaryText); }
  .app{ min-height:100dvh; background:var(--backgroundColor); color:var(--primaryText); }
</style>
