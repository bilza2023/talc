<script>
    export let data;
  </script>
  
  <div class="reports-layout">
    <slot />
  </div>
  
  <style>
    .reports-layout {
      background: var(--backgroundColor, #0b0b0c);
      color: var(--primaryText, #e9e9ea);
      min-height: 100vh;
    }
  </style>
  