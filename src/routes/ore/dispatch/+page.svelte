<script>
  import FormUi from '$lib/formUi/FormUi.svelte';

  // from +page.server.js load()
  export let data;
  const { stationCode, grades = [], toStations = [], parents = [] } = data;

  // build nice labels for parent batches (show grade + available ton)
  function parentOptions() {
    return parents.map((p) => ({
      value: String(p.id),
      label: `#${p.id} · ${p.gradeCode} · avail ${Number(p.availableTon).toFixed(3)} t`
    }));
  }

  // form config (FormUi)
  const config = {
    id: 'oreDispatch',
    title: `Dispatch from ${stationCode}`,
    description: 'Create an in-transit edge for a parent batch.',
    action: '?/dispatch',         // important: same-page named action
    initial: {
      stationCode,                // hidden field
      parentBatchId: '',          // user selects
      toStation: toStations[0] ?? '',
      dispatchWeight: '',
      dispatchGrade: grades[0] ?? '',
      truckNo: '',
      amount: '',
      dispatchedAt: ''            // e.g. "2025-09-17T09:00"
    },
    items: [
      // context + guidance
      { type:'note', text:`Station: ${stationCode}. Choose a parent with enough available tonnage.` },

      // hidden fields
      { type:'hidden', name:'stationCode', value:stationCode },

      // required selections
      { type:'select',  name:'parentBatchId', label:'Parent Batch', required:true, options: parentOptions },
      { type:'select',  name:'toStation',     label:'To Station',   required:true, options: () => toStations.map(s => ({ value:s, label:s })) },

      // main payload
      { type:'number',  name:'dispatchWeight', label:'Dispatch Weight (t)', required:true, min:0.001, step:0.001, placeholder:'e.g. 12.500' },
      { type:'select',  name:'dispatchGrade',  label:'Dispatch Grade', required:true, options: () => grades.map(g => ({ value:g, label:g })) },

      // optional extras
      { type:'text',    name:'truckNo',        label:'Truck # (optional)', placeholder:'e.g. ABC-123' },
      { type:'number',  name:'amount',         label:'Amount (optional)', min:0, step:1, placeholder:'PKR' },

      // when
      { type:'datetime', name:'dispatchedAt',  label:'Dispatched At', step:60 }
    ],
    submit: {
      label: 'Dispatch',
      disabledWhen: (v) => !v.parentBatchId || !v.toStation || !(Number(v.dispatchWeight) > 0)
    },
    clearOnSuccess: (/*prev*/) => ({
      // keep station + selections sticky, clear numbers/text
      stationCode,
      parentBatchId: '',
      toStation: toStations[0] ?? '',
      dispatchWeight: '',
      dispatchGrade: grades[0] ?? '',
      truckNo: '',
      amount: '',
      dispatchedAt: ''
    }),
    showErrorsList: true
  };

  // Success → you can toast, navigate, or simply log
  function handleSuccess(ev){
    // ev.detail comes from success() of the action
    // { success:true, station, toStation, edgeId }
    // e.g. show a lightweight toast or console
    console.info('Dispatch success:', ev.detail);
  }

  // Failure → already shown inline by FormUi; still useful to log
  function handleFailure(ev){
    console.warn('Dispatch failed:', ev.detail);
  }
</script>

<section class="wrap">
  <FormUi {config} on:success={handleSuccess} on:failure={handleFailure}/>
</section>

<style>
  .wrap{
    margin-inline:auto;
    width:min(92vw, 720px);
    padding: var(--space, 1rem);
    color: var(--primaryText);
  }
</style>
