<script>
  import '$lib/styles/tokens.css';
  import ReceiveTopLoop from '$lib/components/ReceiveTopLoop.svelte';
  export let data;

  const lanes = data?.lanes ?? [];
  const rows  = data?.rows ?? [];
</script>

<h1 class="page-title">KEF — Receive</h1>

<ReceiveTopLoop {lanes} {rows} />

<style>
  .page-title {
    margin: 0 0 var(--spaceMd, 16px) 0;
    color: var(--primaryText, #e6ebf1);
    font-size: clamp(18px, 3.4vw, 24px);
    font-weight: 650;
    line-height: 1.25;
  }
</style>
