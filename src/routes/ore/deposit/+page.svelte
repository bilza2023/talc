<script>
  import { enhance } from '$app/forms';
  import { TextInput, SelectInput, DateTimeInput, SubmitButton } from '$lib/formComponenets';

  // from +page.server.js load()
  export let data;

  const stationCode = data.stationCode ?? '';
  const grades = data.grades ?? [];
  const suppliers = data.suppliers ?? [];

  // top-level UI state
  let loading = false;
  let message = '';
  let messageType = ''; // 'success' | 'error'
  let serverErrors = [];

  // form values
  let values = {
    stationCode,
    gradeCode: '',
    createdTon: '',
    supplierId: '',
    amount: '',
    depositedAt: ''
  };

  // normalize suppliers -> { value, label }
  $: supplierOptions = (suppliers ?? []).map((s) => {
    const val = s?.id ?? s?.value ?? '';
    const lab = s?.name ?? s?.label ?? s?.companyName ?? (val ? `Supplier #${val}` : 'Unknown');
    return { value: String(val), label: String(lab) };
  });

  function handleEnhance() {
    loading = true;
    return async ({ result, update }) => {
      loading = false;

      if (result.type === 'success') {
        const d = result.data ?? {};
        messageType = 'success';
        message = d.message ?? (d.batchId ? `Deposit created (batch #${d.batchId})` : 'Deposit created');
        serverErrors = [];

        // clear (keep station)
        values = { ...values, gradeCode: '', createdTon: '', supplierId: '', amount: '', depositedAt: '' };
        scrollTo({ top: 0, behavior: 'smooth' });
      } else if (result.type === 'failure') {
        const d = result.data ?? {};
        messageType = 'error';
        message = d.message || 'Submission failed';
        serverErrors = Array.isArray(d.errors) ? d.errors : [];
        setTimeout(() => {
          const el = document.querySelector('form [name].input, form select.input');
          el && el.focus();
        }, 0);
      } else if (result.type === 'redirect') {
        update();
      } else {
        messageType = 'error';
        message = 'Server error';
        serverErrors = [];
      }
    };
  }
</script>

<!-- Top-level page messages -->
{#if message}
  <div class="alert {messageType === 'success' ? 'alert--success' : 'alert--error'}" role="status">
    {message}
  </div>
{/if}

{#if serverErrors.length}
  <ul class="errors">
    {#each serverErrors as err}<li>{err}</li>{/each}
  </ul>
{/if}

<form method="POST" action="?/deposit" use:enhance={handleEnhance} class="form">
  <!-- Hidden station code -->
  <input type="hidden" name="stationCode" value={values.stationCode} />

  <!-- 1) Supplier on top (optional) -->
  <SelectInput
    name="supplierId"
    label="Supplier (optional)"
    placeholder="No supplier"
    options={supplierOptions}
    bind:value={values.supplierId}
  />

  <!-- 2) Grade -->
  <SelectInput
    name="gradeCode"
    label="Grade"
    placeholder="Pick grade…"
    options={grades}
    bind:value={values.gradeCode}
    required
  />

  <!-- 3) Created Tons -->
  <TextInput
    name="createdTon"
    label="Created Tons"
    type="number"
    inputmode="decimal"
    step="0.001"
    min="0"
    placeholder="e.g., 12.500"
    bind:value={values.createdTon}
    required
  />

  <!-- Amount (optional) -->
  <TextInput
    name="amount"
    label="Amount (optional)"
    type="number"
    inputmode="decimal"
    step="0.01"
    min="0"
    placeholder="e.g., 25000"
    bind:value={values.amount}
  />

  <!-- Deposited At (optional) -->
  <DateTimeInput
    name="depositedAt"
    label="Deposited At (optional)"
    bind:value={values.depositedAt}
    step="60"
  />

  <div class="actions">
    <SubmitButton label="Create Deposit" {loading} />
  </div>
</form>

<style>
  .form { display:flex; flex-direction:column; gap:.75rem; }
  .actions { margin-top:.5rem; }

  /* Clear success=green, error=red */
  .alert{
    margin:.5rem 0 .75rem;
    padding:.6rem .8rem;
    border:1px solid var(--borderColor);
    border-radius:10px;
    background:var(--backgroundColor);
    color:var(--primaryText);
  }
  .alert--success{
    border-color: var(--successColor, #16a34a);
    background: color-mix(in oklab, var(--successColor, #16a34a) 12%, transparent);
    color: var(--successText, #d8e6dd);
  }
  .alert--error{
    border-color: var(--dangerColor, #dc2626);
    background: color-mix(in oklab, var(--dangerColor, #dc2626) 12%, transparent);
    color: var(--dangerText, #7f1d1d);
  }

  .errors{
    margin:.25rem 0 .75rem;
    padding-left:1.25rem;
    color: var(--dangerText, #7f1d1d);
  }
  .errors li{ margin:.15rem 0; }
</style>
