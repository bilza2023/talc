  
<style>

</style>


<script>
  
  import "../app.css";
  import { SvelteToast } from '@zerodevx/svelte-toast'
   const options = {}
    import Nav from "$lib/components/Nav.svelte";


</script>


<Nav />
<SvelteToast {options} />
<!-- <slot/> -->

<div class=" min-h-screen h-full">
  <slot></slot>
  </div>