<!-- /src/routes/ore/deposit/+page.svelte -->
<script>
  import FormUi from '$lib/formUi/FormUi.svelte';

  export let data;
  const { stationCode, suppliers = [], grades = [] } = data;

  // quick client-side debug so you can see *something* when you click
  console.log('[ore/deposit] boot', { stationCode, suppliersCount: suppliers.length, grades });

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

      {
        type: 'select',
        name: 'supplierId',
        label: 'Supplier',
        options: () => (suppliers ?? []).map(s => ({ value: String(s.id), label: s.name || `#${s.id}` }))
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

  function handleSuccess(ev) {
    console.log('[ore/deposit] SUCCESS', ev?.detail);
  }

  function handleFailure(ev) {
    console.log('[ore/deposit] FAILURE', ev?.detail);
  }
</script>

<section class="wrap">
  <FormUi {config} on:success={handleSuccess} on:failure={handleFailure} />
</section>

<style>
  .wrap {
    margin-inline: auto;
    width: min(92vw, 720px);
    padding: 1rem;
  }
</style>
