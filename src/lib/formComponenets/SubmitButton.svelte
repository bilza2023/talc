<script>
    export let label = 'Save';
    export let loading = false;
    export let disabled = false;
    export let id = '';
    export let buttonClass = '';
    export let containerClass = '';
  </script>
  
  <div class={containerClass}>
    <button
      id={id}
      type="submit"
      class={`btn ${buttonClass}`}
      disabled={disabled || loading}
      aria-busy={loading}
    >
      {#if loading}
        <span class="spinner" aria-hidden="true"></span>
        <span>Working…</span>
      {:else}
        <span>{label}</span>
      {/if}
    </button>
  </div>
  
  <style>
    .btn{
      display:inline-flex; align-items:center; gap:.5rem;
      padding:.6rem .9rem;
      border:1px solid var(--primaryColor);
      background: var(--primaryColor);
      color: #fff;
      border-radius:12px;
      font-weight:600;
    }
    .btn[disabled]{ opacity:.7; cursor:not-allowed; }
    .spinner{
      width:1em; height:1em; border-radius:50%;
      border:2px solid rgba(255,255,255,.35);
      border-top-color:#fff;
      animation: spin .8s linear infinite;
    }
    @keyframes spin{ to{ transform: rotate(360deg); } }
  </style>
  