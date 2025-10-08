<script>
    export let icon = '';
    export let label = '';
    export let value = '';
    export let sub = '';
  </script>
  
  <div class="card">
    {#if icon}<div class="icon" aria-hidden="true">{icon}</div>{/if}
    <div class="text">
      <div class="label">{label}</div>
      <div class="value">{value}</div>
      {#if sub}<div class="sub">{sub}</div>{/if}
    </div>
  </div>
  
  <style>
    .card {
      display: flex;
      align-items: center;
      gap: .75rem;
      padding: .9rem 1rem;
      border-radius: 14px;
      background: var(--panelBg, #151518);
      border: 1px solid var(--borderColor, #2a2a2e);
    }
    .icon {
      width: 40px; height: 40px; display: grid; place-items: center;
      border-radius: 10px;
      background: color-mix(in oklab, var(--accent, #6ee7ff) 16%, transparent);
      border: 1px solid color-mix(in oklab, var(--accent, #6ee7ff) 35%, transparent);
      font-size: 1.15rem;
    }
    .label { color: var(--mutedText, #a3a3a3); font-size: .85rem; }
    .value { font-weight: 700; font-size: 1.2rem; margin-top: .1rem; }
    .sub { color: var(--mutedText, #a3a3a3); font-size: .85rem; margin-top: .1rem; }
  </style>
  