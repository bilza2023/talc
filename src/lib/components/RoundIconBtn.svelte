<!-- src/lib/components/RoundIconBtn.svelte -->
<script>
  export let href = "#";
  export let icon = "";
  export let label = "";
  export let size = "md";      // sm | md | lg
  export let variant = "solid"; // solid | outline
</script>

<a href={href} class="round-btn {size} {variant}">
  {#if icon}<span class="icon">{icon}</span>{/if}
  {#if label}<span class="label">{label}</span>{/if}
</a>

<style>
  .round-btn {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
    text-decoration: none;
    font-weight: 600;
    cursor: pointer;
    gap: 0.25rem;
    background: var(--primaryColor);
    color: white;
    padding: 0.75rem;
    transition: background 0.2s;
  }
  .round-btn:hover { background: var(--accentColor); }

  .round-btn.outline {
    background: transparent;
    border: 2px solid var(--primaryColor);
    color: var(--primaryColor);
  }

  .round-btn.sm { font-size: 0.75rem; padding: 0.5rem; }
  .round-btn.md { font-size: 0.875rem; padding: 0.75rem; }
  .round-btn.lg { font-size: 1rem; padding: 1rem; }

  .icon { font-size: 1.5em; }
  .label { font-size: 0.875em; }
</style>
