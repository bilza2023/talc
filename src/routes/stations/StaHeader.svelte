<script>
    // Minimal, dumb header
    export let stationCode = "";            // e.g. "PSS"
    export let description = "";            // short subtitle under the title
    export let accent = "#06b6d4";          // optional accent color
    export let icon = "🏭";                  // optional emoji/icon
  </script>
  
  <header class="sta-head" style={`--accent:${accent}`}>
    <div class="mark" aria-hidden="true"></div>
    <div class="wrap">
      <div class="ico" aria-hidden="true">{icon}</div>
      <div class="text">
        <h1 class="title">{stationCode}</h1>
        {#if description}
          <p class="sub">{description}</p>
        {/if}
      </div>
    </div>
  </header>
  
  <style>
    .sta-head{
      --bg: linear-gradient(180deg, #0f1521 0%, #0b111a 100%);
      --ring: color-mix(in oklab, var(--accent) 40%, transparent);
      background: var(--bg);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 18px;
      padding: 14px 16px;
      position: relative;
      box-shadow: 0 12px 30px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(255,255,255,0.02);
    }
    .mark{
      position:absolute; inset:auto 12px 0 12px; height: 3px; border-radius: 999px;
      background: radial-gradient(60% 200% at 50% 50%, var(--accent), transparent 70%);
      opacity:.35; filter: blur(6px);
    }
    .wrap{ display:flex; align-items:center; gap:12px; }
    .ico{
      width:44px; height:44px; display:grid; place-items:center; font-size:22px;
      border-radius:12px; background: color-mix(in oklab, var(--accent) 12%, #0c1724);
      outline:1px solid var(--ring); box-shadow: 0 6px 16px color-mix(in oklab, var(--accent) 18%, transparent);
    }
    .text{ display:grid; gap:4px; }
    .title{
      margin:0; font-weight:900; letter-spacing:.5px; line-height:1.1;
      font-size:1.6rem; text-transform: uppercase;
      text-shadow: 0 0 18px color-mix(in oklab, var(--accent) 18%, transparent);
    }
    .sub{
      margin:0; color:#9fb0c5; font-size:.9rem; letter-spacing:.2px;
    }
    @media (max-width:640px){
      .title{ font-size:1.35rem; }
      .ico{ width:40px; height:40px; font-size:20px; }
    }
  </style>
  