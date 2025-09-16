<script>
  import FormUi from '$lib/formUi/FormUi.svelte';
  export let data;

  // From loader: { stationCode, suppliers, grades }
  const { stationCode, suppliers = [], grades = [] } = data;

  // Map options
  const gradeOptions = grades.map(g => ({ value: g, label: g }));
  const supplierOptions = suppliers.map(s => ({
    value: String(s.id),
    label: `${s.code} — ${s.name}`
  }));

  // FormUi config: everything the action needs
  const config = {
    id: 'oreDepositForm',
    title: 'Deposit Ore',
    action: '?/deposit', // matches actions.deposit
    initial: {
      stationCode,
      gradeCode: '',
      createdTon: '',
      supplierId: '',
      depositedAt: '' // optional ISO/date string
    },
    items: [
      // 1) Hidden station code (from ?station=XYZ)
      { type: 'hidden', name: 'stationCode', value: stationCode },

      // 2) Grade (required)
      {
        type: 'select',
        name: 'gradeCode',
        label: 'Grade',
        required: true,
        options: () => [{ value: '', label: 'Select grade' }, ...gradeOptions]
      },

      // 3) Quantity in tons (required, > 0)
      {
        type: 'number',
        name: 'createdTon',
        label: 'Quantity (t)',
        required: true,
        placeholder: 'e.g. 12.500',
        inputAttrs: { min: '0.001', step: '0.001', inputmode: 'decimal' }
      },

      // 4) Supplier (optional)
      {
        type: 'select',
        name: 'supplierId',
        label: 'Supplier (optional)',
        options: () => [{ value: '', label: '— None —' }, ...supplierOptions]
      },

      // 5) Deposited at (optional)
      // Your action accepts a string, so we send a local datetime string.
      {
        type: 'input',
        name: 'depositedAt',
        label: 'Deposited at (optional)',
        placeholder: 'YYYY-MM-DDTHH:mm',
        inputAttrs: { type: 'datetime-local' }
      }
    ],

    // Disable submit until required fields ready
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
