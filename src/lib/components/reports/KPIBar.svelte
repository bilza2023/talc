<script>
    // items: [{ label, value, sub?, icon? }]
    export let items = [];
  </script>
  
  <div class="grid">
    {#each items as it}
      <div class="card">
        {#if it.icon}
          <div class="icon" aria-hidden="true">{it.icon}</div>
        {/if}
        <div class="meta">
          <div class="label">{it.label}</div>
          <div class="value">{it.value}</div>
          {#if it.sub}<div class="sub">{it.sub}</div>{/if}
        </div>
      </div>
    {/each}
  </div>
  
  <style>
    .grid {
      display: grid;
      gap: .75rem;
      grid-template-columns: 1fr;
    }
    @media (min-width: 520px) { .grid { grid-template-columns: repeat(2, 1fr); } }
    @media (min-width: 960px) { .grid { grid-template-columns: repeat(4, 1fr); } }
  
    .card {
      display: grid;
      grid-template-columns: auto 1fr;
      align-items: center;
      gap: .75rem;
      padding: .9rem;
      border-radius: 14px;
      background: var(--panelBg, #151518);
      border: 1px solid var(--borderColor, #2a2a2e);
    }
    .icon {
      width: 42px; height: 42px;
      display: grid; place-items: center;
      border-radius: 10px;
      font-size: 1.25rem;
      background: color-mix(in oklab, var(--accent, #6ee7ff) 16%, transparent);
      border: 1px solid color-mix(in oklab, var(--accent, #6ee7ff) 35%, transparent);
    }
    .label {
      color: var(--mutedText, #a3a3a3);
      font-size: .85rem;
    }
    .value {
      font-size: clamp(1.1rem, 1rem + 1vw, 1.6rem);
      font-weight: 700;
      margin-top: .1rem;
    }
    .sub {
      margin-top: .15rem;
      color: var(--mutedText, #a3a3a3);
      font-size: .85rem;
    }
  </style>
  