<script>
  import FormUi from '$lib/formUi/FormUi.svelte';
  export let data;

  // From loader: { stationCode, suppliers, grades }
  const { stationCode, suppliers = [], grades = [] } = data;

  const gradeOptions = grades.map(g => ({ value: g, label: g }));

  const supplierOptions = suppliers.map(s => ({
    value: String(s.id),
    label: `${s.code} — ${s.name}`
  }));

  const config = {
    id: 'oreDepositForm',
    title: 'Deposit Ore',
    action: '?/deposit',
    method: 'POST',
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
        options: () => [{ value: '', label: 'Select grade' }, ...gradeOptions]
      },

      {
        type: 'number',
        name: 'createdTon',
        label: 'Quantity (t)',
        required: true,
        placeholder: 'e.g. 12.500',
        inputAttrs: { min: '0.001', step: '0.001', inputmode: 'decimal' }
      },

      {
        type: 'select',
        name: 'supplierId',
        label: 'Supplier (optional)',
        options: () => [{ value: '', label: '— None —' }, ...supplierOptions]
      },

      {
        type: 'number',
        name: 'amount',
        label: 'Amount (optional)',
        placeholder: 'e.g. 25000.00',
        inputAttrs: { min: '0.01', step: '0.01', inputmode: 'decimal' }
      },

      {
        type: 'date',          // this will render <input type="date">
        name: 'depositedAt',
        label: 'Deposited At',
        required: false
      }

    ],
    submit: {
      label: 'Save Deposit',
      disabledWhen: v => !(v?.gradeCode && Number(v?.createdTon) > 0)
    }
  };
</script>

<section class="wrap">
  <FormUi {config}/>
</section>

<style>
  .wrap {
    margin-inline: auto;
    width: min(92vw, 720px);
    padding: 1rem;
  }
</style>
