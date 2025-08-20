<script>
  import { enhance } from '$app/forms';
  export let fromStation = 'JSS';
  export let stations = ['PSS','KEF'];
  let formState = null;
  const onEnhance = () => ({ result }) => formState = result.data;
</script>

<form method="post" action="/stations?/dispatch" use:enhance={onEnhance} class="space-y-4">
  <input type="hidden" name="fromStation" value={fromStation} />

  <label>
    To Station
    <select name="toStation" required>
      {#each stations as s}
        <option value={s}>{s}</option>
      {/each}
    </select>
  </label>

  <label>
    Truck No
    <input type="text" name="truckNo" required />
  </label>

  <label>
    Weight (tons)
    <input type="number" name="weightTon" step="0.01" required />
  </label>

  <label>
    Grade
    <input type="text" name="gradeCode" required />
  </label>

  <button type="submit">Dispatch</button>
</form>
