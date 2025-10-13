<script>
  import H1 from '$lib/components/H1.svelte';
  export let data;
  let { suppliers = [] } = data ?? {};
  const fmtId = (n) => (n == null ? '—' : Number(n));
</script>

<div class="page">
  <div class="page-inner">
 
   
<H1 text="SUPPLIERS" size="2rem" />

    

    <!-- Create Supplier -->
    <section class="form-section">
      <h2>Add New Supplier</h2>
      <form method="post" action="?/create" class="form compact">
        <div class="row">
          <label>
            <span>Code</span>
            <input name="code" required />
          </label>
          <label>
            <span>Name</span>
            <input name="name" required />
          </label>
        </div>
        <div class="actions">
          <button class="primary">Create</button>
        </div>
      </form>
    </section>

    <!-- Supplier List -->
    <section class="form-section">
      <h2>All Suppliers</h2>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Code</th>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {#if suppliers.length}
              {#each suppliers as s}
                <tr>
                  <td>{fmtId(s.id)}</td>
                  <td colspan="2">
                    <form method="post" action="?/update" class="inline-form">
                      <input type="hidden" name="id" value={s.id} />
                      <input name="code" value={s.code} required />
                      <input name="name" value={s.name} required />
                      <button class="secondary">Save</button>
                    </form>
                  </td>
                  <td>
                    <form method="post" action="?/delete" on:submit={() => confirm('Delete this supplier?') || event.preventDefault()}>
                      <input type="hidden" name="id" value={s.id} />
                      <button class="danger">Delete</button>
                    </form>
                  </td>
                </tr>
              {/each}
            {:else}
              <tr>
                <td colspan="4" class="empty">No suppliers yet.</td>
              </tr>
            {/if}
          </tbody>
        </table>
      </div>
    </section>
  </div>
</div>

<style>
  
  section form {
    display: grid;
    gap: .9rem;
  }

  section form label {
    display: flex;
    flex-direction: column;
    gap: .35rem;
    font-size: .92rem;
    color: var(--secondaryText) !important;
  }

  section form input,
  section form select,
  section form textarea {
    width: 100%;
    box-sizing: border-box;
    border-radius: 12px;
    border: 1px solid var(--borderColor) !important;
    background: color-mix(in oklab, var(--surfaceColor) 88%, black 0%) !important;
    color: var(--primaryText) !important;
    padding: .65rem .8rem;
    outline: none;
    transition: border-color .15s ease, box-shadow .15s ease, background .15s ease;
  }

  section form input::placeholder,
  section form textarea::placeholder {
    color: color-mix(in oklab, var(--secondaryText) 70%, transparent) !important;
  }

  section form input:focus,
  section form select:focus,
  section form textarea:focus {
    border-color: var(--primaryColor) !important;
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--primaryColor) 30%, transparent) !important;
  }

  /* buttons — override hard-coded bg-* utility colors with tokens */
  section form button,
  section form input[type="submit"],
  section form input[type="button"] {
    appearance: none;
    border: 1px solid var(--borderColor) !important;
    background: color-mix(in oklab, var(--primaryColor) 16%, var(--surfaceColor)) !important;
    color: var(--primaryText) !important;
    padding: .6rem .9rem;
    border-radius: 12px;
    cursor: pointer;
    font-weight: 500;
    transition: background .15s ease, border-color .15s ease, transform .06s ease;
  }
  section form button:hover,
  section form input[type="submit"]:hover {
    background: color-mix(in oklab, var(--primaryColor) 24%, var(--surfaceColor)) !important;
    border-color: color-mix(in oklab, var(--primaryColor) 55%, var(--borderColor)) !important;
  }
  section form button:active,
  section form input[type="submit"]:active {
    transform: translateY(1px);
  }

  /* smart variants by action (no markup change) */
  section form[action*="create"] button,
  section form[action*="create"] input[type="submit"] {
    background: var(--primaryColor) !important;
    border-color: color-mix(in oklab, var(--primaryColor) 60%, var(--borderColor)) !important;
    color: var(--accentText, #fff) !important;
  }
  section form[action*="update"] button,
  section form[action*="update"] input[type="submit"] {
    background: color-mix(in oklab, var(--primaryColor) 12%, var(--surfaceColor)) !important;
  }
  section form[action*="delete"] button,
  section form[action*="delete"] input[type="submit"] {
    background: color-mix(in oklab, #ff4d4f 35%, var(--surfaceColor)) !important;
    border-color: color-mix(in oklab, #ff4d4f 60%, var(--borderColor)) !important;
    color: var(--primaryText) !important;
  }
  section form[action*="delete"] button:hover,
  section form[action*="delete"] input[type="submit"]:hover {
    background: color-mix(in oklab, #ff4d4f 45%, var(--surfaceColor)) !important;
  }

  /* =========== TABLE (below) =========== */
  section .overflow-x-auto,
  section .table-wrap {
    border: 1px solid var(--borderColor) !important;
    border-radius: 14px;
    overflow: auto;
    background: var(--surfaceColor) !important;
  }

  section table {
    width: 100%;
    border-collapse: collapse;
    font-size: .95rem;
    color: var(--primaryText) !important;
    background: var(--surfaceColor) !important;
  }

  section thead {
    background: color-mix(in oklab, var(--surfaceColor) 70%, white 5%) !important;
    color: var(--secondaryText) !important;
  }

  section th,
  section td {
    text-align: left;
    padding: .75rem 1rem !important;
    border-bottom: 1px solid color-mix(in oklab, var(--borderColor) 70%, transparent) !important;
  }

  /* even row stripe using tokens */
  section tbody tr:nth-child(even) {
    background: color-mix(in oklab, var(--surfaceColor) 88%, white 3%) !important;
  }

  /* inline edit form inside table rows */
  section table form {
    display: flex;
    flex-wrap: wrap;
    gap: .5rem;
    align-items: center;
  }
  section table form input[name="code"] {
    width: 9rem;
  }
  section table form input[name="name"] {
    min-width: 14rem;
    flex: 1;
  }

  /* empty state cell */
  section td[colspan="4"] {
    color: var(--secondaryText) !important;
  }
</style>
