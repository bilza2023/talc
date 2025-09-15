<script>
  export let title = 'Northwest Minerals';
  export let theme = 'theme-royalBlue';

  const THEME_OPTIONS = [
    { label:'Light',            value:'theme-light' },
    { label:'Dark',             value:'theme-dark' },
    { label:'Dracula',          value:'theme-dracula' },
    { label:'Nord',             value:'theme-nord' },
    { label:'GitHub Dim',       value:'theme-github-dim' },
    { label:'Gruvbox Dark',     value:'theme-gruvbox-dark' },
    { label:'Solarized Light',  value:'theme-solarized-light' },
    { label:'Latte',            value:'theme-latte' }
  ];
</script>

<nav class="nav">
  <div class="left">{title}</div>

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
  .nav{
    position: sticky; top: 0; z-index: 50;
    display: flex; align-items: center; justify-content: space-between;
    padding: var(--spaceSm,12px) var(--spaceMd,16px);
    background: color-mix(in srgb, var(--surfaceColor,#0f1a16) 88%, transparent);
    border-bottom: 1px solid var(--borderColor,#2b3a36);
    backdrop-filter: blur(var(--blurSm,6px)) saturate(115%);
    -webkit-backdrop-filter: blur(var(--blurSm,6px)) saturate(115%);
  }
  .left{
    font-size: 1.06rem; font-weight: 600; letter-spacing: .2px;
    color: var(--primaryText,#e6ebf1);
  }
  .right{ display: flex; align-items: center; gap: var(--spaceSm,12px); }

  .sel{
    appearance: none;
    background: var(--surfaceColor,#0f1a16);
    color: var(--primaryText,#e6ebf1);
    border: 1px solid var(--borderColor,#2b3a36);
    border-radius: var(--radiusXl,16px);
    padding: .5rem .8rem;
    box-shadow: var(--shadowSm,0 2px 8px rgba(0,0,0,.2));
  }
  .sel:focus-visible{
    outline: 2px solid var(--focusColor,#66afe9);
    outline-offset: 2px;
  }

  .login{
    display: inline-flex; align-items: center; justify-content: center;
    padding: .5rem .9rem;
    border-radius: 9999px;
    border: 1px solid var(--borderColor,#2b3a36);
    background: color-mix(in srgb, var(--surfaceColor,#0f1a16) 90%, transparent);
    color: var(--primaryText,#e6ebf1);
    text-decoration: none;
    box-shadow: var(--shadowSm,0 2px 8px rgba(0,0,0,.2));
  }
  .login:hover{ filter: brightness(1.08); }

  .sr-only{
    position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden;
    clip:rect(0,0,0,0); white-space:nowrap; border:0;
  }
</style>
