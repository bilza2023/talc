
<script>
    export let data;
    const suppliers = data?.suppliers ?? [];
  </script>
  
  <style>
    :root{ --ink:#e6ebf1; --muted:#a9b3c2; --edge:#0f1724; --card:#101721; --card2:#0f1621; }
    :global(body){ color: var(--ink); }
  
    .wrap{ max-width: 900px; margin: 0 auto; padding: 1rem; }
    .bar{ display:flex; align-items:center; justify-content:space-between; gap:.75rem; margin-bottom: .8rem; }
    h1{ font-size:1.1rem; margin:0; font-weight:800; }
    .btn{
      background:#1a2536; color:var(--ink); border:1px solid #233049; padding:.55rem .8rem;
      border-radius:.6rem; text-decoration:none; font-weight:700;
    }
    .btn:hover{ background:#21314a; }
  
    .card{ background:var(--card); border:1px solid var(--edge); border-radius:.8rem; overflow:hidden; }
    .card h2{ margin:0; padding:.8rem .9rem; font-size:.98rem; font-weight:800; border-bottom:1px solid var(--edge); }
    .body{ padding:.8rem .9rem; }
  
    table{ width:100%; border-collapse:collapse; font-size:.95rem; }
    th,td{ text-align:left; padding:.55rem .4rem; border-bottom:1px solid #131a28; }
    th{ color:var(--muted); font-weight:600; font-size:.82rem; }
    tr:hover{ background:#0f1622; }
  
    .row-actions{ display:flex; gap:.4rem; }
    .link{ color:var(--ink); text-decoration:underline; }
    .del{
      background:#2a1a1a; color:#ffdcdc; border:1px solid #3b2222; padding:.35rem .6rem; border-radius:.5rem;
    }
    .del:hover{ background:#3b2222; }
  </style>
  
  <div class="wrap">
    <div class="bar">
      <h1>Suppliers</h1>
      <a class="btn" href="/suppliers/new">Add Supplier</a>
    </div>
  
    <section class="card">
      <h2>All Suppliers</h2>
      <div class="body">
        {#if suppliers.length}
          <table>
            <thead>
              <tr><th>ID</th><th>Code</th><th>Name</th><th></th></tr>
            </thead>
            <tbody>
              {#each suppliers as s}
                <tr>
                  <td>{s.id}</td>
                  <td>{s.code}</td>
                  <td>{s.name}</td>
                  <td>
                    <div class="row-actions">
                      <a class="link" href={`/suppliers/${s.id}/edit?code=${encodeURIComponent(s.code)}&name=${encodeURIComponent(s.name)}`}>Edit</a>
                      <form method="post" action="?/delete" on:submit|preventDefault={(e)=>{ if(confirm('Delete this supplier?')) e.target.submit(); }}>
                        <input type="hidden" name="id" value={s.id} />
                        <button class="del" type="submit">Delete</button>
                      </form>
                    </div>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        {:else}
          <p>No suppliers yet. Click <a class="link" href="/suppliers/new">Add Supplier</a> to create one.</p>
        {/if}
      </div>
    </section>
  </div>
  