

<script>
    import AppSideBar from "$lib/components/AppSideBar.svelte";
    import { page } from '$app/stores';
  
    // Example nav model
    const entries = [

    { type: 'heading', title: 'JSS' },
    { title: 'Deposit Ore',  url: '/ore/deposit?station=JSS',  icon: '⚖️' },
    
    
    { type: 'heading', title: 'PSS' },
    { title: 'Deposit Ore',  url: '/ore/deposit?station=PSS',  icon: '⚖️' },
    
    
    
    { type: 'heading', title: 'KEF' },
    { title: 'Comming soon',  url: '/',  icon: '⚖️' },
   
    
    
    { type: 'heading', title: 'Admin' },
    { title: 'Ore Dashboard',     url: '/dashboards/ore_dashboard',     icon: '🗒️' },
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