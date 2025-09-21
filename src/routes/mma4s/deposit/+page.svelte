<script>
    import { page } from '$app/stores';
    $: form = $page.form; // action result after post (or undefined before first submit)
  </script>
  
  <h1>Minimal Deposit Smoke Test</h1>
  
  {#if form}
    <p style="padding:.5rem; border-radius:.4rem; border:1px solid #ccc;">
      {$page.form?.message}
    </p>
  {/if}
  
  <form method="POST" action="?/deposit">
    <button type="submit">Run Hard-Coded Deposit</button>
  </form>
  