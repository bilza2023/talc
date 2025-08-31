<script>

  export let data;
  import StationStockCard from "../StationStockCard.svelte";
  import InboundList from "../InboundList.svelte";
  import StaHeader from "../StaHeader.svelte";
  const { stationCode, inbound } = data || {};

  const talcPalette = ["#b72222", "#14b8a6", "#f59e0b", "#b72222"];
  const talc = data.talcStock ?? { deposits: 0, received: 0, inTransit: 0, stock: 0 };
  const ore  = data.oreStock  ?? { deposits: 0, received: 0, inTransit: 0, stock: 0 }; 
</script>

<div class="min-h-screen bg-[#0b1018] text-[#e6ebf1]">
  <div class="mx-auto max-w-6xl p-6 space-y-8">
    <StaHeader
    stationCode={data.stationCode}
    description="Peshawar Supply Station"
  />

  
  <div class="flex justify-center  flex-col w-full gap-6 mb-8">
    <StationStockCard
    title="Ore — Overview"
    stationCode={data.station}
    stock={data.oreCard.stock}
    inbound={data.oreCard.inbound}
    outbound={data.oreCard.outbound}
    unit="t"
    accent="#0ea5e9"
    colors={["#22d3ee", "#34d399", "#60a5fa"]}
  />
  <StationStockCard
    title="Talc — Overview"
    stationCode={data.station}
    stock={data.talcCard.stock}
    inbound={data.talcCard.inbound}
    outbound={data.talcCard.outbound}
    unit="t"
    accent="#10b981"
    colors={["#2dd4bf", "#34d399", "#60a5fa"]}
  />
  </div>
  
    <!-- Quick Actions -->
    <section>
      <h2 class="text-xl mb-3">Actions</h2>
      
      <div class="actions">
        <a class="btn cyan"  href={data.talc.depositUrl}   >Deposit Talc</a>
        <a class="btn cyan"  href={data.talc.dispatchUrl}  >Dispatch Talc</a>
        <a class="btn amber" href={data.ore.depositUrl}    >Deposit Ore</a>
        <a class="btn amber" href={data.ore.dispatchUrl}   >Dispatch Ore</a>
      </div>
      

      
    </section>

    <InboundList items={data.inbound} stationCode={data.stationCode} />
  
  </div>
</div>



<style>
  .actions { display:flex; flex-wrap:wrap; gap:10px; }
  .btn {
    display:inline-flex; align-items:center; justify-content:center;
    padding:10px 14px; border-radius:12px; text-decoration:none; font-weight:700;
    border:1px solid rgba(255,255,255,.08);
    background: #0f1520; color:#e6ebf1;
    transition: transform .12s ease, box-shadow .12s ease, background .12s ease;
    pointer-events:auto; /* guard against parent disabling clicks */
  }
  .btn:hover { transform: translateY(-1px); box-shadow:0 8px 24px rgba(0,0,0,.25); }
  .btn.cyan  { outline:1px solid color-mix(in oklab, #06b6d4 40%, transparent); }
  .btn.cyan:hover  { background: color-mix(in oklab, #06b6d4 12%, transparent); }
  .btn.amber { outline:1px solid color-mix(in oklab, #f59e0b 40%, transparent); }
  .btn.amber:hover { background: color-mix(in oklab, #f59e0b 12%, transparent); }
</style>