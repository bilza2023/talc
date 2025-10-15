<script>
  export let icon = '⬤';
  export let label = '';
  export let href = '#';
</script>

<a href={href} class="card" aria-label={label}>
  <div class="icon" aria-hidden="true">{icon}</div>
  <div class="label">{label}</div>
</a>

<style>
  .card {
    /* layout */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    width: clamp(84px, 28vw, 112px);
    aspect-ratio: 1 / 1;
    padding: var(--spaceSm, 10px);
    border-radius: var(--radiusXl, 16px);

    /* tokens */
    background: var(--surfaceColor);
    border: 1px solid var(--borderColor);
    color: var(--primaryText);
    text-decoration: none;

    /* subtle elevation using token colors */
    box-shadow:
      0 1px 2px color-mix(in srgb, var(--backgroundColor), black 25%),
      0 4px 10px color-mix(in srgb, var(--backgroundColor), black 15%);

    /* interactions */
    transition: transform .12s ease, box-shadow .12s ease, background .12s ease, border-color .12s ease;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }

  .card:hover {
    transform: translateY(-1px);
    background: color-mix(in srgb, var(--surfaceColor), var(--primaryColor) 6%);
    border-color: color-mix(in srgb, var(--borderColor), var(--primaryColor) 20%);
    box-shadow:
      0 3px 8px color-mix(in srgb, var(--backgroundColor), black 28%),
      0 10px 20px color-mix(in srgb, var(--backgroundColor), black 18%);
  }

  .card:active {
    transform: translateY(0);
    background: color-mix(in srgb, var(--surfaceColor), var(--primaryColor) 10%);
    box-shadow:
      0 1px 2px color-mix(in srgb, var(--backgroundColor), black 22%),
      0 6px 12px color-mix(in srgb, var(--backgroundColor), black 16%);
  }

  .card:focus-visible {
    outline: 2px solid var(--primaryColor);
    outline-offset: 3px;
  }

  /* big icon, inherits primaryText */
  .icon {
    font-size: clamp(2.1rem, 8.5vw, 3rem);
    line-height: 1;
    margin-bottom: var(--spaceXs, 6px);
    filter: drop-shadow(0 1px 0 color-mix(in srgb, var(--backgroundColor), black 25%));
  }

  /* label uses the accent/link token */
  .label {
    font-size: clamp(.95rem, 3vw, 1rem);
    text-align: center;
    color: var(--primaryText);
    font-weight: 600;
    letter-spacing: .2px;
  }

  /* reduce motion */
  @media (prefers-reduced-motion: reduce) {
    .card { transition: none; }
  }
</style>
