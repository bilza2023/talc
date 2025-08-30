<script>
   import AppSideBar from "$lib/components/AppSideBar.svelte";
   import { page } from '$app/stores';
    // Example nav model

  
    let collapsed = false; // bindable
    $: activeUrl = $page?.url?.pathname; // highlight current route
</script>



<div class="flex min-h-screen">
    <AppSideBar
    
      bind:collapsed
      {activeUrl}
      textColor="text-white"
       bgColor="bg-[#002316]"
    />
    <main class="flex-1 p-6 bg-gradient-to-b from-[#06110d] to-[#0b1813] text-[#e6ebf1]">
    <slot></slot>
    </main>
</div>
