  
<style>

</style>


<script>
  
  import "../app.css";
  import { SvelteToast } from '@zerodevx/svelte-toast'
   const options = {}



</script>

<SvelteToast {options} />
<!-- <slot/> -->

<div class=" min-h-screen h-full">
  <slot></slot>
  </div>