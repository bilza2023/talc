<script>
  import FormUi from '$lib/formUi/FormUi.svelte';
  export let data;
  const { stationCode, grades = [], toStations = [], parents = [] } = data;

  const config = {
    id: 'oreDispatchForm',
    title: `Dispatch — ${stationCode}`,
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
      { type: 'hidden', name: 'stationCode', value: stationCode },
      {
        type: 'select', name: 'parentBatchId', label: 'Parent Batch', required: true,
        placeholder: 'Choose batch…',
        options: () =>
          parents.map(p => ({
            value: String(p.id),
            label: `#${p.id} · ${p.gradeCode} · avail ${p.availableTon}`
          }))
      },
      {
        type: 'select', name: 'toStation', label: 'To Station', required: true,
        placeholder: 'Pick station…',
        options: () => toStations.map(s => ({ value: s, label: s }))
      },
      { type: 'number', name: 'dispatchWeight', label: 'Weight (t)', required: true, min: 0.001, step: 0.001 },
      {
        type: 'select', name: 'dispatchGrade', label: 'Grade', required: true,
        placeholder: 'Pick grade…',
        options: () => grades.map(g => ({ value: g, label: g }))
      },
      { type: 'text',   name: 'truckNo', label: 'Truck No' },
      { type: 'number', name: 'amount',  label: 'Amount (PKR)', min: 0, step: 1 },
      { type: 'date',   name: 'dispatchedAt', label: 'Date' }
    ],
    // TRIAGE: unstick the button first
    submit: { label: 'Create Dispatch', disabledWhen: () => false },
    // Clear only fields that should reset
    clearOnSuccess: () => ({
      stationCode,
      parentBatchId: '',
      toStation: '',
      dispatchWeight: '',
      dispatchGrade: '',
      truckNo: '',
      amount: '',
      dispatchedAt: ''
    })
  };

  // Optional: page-level flash (not required for submit to work)
  let flash = { type:'', message:'' };
  const onSuccess = (e) => { flash = { type:'success', message: e.detail?.message ?? 'Saved' }; };
  const onFailure = (e) => { flash = { type:'error', message: e.detail?.message ?? 'Failed' }; };
</script>

{#if flash.message}
  <div class="flash {flash.type}">{flash.message}</div>
{/if}

<FormUi {config} on:success={onSuccess} on:failure={onFailure} />

<style>
  .flash{padding:.6rem .9rem;border-radius:8px;margin:.5rem 0}
  .flash.success{background:var(--secondaryColor);color:#fff}
  .flash.error{background:var(--accentColor);color:#fff}
</style>
