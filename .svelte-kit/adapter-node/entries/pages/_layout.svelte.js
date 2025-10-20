import { c as create_ssr_component, e as each, a as add_attribute, b as escape, v as validate_component } from "../../chunks/ssr.js";
/* empty css                  */
/* empty css                  */
const css$1 = {
  code: ".nav.svelte-qnkea0.svelte-qnkea0{position:sticky;top:0;z-index:50;display:flex;align-items:center;justify-content:space-between;padding:var(--spaceSm, 12px) var(--spaceMd, 16px);background:var(--primaryColor);color:#fff;border-bottom:1px solid rgba(255,255,255,0.15);-webkit-backdrop-filter:saturate(110%);backdrop-filter:saturate(110%)}.left.svelte-qnkea0.svelte-qnkea0{font-size:clamp(1rem, 3.2vw, 1.2rem);font-weight:700;letter-spacing:.2px}.title-href.svelte-qnkea0.svelte-qnkea0{display:inline-flex;align-items:center;gap:.4rem;text-decoration:none;color:#fff;padding:.2rem .4rem;border-radius:var(--radiusXl, 16px);transition:opacity .12s ease, text-decoration-color .12s ease}.title-href.svelte-qnkea0.svelte-qnkea0:hover{opacity:.9;text-decoration:underline;text-underline-offset:3px;text-decoration-color:rgba(255,255,255,0.75)}.title-href.svelte-qnkea0.svelte-qnkea0:focus-visible{outline:2px solid rgba(255,255,255,0.85);outline-offset:2px}.right.svelte-qnkea0.svelte-qnkea0{display:flex;align-items:center;gap:var(--spaceSm, 12px)}.sel.svelte-qnkea0.svelte-qnkea0{-webkit-appearance:none;-moz-appearance:none;appearance:none;background:transparent;color:#fff;border:1px solid rgba(255,255,255,0.25);border-radius:var(--radiusXl, 16px);padding:0.45rem 0.8rem}.sel.svelte-qnkea0.svelte-qnkea0:focus-visible{outline:2px solid rgba(255,255,255,0.85);outline-offset:2px;border-color:rgba(255,255,255,0.45)}.sel.svelte-qnkea0 option.svelte-qnkea0{color:initial}.login.svelte-qnkea0.svelte-qnkea0{display:inline-flex;align-items:center;justify-content:center;padding:0.5rem 0.9rem;border-radius:9999px;border:1px solid rgba(255,255,255,0.25);background:rgba(255,255,255,0.10);color:#fff;text-decoration:none;transition:background .12s ease, border-color .12s ease}.login.svelte-qnkea0.svelte-qnkea0:hover{background:rgba(255,255,255,0.16);border-color:rgba(255,255,255,0.35)}.login.svelte-qnkea0.svelte-qnkea0:focus-visible{outline:2px solid rgba(255,255,255,0.85);outline-offset:2px}.sr-only.svelte-qnkea0.svelte-qnkea0{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}",
  map: '{"version":3,"file":"Nav.svelte","sources":["Nav.svelte"],"sourcesContent":["<script>\\n  export let theme = \\"theme-green\\";\\n\\n  const THEME_OPTIONS = [\\n    { label: \\"Light\\", value: \\"theme-light\\" },\\n    { label: \\"Dark\\", value: \\"theme-dark\\" },\\n    { label: \\"Green\\", value: \\"theme-green\\" },\\n    { label: \\"Dracula\\", value: \\"theme-dracula\\" },\\n    { label: \\"Nord\\", value: \\"theme-nord\\" },\\n    { label: \\"GitHub Dim\\", value: \\"theme-github-dim\\" },\\n    { label: \\"Gruvbox Dark\\", value: \\"theme-gruvbox-dark\\" },\\n    { label: \\"Solarized Light\\", value: \\"theme-solarized-light\\" },\\n    { label: \\"Latte\\", value: \\"theme-latte\\" },\\n  ];\\n<\/script>\\n\\n<nav class=\\"nav\\">\\n  <div class=\\"left\\">\\n    <a class=\\"title-href\\" href=\\"/\\">Northwest Minerals</a>\\n  </div>\\n\\n  <div class=\\"right\\">\\n    <label class=\\"theme\\">\\n      <span class=\\"sr-only\\">Theme</span>\\n      <select class=\\"sel\\" bind:value={theme} aria-label=\\"Theme\\">\\n        {#each THEME_OPTIONS as o}\\n          <option value={o.value}>{o.label}</option>\\n        {/each}\\n      </select>\\n    </label>\\n\\n    <a class=\\"login\\" href=\\"/login\\">Login</a>\\n  </div>\\n</nav>\\n\\n<style>\\n  /* Green bar with white text */\\n  .nav {\\n    position: sticky;\\n    top: 0;\\n    z-index: 50;\\n\\n    display: flex;\\n    align-items: center;\\n    justify-content: space-between;\\n\\n    padding: var(--spaceSm, 12px) var(--spaceMd, 16px);\\n    background: var(--primaryColor);                  /* main green */\\n    color: #fff;                                       /* white text across */\\n\\n    border-bottom: 1px solid rgba(255,255,255,0.15);   /* light divider */\\n    -webkit-backdrop-filter: saturate(110%);\\n            backdrop-filter: saturate(110%);                   /* subtle (no blur) */\\n  }\\n\\n  .left {\\n    font-size: clamp(1rem, 3.2vw, 1.2rem);\\n    font-weight: 700;\\n    letter-spacing: .2px;\\n  }\\n\\n  .title-href {\\n    display: inline-flex;\\n    align-items: center;\\n    gap: .4rem;\\n    text-decoration: none;\\n    color: #fff;                                       /* keep text white */\\n    padding: .2rem .4rem;\\n    border-radius: var(--radiusXl, 16px);\\n    transition: opacity .12s ease, text-decoration-color .12s ease;\\n  }\\n  .title-href:hover {\\n    opacity: .9;                                       /* very light effect */\\n    text-decoration: underline;\\n    text-underline-offset: 3px;\\n    text-decoration-color: rgba(255,255,255,0.75);\\n  }\\n  .title-href:focus-visible {\\n    outline: 2px solid rgba(255,255,255,0.85);\\n    outline-offset: 2px;\\n  }\\n\\n  .right {\\n    display: flex;\\n    align-items: center;\\n    gap: var(--spaceSm, 12px);\\n  }\\n\\n  /* Minimal, light select: transparent with thin white border */\\n  .sel {\\n    -webkit-appearance: none;\\n       -moz-appearance: none;\\n            appearance: none;\\n    background: transparent;\\n    color: #fff;\\n    border: 1px solid rgba(255,255,255,0.25);\\n    border-radius: var(--radiusXl, 16px);\\n    padding: 0.45rem 0.8rem;\\n  }\\n  .sel:focus-visible {\\n    outline: 2px solid rgba(255,255,255,0.85);\\n    outline-offset: 2px;\\n    border-color: rgba(255,255,255,0.45);\\n  }\\n  /* Make options readable on native popups; browsers handle the popup bg */\\n  .sel option { color: initial; }\\n\\n  /* Light login pill: translucent bg, white text */\\n  .login {\\n    display: inline-flex;\\n    align-items: center;\\n    justify-content: center;\\n    padding: 0.5rem 0.9rem;\\n    border-radius: 9999px;\\n\\n    border: 1px solid rgba(255,255,255,0.25);\\n    background: rgba(255,255,255,0.10);               /* very light */\\n    color: #fff;\\n    text-decoration: none;\\n    transition: background .12s ease, border-color .12s ease;\\n  }\\n  .login:hover {\\n    background: rgba(255,255,255,0.16);\\n    border-color: rgba(255,255,255,0.35);\\n  }\\n  .login:focus-visible {\\n    outline: 2px solid rgba(255,255,255,0.85);\\n    outline-offset: 2px;\\n  }\\n\\n  .sr-only {\\n    position: absolute;\\n    width: 1px; height: 1px;\\n    padding: 0; margin: -1px;\\n    overflow: hidden; clip: rect(0,0,0,0);\\n    white-space: nowrap; border: 0;\\n  }\\n</style>\\n"],"names":[],"mappings":"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"}'
};
const Nav = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { theme = "theme-green" } = $$props;
  const THEME_OPTIONS = [
    { label: "Light", value: "theme-light" },
    { label: "Dark", value: "theme-dark" },
    { label: "Green", value: "theme-green" },
    { label: "Dracula", value: "theme-dracula" },
    { label: "Nord", value: "theme-nord" },
    {
      label: "GitHub Dim",
      value: "theme-github-dim"
    },
    {
      label: "Gruvbox Dark",
      value: "theme-gruvbox-dark"
    },
    {
      label: "Solarized Light",
      value: "theme-solarized-light"
    },
    { label: "Latte", value: "theme-latte" }
  ];
  if ($$props.theme === void 0 && $$bindings.theme && theme !== void 0) $$bindings.theme(theme);
  $$result.css.add(css$1);
  return `<nav class="nav svelte-qnkea0"><div class="left svelte-qnkea0" data-svelte-h="svelte-15kqass"><a class="title-href svelte-qnkea0" href="/">Northwest Minerals</a></div> <div class="right svelte-qnkea0"><label class="theme"><span class="sr-only svelte-qnkea0" data-svelte-h="svelte-hy94j8">Theme</span> <select class="sel svelte-qnkea0" aria-label="Theme">${each(THEME_OPTIONS, (o) => {
    return `<option${add_attribute("value", o.value, 0)} class="svelte-qnkea0">${escape(o.label)}</option>`;
  })}</select></label> <a class="login svelte-qnkea0" href="/login" data-svelte-h="svelte-1ydwn37">Login</a></div> </nav>`;
});
const css = {
  code: "html, body{margin:0;padding:0;background:var(--backgroundColor);color:var(--primaryText)}.app.svelte-1vx04jy{min-height:100dvh;background:var(--backgroundColor);color:var(--primaryText)}",
  map: `{"version":3,"file":"+layout.svelte","sources":["+layout.svelte"],"sourcesContent":["<script>\\n  import '$lib/styles/tokens.css';\\n  import '$lib/styles/forms.css';\\n  import '$lib/styles/themes.css';\\n  import Nav from '$lib/components/Nav.svelte';\\n  import { onMount } from 'svelte';\\n  import { browser } from '$app/environment';\\n\\n  const THEME_DEFAULT = 'theme-royalBlue';\\n  let theme = browser ? (localStorage.getItem('theme') || THEME_DEFAULT) : THEME_DEFAULT;\\n\\n  function applyTheme(t) {\\n    if (!browser) return;\\n    const root = document.documentElement;\\n    const keep = [...root.classList].filter(c => !c.startsWith('theme-'));\\n    root.className = keep.join(' ');\\n    root.classList.add(t);\\n    localStorage.setItem('theme', t);\\n  }\\n\\n  onMount(() => applyTheme(theme));\\n  $: if (browser) applyTheme(theme); // runs only in browser when theme changes\\n<\/script>\\n<div class=\\"app\\">\\n  <Nav title=\\"Northwest Transport\\" bind:theme />\\n  <slot />\\n</div>\\n\\n<style>\\n  :global(html, body){ margin:0; padding:0; background:var(--backgroundColor); color:var(--primaryText); }\\n  .app{ min-height:100dvh; background:var(--backgroundColor); color:var(--primaryText); }\\n</style>\\n"],"names":[],"mappings":"AA6BU,UAAW,CAAE,OAAO,CAAC,CAAE,QAAQ,CAAC,CAAE,WAAW,IAAI,iBAAiB,CAAC,CAAE,MAAM,IAAI,aAAa,CAAG,CACvG,mBAAI,CAAE,WAAW,MAAM,CAAE,WAAW,IAAI,iBAAiB,CAAC,CAAE,MAAM,IAAI,aAAa,CAAG"}`
};
const THEME_DEFAULT = "theme-royalBlue";
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let theme = THEME_DEFAULT;
  $$result.css.add(css);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    $$rendered = `<div class="app svelte-1vx04jy">${validate_component(Nav, "Nav").$$render(
      $$result,
      { title: "Northwest Transport", theme },
      {
        theme: ($$value) => {
          theme = $$value;
          $$settled = false;
        }
      },
      {}
    )} ${slots.default ? slots.default({}) : ``} </div>`;
  } while (!$$settled);
  return $$rendered;
});
export {
  Layout as default
};
