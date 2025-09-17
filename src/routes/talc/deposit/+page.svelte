<script>
  import FormUi from '$lib/formUi/FormUi.svelte';

  // data from +page.server.js load()
  export let data;
  const { stationCode, grades = [], oreParents = [] } = data;

  // Parent Ore options: show grade + remaining
  function parentOptions() {
    return oreParents.map((p) => ({
      value: String(p.id),
      label: `Ore #${p.id} · ${p.gradeCode} · rem ${Number(p.remainingTon).toFixed(3)} t`
    }));
  }

  const config = {
    id: 'talcProcess',
    title: `Process Talc at ${stationCode}`,
    description: 'Convert ore into talc; records delta movements and the created talc batch.',
    action: '?/deposit', // same-page named action
    initial: {
      stationCode,           // hidden
      parentOreBatchId: '',  // select
      gradeCode: grades[0] ?? 'TL1', // talc grade
      oreDeltaTon: '',       // ore consumed (+) or entered as delta
      talcCreatedTon: '',    // talc produced
      talcDeltaTon: '',      // optional additional talc delta (waste/adjust)
      runKey: '',            // optional operator/batch run id
      processAt: ''          // "YYYY-MM-DDTHH:MM"
    },
    items: [
      { type:'note', text:`Station: ${stationCode}. Pick an ore parent with remaining stock.` },
      { type:'hidden', name:'stationCode', value: stationCode },

      { type:'select', name:'parentOreBatchId', label:'Parent Ore Batch', required:true, options: parentOptions },

      { type:'select', name:'gradeCode', label:'Talc Grade', required:true,
        options: () => grades.map(g => ({ value:g, label:g })) },

      { type:'number', name:'oreDeltaTon', label:'Ore Used (t)', required:true, min:0.001, step:0.001, placeholder:'e.g. 5.000' },

      { type:'number', name:'talcCreatedTon', label:'Talc Created (t)', required:true, min:0.001, step:0.001, placeholder:'e.g. 4.200' },

      { type:'number', name:'talcDeltaTon', label:'Talc Δ (optional, t)', min:0, step:0.001, placeholder:'e.g. 0.050' },

      { type:'text', name:'runKey', label:'Run Key (optional)', placeholder:'e.g. SHIFT-A/2025-09-17' },

      { type:'datetime', name:'processAt', label:'Process Time', step:60 }
    ],
    submit: {
      label: 'Save Process',
      disabledWhen: (v) =>
        !v.parentOreBatchId ||
        !v.gradeCode ||
        !(Number(v.oreDeltaTon) > 0) ||
        !(Number(v.talcCreatedTon) > 0)
    },
    clearOnSuccess: () => ({
      stationCode,
      parentOreBatchId: '',
      gradeCode: grades[0] ?? 'TL1',
      oreDeltaTon: '',
      talcCreatedTon: '',
      talcDeltaTon: '',
      runKey: '',
      processAt: ''
    }),
    showErrorsList: true
  };

  function handleSuccess(ev){
    // { success:true, station, talcBatchId }
    console.info('Talc process success:', ev.detail);
  }
  function handleFailure(ev){
    console.warn('Talc process failed:', ev.detail);
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
