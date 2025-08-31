

<script>
    import AppSideBar from "$lib/components/AppSideBar.svelte";
    import { page } from '$app/stores';
  
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
      <section class="mx-auto max-w-7xl">
        <!-- Title block (top) -->
        <header class="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur text-center">
          <h1 class="text-3xl md:text-4xl font-semibold tracking-tight">
            North-West Transportation App
          </h1>
          <p class="mt-2 text-sm text-[#9fb0c5]">
            Operations &amp; Dashboards
          </p>
        </header>
    
        <!-- Large hero image (under title) -->
        <div class="mt-6">
          <!-- svelte-ignore a11y-missing-attribute -->
          <img
            src="/images/northwest_banner.png"
            alt="North-West Transportation banner"
            class="w-full max-h-[32rem] md:max-h-[40rem] object-contain rounded-2xl ring-1 ring-white/10 shadow-lg bg-black/20"
            loading="lazy"
            decoding="async"
          />
          <br>
          <img
            src="/images/batch_n_edge.png"
            alt="North-West Transportation banner"
            class="w-full max-h-[32rem] md:max-h-[40rem] object-contain rounded-2xl ring-1 ring-white/10 shadow-lg bg-black/20"
            loading="lazy"
            decoding="async"
          />
        </div>
      </section>
    </main>
    
  </div>

