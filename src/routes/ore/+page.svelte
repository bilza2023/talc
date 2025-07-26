<script>
    // JSON-driven list of available forms
    import forms from './forms.json';
  </script>
  
  <svelte:head>
    <!-- Water.css dark theme -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/water.css@2/out/dark.css">
  </svelte:head>
  
  <main class="page">
    <h1 class="page-title">North&nbsp;West</h1>
  
    <div class="cards">
      {#each forms as form}
        <a class="card" href={form.path}>
          <h2>{form.title}</h2>
          {#if form.description}
            <p>{form.description}</p>
          {/if}
        </a>
      {/each}
    </div>
  </main>
  
  <style>
    :global(html, body) {
      margin: 0;
    }
  
    /* Page wrapper – centers content and adds generous padding */
    .page {
      padding: 2rem clamp(1rem, 4vw, 3rem);
      max-width: 72rem;
      margin: 0 auto;
    }
  
    /* Page title */
    .page-title {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 2rem;
      text-align: center;
    }
  
    /* Card grid */
    .cards {
      display: flex;
      flex-wrap: wrap;
      gap: 1.5rem;
      justify-content: center;
    }
  
    /* Individual card */
    .card {
      flex: 1 1 220px;
      max-width: 260px;
      padding: 1.25rem 1.5rem;
      border-radius: 0.75rem;
      border: 1px solid rgba(255, 255, 255, 0.12);
      background: rgba(255, 255, 255, 0.05);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      text-decoration: none;
      color: inherit;
    }
  
    .card:hover {
      transform: translateY(-4px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);
    }
  
    .card h2 {
      font-size: 1.1rem;
      margin: 0 0 0.5rem;
    }
  
    .card p {
      font-size: 0.9rem;
      margin: 0;
      opacity: 0.85;
    }
  
    /* Mobile tweak – full‑width cards */
    @media (max-width: 500px) {
      .card {
        flex: 1 1 100%;
        max-width: 100%;
      }
    }
  </style>
  