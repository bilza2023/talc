<script>
    let code = '';
    let name = '';
  </script>
  
  <div class="wrap">
    <div class="card">
      <h1>New Supplier</h1>
  
      <!-- ✅ post to parent route action -->
      <form method="post" action="/suppliers?/create">
        <label>
          <span>Code</span>
          <input name="code" bind:value={code} placeholder="e.g. SUP001" required />
        </label>
  
        <label>
          <span>Name</span>
          <input name="name" bind:value={name} placeholder="e.g. Alpha Minerals" required />
        </label>
  
        <div class="row">
          <a class="btn" href="/suppliers" role="button">Cancel</a>
          <button class="btn" type="submit">Create</button>
        </div>
      </form>
    </div>
  </div>
  
  <style>
    :root{ --ink:#e6ebf1; --muted:#a9b3c2; --edge:#0f1724; --card:#101721; --card2:#0f1621; }
    .wrap{ max-width:640px; margin:0 auto; padding:1rem; color: var(--ink); }
    .card{ background:var(--card); border:1px solid var(--edge); border-radius:.8rem; padding:1rem; }
    h1{ margin:.2rem 0 1rem; font-size:1.05rem; font-weight:800; }
    label{ display:flex; flex-direction:column; gap:.35rem; margin-bottom:.75rem; }
    label > span{ font-size:.82rem; color:var(--muted); }
    input{
      background:var(--card2); color:var(--ink); border:1px solid var(--edge);
      border-radius:.6rem; padding:.55rem .6rem; font-size:.95rem;
    }
    .row{ display:flex; gap:.5rem; justify-content:flex-end; margin-top:.6rem; }
    .btn{
      background:#1a2536; color:var(--ink); border:1px solid #233049;
      padding:.6rem .9rem; border-radius:.6rem; font-weight:700; text-decoration:none;
    }
    .btn:hover{ background:#21314a; }
  </style>
  