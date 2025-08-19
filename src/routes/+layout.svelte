  
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

<div class=" min-h-screen h-full bg-[#F5F8F7] text-black">
  <slot></slot>
  </div>