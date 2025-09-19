<script>
  import { enhance } from '$app/forms';
  import {
    TextInput,
    SelectInput,
    DateTimeInput,
    SubmitButton
  } from '$lib/formComponenets';

  export let data;

  const stationCode   = data.stationCode ?? '';
  const incomingEdges = data.incomingEdges ?? [];
  const grades        = data.grades ?? [];

  let loading = false;
  let message = '';
  let messageType = ''; // 'success' | 'error'
  let serverErrors = [];

  let values = {
    stationCode,
    edgeId: '',
    receiveWeight: '',
    receiveGrade: '',
    receivedAt: '',
    receivedBy: ''
  };

  // Build dropdowns
  $: edgeOptions = (incomingEdges ?? []).map((e) => {
    const id = String(e.id);
    const w  = Number(e.dispatchWeight ?? 0).toFixed(3);
    const g  = e.dispatchGrade ?? '-';
    const from = e.fromStation ?? '?';
    // Example: "#123 — WL 12.500t from JSS"
    return { value: id, label: `#${id} — ${g} ${w}t from ${from}` };
  });

  $: gradeOptions = (grades ?? []).map((g) => ({ value: g, label: g }));

  function handleEnhance() {
    loading = true;
    return async ({ result, update }) => {
      loading = false;

      if (result.type === 'success') {
        const d = result.data ?? {};
        messageType = 'success';
        const tail = d.childBatchId ? ` → batch #${d.childBatchId}` : '';
        message = d.message ?? `Received edge #${d.edgeId ?? values.edgeId}${tail}`;
        serverErrors = [];

        // clear (keep station code)
        values = {
          ...values,
          edgeId: '',
          receiveWeight: '',
          receiveGrade: '',
          receivedAt: '',
          receivedBy: ''
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

{#if message}
  <div class="alert {messageType === 'success' ? 'alert--success' : 'alert--error'}">{message}</div>
{/if}
{#if serverErrors.length}
  <ul class="errors">{#each serverErrors as e}<li>{e}</li>{/each}</ul>
{/if}

<form method="POST" action="?/receive" use:enhance={handleEnhance} class="form">
  <!-- Hidden station code -->
  <input type="hidden" name="stationCode" value={values.stationCode} />

  <!-- Incoming edge -->
  <SelectInput
    name="edgeId"
    label="Incoming Dispatch"
    placeholder="Pick incoming dispatch…"
    options={edgeOptions}
    bind:value={values.edgeId}
    required
  />

  <!-- Received weight -->
  <TextInput
    name="receiveWeight"
    label="Received Weight"
    type="number"
    step="0.001"
    min="0"
    bind:value={values.receiveWeight}
    required
  />

  <!-- Received grade (optional; choose to override) -->
  <SelectInput
    name="receiveGrade"
    label="Received Grade (optional)"
    placeholder="Same as dispatched"
    options={gradeOptions}
    bind:value={values.receiveGrade}
  />

  <!-- Received at (optional) -->
  <DateTimeInput
    name="receivedAt"
    label="Received At (optional)"
    bind:value={values.receivedAt}
    step="60"
  />

  <!-- Received by (optional) -->
  <TextInput
    name="receivedBy"
    label="Received By (optional)"
    bind:value={values.receivedBy}
  />

  <div class="actions">
    <SubmitButton label="Confirm Receive" {loading} />
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
    color: #fff; /* keep success text white on green */
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
