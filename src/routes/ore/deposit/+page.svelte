<!-- /src/routes/ore/deposit/+page.svelte -->
<script>
  import FormUi from '$lib/formUi/FormUi.svelte';

  export let data;
  const { stationCode, suppliers = [], grades = [] } = data;
  let flash = { type: '', message: '' };

function handleSuccess(ev) {
  // ev.detail is whatever your action returned
  flash = { type: 'success', message: ev?.detail?.message ?? 'Saved successfully.' };
  scrollTo({ top: 0, behavior: 'smooth' });
}

function handleFailure(ev) {
  const msg = ev?.detail?.message || 'Could not save. Please check the fields below.';
  flash = { type: 'error', message: msg };
  scrollTo({ top: 0, behavior: 'smooth' });
}

  // quick client-side debug so you can see *something* when you click
  // console.log('[ore/deposit] boot', { stationCode, suppliersCount: suppliers.length, grades });

  const config = {
    id: 'oreDepositForm',
    title: `Deposit Ore — ${stationCode}`,
    action: '?/deposit',
    method: 'post',
    initial: {
      stationCode,
      gradeCode: '',
      createdTon: '',
      supplierId: '',
      amount: '',
      depositedAt: ''
    },
    items: [
      { type: 'hidden', name: 'stationCode', value: stationCode },

      {
        type: 'select',
        name: 'supplierId',
        label: 'Supplier',
        options: () => (suppliers ?? []).map(s => ({ value: String(s.id), label: s.name || `#${s.id}` }))
      },
      {
        type: 'select',
        name: 'gradeCode',
        label: 'Grade',
        required: true,
        options: () => (grades ?? []).map(g => ({ value: g, label: g }))
      },

      {
        type: 'number',
        name: 'createdTon',
        label: 'Tons',
        required: true,
        min: 0.001,
        step: 0.001,
        placeholder: '0.000'
      },

      { type: 'number', name: 'amount', label: 'Amount (PKR)', min: 1, step: 1 },

      // keep native calendar/date input
      { type: 'date', name: 'depositedAt', label: 'Deposit Date' }
    ],

    // keep button enabled; server validates
    submit: {
      label: 'Deposit',
      disabledWhen: () => false
    },

    showErrorsList: true,

    clearOnSuccess: () => ({
      stationCode,
      gradeCode: '',
      createdTon: '',
      supplierId: '',
      amount: '',
      depositedAt: ''
    })
  };

  
</script>
{#if flash.message}
  <div class="flash {flash.type}" role="status">{flash.message}</div>
{/if}
<section class="wrap">
  <FormUi {config} on:success={handleSuccess} on:failure={handleFailure} />
</section>

<style>
  .wrap {
    margin-inline: auto;
    width: min(92vw, 720px);
    padding: 1rem;
  }
  .flash{
    margin:.5rem 0 1rem;
    padding:.75rem 1rem;
    border:1px solid var(--borderColor);
    border-radius:12px;
    background:var(--surfaceColor);
    color:var(--primaryText);
    font-weight:600;
  }
  .flash.success{ border-color: var(--secondaryColor); }
  .flash.error{   border-color: var(--accentColor); }
</style>
