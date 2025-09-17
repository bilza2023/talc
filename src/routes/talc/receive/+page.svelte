<script>
  import '$lib/styles/tokens.css';
  import FormUi from '$lib/formUi/FormUi.svelte';

  // from +page.server.js load()
  export let data;
  const { stationCode, grades = [], incomingEdges = [] } = data;

  // Build options for the incoming edges (show origin, weight, grade, truck, time)
  function edgeOptions() {
    return incomingEdges.map((e) => ({
      value: String(e.id),
      label:
        `#${e.id} · ${e.fromStation}→${e.toStation}` +
        ` · ${Number(e.dispatchWeight ?? 0).toFixed(3)}t` +
        (e.dispatchGrade ? ` · ${e.dispatchGrade}` : '') +
        (e.truckNo ? ` · 🚚 ${e.truckNo}` : '') +
        (e.createdAt ? ` · ${new Date(e.createdAt).toISOString().slice(0,16).replace('T',' ')}` : '')
    }));
  }

  const config = {
    id: 'talcReceive',
    title: `Receive Talc — ${stationCode}`,
    description: 'Close an incoming talc edge by receiving all/part of the dispatched weight.',
    action: '?/receive', // named action on same route
    initial: {
      stationCode,   // hidden
      edgeId: '',
      receiveWeight: '',
      receiveGrade: '', // optional (keep dispatched if blank)
      receivedAt: '',   // YYYY-MM-DDTHH:MM
      receivedBy: ''    // optional
    },
    items: [
      { type:'note', text:`Station: ${stationCode}. Pick an in-transit talc edge.` },
      { type:'hidden', name:'stationCode', value: stationCode },

      { type:'select', name:'edgeId', label:'Incoming Edge', required:true, options: edgeOptions },
      { type:'number', name:'receiveWeight', label:'Receive Weight (t)', required:true, min:0.001, step:0.001, placeholder:'e.g. 7.500' },

      { type:'select', name:'receiveGrade', label:'Receive Grade (optional)',
        options: () => [{ value:'', label:'— keep as dispatched —' }, ...grades.map(g => ({ value:g, label:g }))] },

      { type:'datetime', name:'receivedAt', label:'Received At', step:60 },
      { type:'text',     name:'receivedBy', label:'Received By (optional)', placeholder:'Operator name / badge' }
    ],
    submit: {
      label: 'Receive',
      disabledWhen: (v) => !v.edgeId || !(Number(v.receiveWeight) > 0)
    },
    clearOnSuccess: () => ({
      stationCode,
      edgeId: '',
      receiveWeight: '',
      receiveGrade: '',
      receivedAt: '',
      receivedBy: ''
    }),
    showErrorsList: true
  };

  function handleSuccess(ev){
    // { success:true, station, edgeId, childBatchId }
    console.info('Talc receive success:', ev.detail);
  }
  function handleFailure(ev){
    console.warn('Talc receive failed:', ev.detail);
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
