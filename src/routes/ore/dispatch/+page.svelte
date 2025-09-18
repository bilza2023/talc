<script>
  import { enhance } from '$app/forms';
  import {
    TextInput,
    SelectInput,
    DateTimeInput,
    SubmitButton
  } from '$lib/formComponenets';

  export let data;

  const stationCode = data.stationCode ?? '';
  const toStations = data.toStations ?? [];
  const parents = data.parents ?? [];
  const GRADES = ['WL', 'WC', 'WF', 'GL', 'GC', 'GF'];

  let loading = false;
  let message = '';
  let messageType = ''; // 'success' | 'error'
  let serverErrors = [];

  let values = {
    stationCode,
    parentBatchId: '',
    toStation: '',
    dispatchWeight: '',
    dispatchGrade: '',
    truckNo: '',
    amount: '',
    dispatchedAt: ''
  };

  // Parent batch options: show grade + available tons
  $: parentOptions = parents.map((p) => ({
    value: String(p.id),
    label: `${p.gradeCode} — avail ${p.availableTon.toFixed(3)}t`
  }));

  // toStations already normalized as strings
  $: toStationOptions = (toStations ?? []).map((s) => ({ value: s, label: s }));

  function handleEnhance() {
    loading = true;
    return async ({ result, update }) => {
      loading = false;
      if (result.type === 'success') {
        const d = result.data ?? {};
        messageType = 'success';
        message = d.message ?? 'Dispatch created';
        serverErrors = [];
        values = {
          ...values,
          parentBatchId: '',
          toStation: '',
          dispatchWeight: '',
          dispatchGrade: '',
          truckNo: '',
          amount: '',
          dispatchedAt: ''
        };
        scrollTo({ top: 0, behavior: 'smooth' });
      } else if (result.type === 'failure') {
        const d = result.data ?? {};
        messageType = 'error';
        message = d.message || 'Submission failed';
        serverErrors = Array.isArray(d.errors) ? d.errors : [];
      } else if (result.type === 'redirect') {
        update();
      } else {
        messageType = 'error';
        message = 'Server error';
        serverErrors = [];
      }
    };
  }
</script>

<!-- Top messages -->
{#if message}
  <div class="alert {messageType === 'success' ? 'alert--success' : 'alert--error'}">{message}</div>
{/if}
{#if serverErrors.length}
  <ul class="errors">{#each serverErrors as e}<li>{e}</li>{/each}</ul>
{/if}

<form method="POST" action="?/dispatch" use:enhance={handleEnhance} class="form">
  <!-- Hidden station code -->
  <input type="hidden" name="stationCode" value={values.stationCode} />

  <!-- Parent batch -->
  <SelectInput
    name="parentBatchId"
    label="Parent Batch"
    placeholder="Pick batch…"
    options={parentOptions}
    bind:value={values.parentBatchId}
    required
  />

  <!-- To station -->
  <SelectInput
    name="toStation"
    label="To Station"
    placeholder="Select destination…"
    options={toStationOptions}
    bind:value={values.toStation}
    required
  />

  <!-- Dispatch weight -->
  <TextInput
    name="dispatchWeight"
    label="Dispatch Weight"
    type="number"
    step="0.001"
    min="0"
    bind:value={values.dispatchWeight}
    required
  />

  <!-- Dispatch grade -->

  <!-- 2) Grade -->
  <SelectInput
  name="dispatchGrade"
    label="Dispatch Grade"
  placeholder="Pick grade…"
  options={GRADES}
  bind:value={values.gradeCode}
  required
/>


  <!-- Truck number (optional) -->
  <TextInput
    name="truckNo"
    label="Truck No (optional)"
    bind:value={values.truckNo}
  />

  <!-- Amount (optional) -->
  <TextInput
    name="amount"
    label="Amount (optional)"
    type="number"
    step="0.01"
    min="0"
    bind:value={values.amount}
  />

  <!-- Dispatched at (optional) -->
  <DateTimeInput
    name="dispatchedAt"
    label="Dispatched At (optional)"
    bind:value={values.dispatchedAt}
    step="60"
  />

  <div class="actions">
    <SubmitButton label="Create Dispatch" {loading} />
  </div>
</form>

<style>
  .form { display:flex; flex-direction:column; gap:.75rem; }
  .actions { margin-top:.5rem; }

  .alert{
    margin:.5rem 0 .75rem;
    padding:.6rem .8rem;
    border:1px solid var(--borderColor);
    border-radius:10px;
  }
  .alert--success{
    border-color: var(--successColor, #16a34a);
    background: color-mix(in oklab, var(--successColor, #16a34a) 12%, transparent);
    color: var(--successText, #dce9e2);
  }
  .alert--error{
    border-color: var(--dangerColor, #dc2626);
    background: color-mix(in oklab, var(--dangerColor, #dc2626) 12%, transparent);
    color: var(--dangerText, #7f1d1d);
  }
  .errors{
    margin:.25rem 0 .75rem;
    padding-left:1.25rem;
    color: var(--dangerText, #7f1d1d);
  }
</style>
