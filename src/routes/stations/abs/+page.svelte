
<!-- /src/routes/stations/abs/+page.svelte -->
<script>
    import { onMount } from 'svelte';
    export let data;
  
    onMount(() => {
      console.log('[ABS] station page data →', data);
    });
  </script>
  
  <!-- Intentionally minimal: visual UI comes later -->
ok  