
<!-- /src/routes/stations/abs/+page.svelte -->
<script>
    import { onMount } from 'svelte';
    export let data;
  
    onMount(() => {
      console.log('[ABS] station page data →', data);
    });
  </script>
  
<a href="/stations/abs/purchase_unscreened">purchase_unscreened</a> 
<hr>
<a href="/stations/abs/purchase_screened">purchase_screened</a> 
<hr/>
<a href="/stations/abs/abs_unscreened_raw">/abs_unscreened_raw</a> 
<hr/>
<a href="/stations/abs/abs_screened">abs_screened</a> 