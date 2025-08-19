

<script>
    import AppSideBar from "$lib/components/AppSideBar.svelte";
    import { page } from '$app/stores';
  
    // Example nav model
    const entries = [
    { type: 'heading', title: 'Operations' },
    { title: 'Dashboard', url: '/',            icon: '🧭' },
    { title: 'Stations',  url: '/stations',    icon: '🏗️' },
    { title: 'Suppliers', url: '/suppliers',   icon: '🚚' },

    { type: 'heading', title: 'Ore Flow' },
    { title: 'Deposit Ore',  url: '/ore/deposit',  icon: '⚖️' },
    { title: 'Dispatch Ore', url: '/ore/dispatch', icon: '📦' },

    { type: 'heading', title: 'Admin' },
    { title: 'Reports',  url: '/admin/reports',  icon: '📊' },
    { title: 'Settings', url: '/admin/settings', icon: '⚙️' },
    { title: 'Logs',     url: '/admin/logs',     icon: '🗒️' },
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
      <button
        class="mb-4 px-3 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700"
        on:click={() => (collapsed = !collapsed)}
      >
        Toggle Sidebar
      </button>
  
      <h1 class="text-2xl font-semibold mb-2">Content Area</h1>
      <p>This is your page content…</p>
    </main>
  </div>


<a href="/stations/jss">JSS</a>