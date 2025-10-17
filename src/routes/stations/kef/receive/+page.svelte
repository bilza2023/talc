<script>
    import '$lib/styles/tokens.css';
    import StationReceive from '$lib/components/StationReceive.svelte';
    export let data;
  
    const lanes = data?.lanes ?? [];
    const rows  = data?.rows ?? [];
  </script>
  
  <h1 class="page-title">KEF – Receive</h1>
  
  <StationReceive {lanes} {rows} />
  
  <style>
    .page-title {
      margin: 0 0 var(--spaceMd, 16px) 0;
      color: var(--primaryText, #e6ebf1);
      font-size: clamp(18px, 3.4vw, 24px);
      font-weight: 650;
    }
  </style>
  