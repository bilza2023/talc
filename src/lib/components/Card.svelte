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
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    width: clamp(84px, 28vw, 112px);
    aspect-ratio: 1 / 1;

    padding: var(--spaceSm, 10px);
    border: 1px solid var(--borderColor, #2b3a36);
    border-radius: var(--radiusXl, 16px);
    background: color-mix(in srgb, var(--surfaceColor, #0f1a16) 70%, transparent);
    color: var(--primaryText, #e6ebf1);
    text-decoration: none;
    box-shadow: var(--shadowSm, 0 2px 8px rgba(0,0,0,.2));

    transition: transform .12s ease, box-shadow .12s ease, background .12s ease, border-color .12s ease;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }
  .card:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadowMd, 0 6px 14px rgba(0,0,0,.25));
  }
  .card:active {
    transform: translateY(0);
    box-shadow: var(--shadowSm, 0 2px 8px rgba(0,0,0,.2));
    background: color-mix(in srgb, var(--surfaceColor, #0f1a16) 85%, transparent);
  }
  .card:focus-visible {
    outline: 2px solid var(--focusColor, #66afe9);
    outline-offset: 3px;
  }

  .icon {
    font-size: clamp(2rem, 7vw, 2.6rem);
    line-height: 1;
    margin-bottom: var(--spaceXs, 6px);
  }
  .label {
    font-size: clamp(.72rem, 2.8vw, .9rem);
    text-align: center;
    color: var(--secondaryText, #cfe0f5);
    letter-spacing: .2px;
  }
  .card:hover .label {
    color: var(--primaryText, #e6ebf1);
  }
</style>
