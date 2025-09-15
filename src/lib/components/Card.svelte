<script>
    export let icon = '📦';
    export let label = '';
    export let href = '#';
  </script>
  
  <a href={href} class="card">
    <div class="icon">{icon}</div>
    <div class="label">{label}</div>
  </a>
  
  <style>
    .card {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 80px;
      height: 80px;
      border-radius: 12px;
      background: var(--surfaceColor, #222);
      color: var(--primaryText, #fff);
      text-decoration: none;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
      transition: transform 0.15s;
    }
    .card:hover {
      transform: scale(1.05);
    }
    .icon {
      font-size: 1.5rem;
      margin-bottom: .25rem;
    }
    .label {
      font-size: 0.8rem;
      text-align: center;
    }
  </style>
  