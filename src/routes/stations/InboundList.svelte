<script>
  import '$lib/styles/tokens.css';

  // Props
  export let station = '';                // e.g. 'JSS'
  export let count = 0;                   // inbound trucks
  export let hrefBase = '/ore/receive';   // base path
  export let icon = '🚚';
  export let label = 'Receive';           // keep short to match RoundIconBtn
  export let size = 'lg';                 // 'sm' | 'md' | 'lg'
  export let variant = 'solid';           // 'solid' | 'soft' | 'outline'

  // Derived
  $: enabled = !!station && Number(count) > 0;
  $: href = enabled ? `${hrefBase}?station=${encodeURIComponent(station)}` : undefined;
  $: ariaLabel = `${label} at ${station}`;
</script>

{#if enabled}
  <a class="round-btn"
     data-size={size}
     data-variant={variant}
     href={href}
     aria-label={ariaLabel}
     title={ariaLabel}>
    <span class="icon">{icon}</span>
    <span class="text">{label}</span>
    <span class="badge">{count}</span>
  </a>
{:else}
  <span class="round-btn is-disabled"
        data-size={size}
        data-variant={variant}
        aria-disabled="true"
        title={`No inbound for ${station}`}>
    <span class="icon">🚫</span>
    <span class="text">{label}</span>
    <span class="badge zero">0</span>
  </span>
{/if}

<style>
  /* --- Round capsule look to match RoundIconBtn --- */
  .round-btn{
    --_bg: var(--surfaceColor);
    --_fg: var(--primaryText);
    --_bd: var(--borderColor);
    --_shadow: 0 2px 10px color-mix(in oklab, var(--primaryColor) 10%, transparent);
    --_hover-bg: color-mix(in oklab, var(--primaryColor) 10%, var(--surfaceColor));
    --_hover-bd: color-mix(in oklab, var(--primaryColor) 50%, var(--borderColor));

    display: inline-flex;
    align-items: center;
    gap: .6rem;
    text-decoration: none;
    user-select: none;

    background: var(--_bg);
    color: var(--_fg);
    border: 1px solid var(--_bd);
    border-radius: 9999px;
    box-shadow: var(--_shadow);
    transition: transform .06s ease, box-shadow .12s ease, background .12s ease, border-color .12s ease;
  }

  /* variants — mirror RoundIconBtn */
  .round-btn[data-variant="solid"]{
    --_bg: color-mix(in oklab, var(--primaryColor) 92%, black 0%);
    --_fg: var(--onPrimary, #fff);
    --_bd: color-mix(in oklab, var(--primaryColor) 80%, black 0%);
    --_hover-bg: color-mix(in oklab, var(--primaryColor) 85%, black 0%);
    --_hover-bd: color-mix(in oklab, var(--primaryColor) 90%, black 0%);
    --_shadow: 0 4px 18px color-mix(in oklab, var(--primaryColor) 22%, transparent);
  }
  .round-btn[data-variant="soft"]{
    --_bg: color-mix(in oklab, var(--primaryColor) 10%, var(--surfaceColor));
    --_fg: color-mix(in oklab, var(--primaryColor) 90%, var(--primaryText));
    --_bd: color-mix(in oklab, var(--primaryColor) 40%, var(--borderColor));
    --_hover-bg: color-mix(in oklab, var(--primaryColor) 16%, var(--surfaceColor));
    --_hover-bd: color-mix(in oklab, var(--primaryColor) 65%, var(--borderColor));
  }
  .round-btn[data-variant="outline"]{
    --_bg: transparent;
    --_fg: var(--primaryText);
    --_bd: color-mix(in oklab, var(--primaryColor) 70%, var(--borderColor));
    --_hover-bg: color-mix(in oklab, var(--primaryColor) 12%, transparent);
    --_hover-bd: color-mix(in oklab, var(--primaryColor) 85%, var(--borderColor));
  }

  /* sizes — match the feel of your RoundIconBtn sizes */
  .round-btn[data-size="sm"]{ padding: .4rem .75rem; font-size: .9rem; }
  .round-btn[data-size="md"]{ padding: .55rem .95rem; font-size: 1rem; }
  .round-btn[data-size="lg"]{ padding: .7rem 1.1rem; font-size: 1.05rem; }

  .round-btn:hover{
    background: var(--_hover-bg);
    border-color: var(--_hover-bd);
  }
  .round-btn:active{ transform: translateY(1px); }
  .round-btn:focus{
    outline: 3px solid color-mix(in oklab, var(--primaryColor) 35%, transparent);
    outline-offset: 2px;
  }
  .round-btn.is-disabled{
    pointer-events: none;
    opacity: .55;
    filter: grayscale(.15);
  }

  .icon{ font-size: 1.1em; line-height: 1; }
  .text{ font-weight: 700; letter-spacing: .2px; }

  /* badge matches the small pill you used on other round buttons */
  .badge{
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.6rem;
    height: 1.15rem;
    padding: 0 .4rem;
    border-radius: 9999px;
    font-size: .78rem;
    line-height: 1;
    border: 1px solid color-mix(in oklab, var(--secondaryColor) 60%, transparent);
    background: color-mix(in oklab, var(--secondaryColor) 18%, transparent);
    color: var(--onSecondary, var(--secondaryColor));
  }
  .badge.zero{
    border-color: var(--borderColor);
    background: color-mix(in oklab, var(--borderColor) 18%, transparent);
    color: var(--secondaryText);
  }
</style>
