<script>
  import { enhance } from '$app/forms';
  let formState = null;
  const onEnhance = () => ({ result }) => formState = result.data;
</script>

<form method="post" action="/stations?/unload" use:enhance={onEnhance} class="space-y-4">
  <label>
    Transport ID
    <input type="number" name="transportId" required />
  </label>

  <label>
    Received Weight (tons)
    <input type="number" name="receivedWeight" step="0.01" required />
  </label>

  <label>
    Received Grade
    <input type="text" name="receivedGrade" required />
  </label>

  <label>
    Received By
    <input type="text" name="receivedBy" required />
  </label>

  <label>
    Received At (optional)
    <input type="datetime-local" name="receivedAt" />
  </label>

  <button type="submit">Unload</button>
</form>
