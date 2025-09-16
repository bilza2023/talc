<script>

  export let data;
  import StationStockCard from "../StationStockCard.svelte";
  import BatchDetails from "../BatchDetails.svelte";
  import InboundList from "../InboundList.svelte";
  import StaHeader from "../StaHeader.svelte";
import RoundIconBtn from "../../../lib/components/RoundIconBtn.svelte";

 
</script>

<div class="min-h-screen bg-[#0b1018] text-[#e6ebf1]">
  <div class="mx-auto max-w-6xl p-6 space-y-8">
    <StaHeader
    stationCode={data.stationCode}
    description="Peshawar Supply Station"
  />
  <div class="btn-center">
    <RoundIconBtn icon="🪨📥" label="Deposit Ore" href={data.ore.depositUrl} size="lg" variant="solid" />

    <RoundIconBtn icon="🪨🚚" label="Dispatch Ore" href={data.ore.dispatchUrl} size="lg" variant="solid" />
  </div>
  
  <div class="btn-center">
    <RoundIconBtn icon="🧼📥" label="Process Talc" href={data.talc.depositUrl} size="lg" variant="solid" />
    <RoundIconBtn icon="🧼🚚" label="Dispatch Talc" href={data.talc.dispatchUrl} size="lg" variant="solid" />
  </div>

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
  <BatchDetails title="Talc — Batch Details"  rows={data.talcBatches}  />
  </div>
  



    <!-- <InboundList items={data.inbound} stationCode={data.stationCode} /> -->
  
  </div>
</div>



<style>
      .btn-center{
      display:flex;
      justify-content:center;
      align-items:center;
      gap: var(--space-3, .75rem);
      flex-wrap: wrap;            /* wraps on small screens */
      margin: var(--space-2, .5rem) auto;
      width: 100%;
    }
    .btn-center > :global(*){ flex:0 0 auto; }
  
</style>