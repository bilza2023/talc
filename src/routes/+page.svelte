

<script>
    import AppSideBar from "$lib/components/AppSideBar.svelte";
    import { page } from '$app/stores';
  
    // Example nav model
    const entries = [

    { type: 'heading', title: 'Stations' },
    { title: 'BS1',  url: '/stations/bs1',  icon: '⚖️' },
    { title: 'BS2',  url: '/stations/bs2',  icon: '⚖️' },
    { title: 'BS3',  url: '/stations/bs3',  icon: '⚖️' },
    { title: 'JSS',  url: '/stations/jss',  icon: '⚖️' },
    { title: 'PSS',  url: '/stations/pss',  icon: '⚖️' },
    { title: 'KEF',  url: '/stations/kef',  icon: '⚖️' },
    
    
    
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