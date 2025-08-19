

<script>
    import AppSideBar from "$lib/components/AppSideBar.svelte";
    import { page } from '$app/stores';
  
    // Example nav model
    const entries = [
    { type: 'heading', title: 'Operations' },
    { title: 'Dashboard', url: '/',            icon: '🧭' },
    
    { type: 'heading', title: 'Ore' },
    { title: 'Deposit Ore',  url: '/ore/deposit',  icon: '⚖️' },
    { title: 'Dispatch Ore', url: '/ore/dispatch', icon: '📦' },
    { title: 'Unload Ore', url: '/ore/dispatch', icon: '📦' },
    
    
    { type: 'heading', title: 'Talc' },
    { title: 'Deposit Talc',  url: '/talc/deposit',  icon: '⚖️' },
    { title: 'Dispatch Talc', url: '/talc/dispatch', icon: '📦' },
    { title: 'Unload Talc',   url: '/talc/dispatch', icon: '📦' },
    
    { type: 'heading', title: 'Admin' },
    { title: 'Logs',     url: '/admin/logs',     icon: '🗒️' },
    { title: 'Suppliers', url: '/suppliers',   icon: '🚚' },
    { title: 'Mines',  url: '/stations',    icon: '🏗️' },
    { title: 'Settings', url: '/admin/settings', icon: '⚙️' },
  ];
  
    let collapsed = false; // bindable
    $: activeUrl = $page?.url?.pathname; // highlight current route
  </script>
  
  <div class="flex min-h-screen">
    <AppSideBar
      {entries}
      bind:collapsed
      {activeUrl}
      textColor="text-white"
       bgColor="bg-[#002316]"
    />
  
    <main class="flex-1 p-6 ">
   
  
      <h1 class="text-2xl font-semibold mb-2">Content Area</h1>
      <p>This is your page content…</p>
    </main>
  </div>


<a href="/stations/jss">JSS</a>