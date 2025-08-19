<script>
  import { page } from '$app/stores';
  import { derived } from 'svelte/store';

  // current pathname as a store (e.g. "/stations/jss")
  const path = derived(page, ($p) => $p.url.pathname);
</script>

<nav aria-label="Main">
  <div class="inner">
    <div class="brand">North&nbsp;West&nbsp;Minerals</div>
    <div class="spacer"></div>

    <ul>
      
 
      <li>
        <a href="/stations/jss" class:active={$path.startsWith('/stations')}>
          <span class="emoji">🏭</span><span>Help</span>
        </a>
      <li>
        <a href="/dashboard" class:active={$path.startsWith('/dashboard')}>
          <span class="emoji">📊</span><span>Website</span>
        </a>
      </li>

      <li>
        <a href="/settings" class:active={$path.startsWith('/mines')}>
          <span class="emoji">⛏️</span><span>Settings</span>
        </a>
      </li>
    </ul>
  </div>
</nav>

<!-- just replace the <style> block's .inner rule -->
  <style>
    :root {
      --bg:    #005537;      /* near-black */
      --bg2:   #0b1018;      /* subtle gradient */
      --ink:   #e6ebf1;      /* primary text */
      --muted: #a9b3c2;      /* secondary text */
      --accent:#5ec2ff;      /* cyan-blue accent */
      --hover: #141b24;      /* hover pill */
      --pill:  #101721;      /* active pill */
      --edge:  #0f1724;      /* hairline border */
      --ring:  0 0 0 .12rem rgba(94,194,255,.45);
    }
  
    nav {
      position: sticky; top: 0; z-index: 50;
      background-color: #005537;
      /* background: linear-gradient(180deg, var(--bg), var(--bg2)); */
      color: var(--ink);
      border-bottom: 1px solid var(--edge);
      /* box-shadow: 0 8px 24px rgba(0,0,0,.45); */
      /* backdrop-filter: saturate(1.1); */
    }
  
    /* full-bleed; brand locked left */
    .inner {
      width: 100%;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding: .8rem 1rem;
    }
  
    .brand {
      font-weight: 800;
      letter-spacing: .3px;
      font-size: 1.08rem;
      white-space: nowrap;
      color: var(--ink);
    }
  
    .spacer { flex: 1 }
  
    ul {
      display: flex;
      gap: .35rem;
      list-style: none;
      padding: 0; margin: 0;
    }
  
    a {
      --pad-x: .7rem; --pad-y: .42rem;
      color: var(--muted);
      text-decoration: none;
      font-size: .95rem;
      display: inline-flex;
      align-items: center;
      gap: .45rem;
      padding: var(--pad-y) var(--pad-x);
      border-radius: .55rem;
      background: transparent;
      transition: background .18s ease, color .18s ease, transform .06s ease, box-shadow .15s ease;
      outline: none;
    }
    a:hover { background: var(--hover); color: var(--ink); }
    a:active { transform: translateY(1px); }
    a:focus-visible { box-shadow: var(--ring); }
  
    a.active {
      color: #fff;
      background: var(--pill);
      position: relative;
    }
    a.active::after {
      content: '';
      position: absolute; left: .55rem; right: .55rem; bottom: .32rem;
      height: 2px; border-radius: 2px;
      background: var(--accent);
      opacity: .9;
    }
  
    .emoji { font-size: 1.05rem; line-height: 1; }
  
    @media (max-width: 740px) {
      .inner { padding: .7rem .8rem; gap: .9rem; }
      .brand { font-size: 1rem; }
      a { --pad-x: .55rem; --pad-y: .36rem; font-size: .93rem; }
      a.active::after { bottom: .25rem; }
    }
  </style>
  