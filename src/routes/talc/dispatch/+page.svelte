<script>
  import '$lib/styles/tokens.css';
  import FormUi from '$lib/formUi/FormUi.svelte';

  export let data;
  const { stationCode, grades, toStations, parents } = data;

  const dispatchConfig = {
    id: 'oreDispatch',
    title: `Dispatch Ore — ${stationCode}`,
    action: '?/dispatch',
    initial: {
      stationCode,
      parentBatchId: '',
      toStation: '',
      dispatchWeight: '',
      dispatchGrade: '',
      truckNo: '',
      amount: '',
      dispatchedAt: ''
    },
    items: [
      { type:'hidden', name:'stationCode', value:stationCode },

      {
        type:'select',
        name:'parentBatchId',
        label:'Parent Batch',
        required:true,
        options: () =>
          parents.map(p => ({
            value: String(p.id),
            label: `#${p.id} — ${p.gradeCode} — avail ${p.availableTon}t`
          }))
      },
      {
        type:'select',
        name:'toStation',
        label:'To Station',
        required:true,
        options: () => toStations.map(s => ({ value:s, label:s }))
      },
      { type:'number', name:'dispatchWeight', label:'Dispatch Weight (t)', min:0.01, step:0.01, required:true },
      {
        type:'select',
        name:'dispatchGrade',
        label:'Grade',
        required:true,
        options: () => grades.map(g => ({ value:g, label:g }))
      },
      { type:'text', name:'truckNo', label:'Truck No' },
      { type:'number', name:'amount', label:'Amount', min:0, step:0.01 },
      { type:'datetime', name:'dispatchedAt', label:'Dispatched At' }
    ],
    submit: {
      label:'Dispatch',
      disabledWhen: v => !v.parentBatchId || !v.toStation || !v.dispatchWeight || !v.dispatchGrade
    },
    clearOnSuccess: true,
    showErrorsList: true
  };

  function handleSuccess(ev) {
    console.log('Dispatch success:', ev.detail);
  }
</script>

<section class="wrap">
  <FormUi config={dispatchConfig} on:success={handleSuccess}/>
</section>

<style>
  .wrap {
    margin-inline: auto;
    padding: 1rem;
    width: min(90vw, 1100px);
    color: var(--primaryText);
  }
</style>
