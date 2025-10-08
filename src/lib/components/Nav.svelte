<script>
  export let theme = "theme-green";

  const THEME_OPTIONS = [
    { label: "Light", value: "theme-light" },
    { label: "Dark", value: "theme-dark" },
    { label: "Green", value: "theme-green" },
    { label: "Dracula", value: "theme-dracula" },
    { label: "Nord", value: "theme-nord" },
    { label: "GitHub Dim", value: "theme-github-dim" },
    { label: "Gruvbox Dark", value: "theme-gruvbox-dark" },
    { label: "Solarized Light", value: "theme-solarized-light" },
    { label: "Latte", value: "theme-latte" },
  ];
</script>

<nav class="nav">
  <div class="left">
    <a class="title-href" href="/">Northwest Minerals</a>
  </div>

  <div class="right">
    <label class="theme">
      <span class="sr-only">Theme</span>
      <select class="sel" bind:value={theme} aria-label="Theme">
        {#each THEME_OPTIONS as o}
          <option value={o.value}>{o.label}</option>
        {/each}
      </select>
    </label>

    <a class="login" href="/login">Login</a>
  </div>
</nav>

<style>
  /* Green bar with white text */
  .nav {
    position: sticky;
    top: 0;
    z-index: 50;

    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: var(--spaceSm, 12px) var(--spaceMd, 16px);
    background: var(--primaryColor);                  /* main green */
    color: #fff;                                       /* white text across */

    border-bottom: 1px solid rgba(255,255,255,0.15);   /* light divider */
    backdrop-filter: saturate(110%);                   /* subtle (no blur) */
  }

  .left {
    font-size: clamp(1rem, 3.2vw, 1.2rem);
    font-weight: 700;
    letter-spacing: .2px;
  }

  .title-href {
    display: inline-flex;
    align-items: center;
    gap: .4rem;
    text-decoration: none;
    color: #fff;                                       /* keep text white */
    padding: .2rem .4rem;
    border-radius: var(--radiusXl, 16px);
    transition: opacity .12s ease, text-decoration-color .12s ease;
  }
  .title-href:hover {
    opacity: .9;                                       /* very light effect */
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-color: rgba(255,255,255,0.75);
  }
  .title-href:focus-visible {
    outline: 2px solid rgba(255,255,255,0.85);
    outline-offset: 2px;
  }

  .right {
    display: flex;
    align-items: center;
    gap: var(--spaceSm, 12px);
  }

  /* Minimal, light select: transparent with thin white border */
  .sel {
    appearance: none;
    background: transparent;
    color: #fff;
    border: 1px solid rgba(255,255,255,0.25);
    border-radius: var(--radiusXl, 16px);
    padding: 0.45rem 0.8rem;
  }
  .sel:focus-visible {
    outline: 2px solid rgba(255,255,255,0.85);
    outline-offset: 2px;
    border-color: rgba(255,255,255,0.45);
  }
  /* Make options readable on native popups; browsers handle the popup bg */
  .sel option { color: initial; }

  /* Light login pill: translucent bg, white text */
  .login {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 0.9rem;
    border-radius: 9999px;

    border: 1px solid rgba(255,255,255,0.25);
    background: rgba(255,255,255,0.10);               /* very light */
    color: #fff;
    text-decoration: none;
    transition: background .12s ease, border-color .12s ease;
  }
  .login:hover {
    background: rgba(255,255,255,0.16);
    border-color: rgba(255,255,255,0.35);
  }
  .login:focus-visible {
    outline: 2px solid rgba(255,255,255,0.85);
    outline-offset: 2px;
  }

  .sr-only {
    position: absolute;
    width: 1px; height: 1px;
    padding: 0; margin: -1px;
    overflow: hidden; clip: rect(0,0,0,0);
    white-space: nowrap; border: 0;
  }
</style>
