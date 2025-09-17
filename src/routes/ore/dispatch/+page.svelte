<script>
  import FormUi from '$lib/formUi/FormUi.svelte';
  export let data; // { stationCode, grades, toStations, parents }
  const { stationCode, grades = [], toStations = [], parents = [] } = data;

  let flash = { type: '', message: '' };

  const config = {
    id: 'oreDispatchForm',
    title: `Dispatch Ore — ${stationCode}`,
    action: '?/dispatch',
    method: 'post',
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
      { type:'hidden', name:'stationCode', value: stationCode },
      { type:'select', name:'parentBatchId', label:'Parent Batch', required:true,
        options: () => parents.map(p => ({ value:String(p.id), label:`#${p.id} • ${p.gradeCode} • avail ${p.availableTon}t` })) },
      { type:'select', name:'toStation', label:'To Station', required:true,
        options: () => toStations.map(s => ({ value:s, label:s })) },
      { type:'number', name:'dispatchWeight', label:'Weight (t)', required:true, min:0.001, step:0.001 },
      { type:'select', name:'dispatchGrade', label:'Grade', required:true,
  options: () => (grades ?? []).map(g => ({ value: String(g), label: String(g) })) },

      { type:'text',   name:'truckNo', label:'Truck No' },
      { type:'number', name:'amount', label:'Amount (PKR)', min:0, step:1 },
      { type:'date',   name:'dispatchedAt', label:'Dispatch Date' }
    ],
    submit: { label:'Dispatch', disabledWhen: () => false }, // ← triage mode
    clearOnSuccess: () => ({
      stationCode, parentBatchId:'', toStation:'', dispatchWeight:'', dispatchGrade:'',
      truckNo:'', amount:'', dispatchedAt:''
    }),
    // showErrorsList: true
  };

  // function handleSuccess(ev){
  //   flash = { type:'success', message: ev?.detail?.message ?? 'Saved.' };
  //   scrollTo({ top: 0, behavior: 'smooth' });
  // }
  // function handleFailure(ev){
  //   flash = { type:'error', message: ev?.detail?.message ?? 'Could not save.' };
  //   scrollTo({ top: 0, behavior: 'smooth' });
  // }
</script>

<!-- -{#if flash.message}<div class="flash {flash.type}">{flash.message}</div>{/if} -->


<FormUi {config}  />


