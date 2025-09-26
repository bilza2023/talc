
<!-- /src/routes/stations/abs/+page.svelte -->
<script>
    import { onMount } from 'svelte';
    export let data;
  
    onMount(() => {
      console.log('[ABS] station page data →', data);
    });
  </script>
  
<a href="/stations/abs/purchase_unscreened">stations/abs/purchase_unscreened</a> 
<a href="/stations/abs/purchase_screened">purchase_screened</a> 