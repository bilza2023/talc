<script>
    import { createEventDispatcher } from "svelte";
  
    // Input: chapters = [{ slug, name, exercises:[{ slug, name }] }, ...]
    export let chapters = [];
  
    // Two-way bound selection value: { chapter: string, exercise: string }
    export let value = { chapter: "", exercise: "" };
  
    // Labels / placeholders (customizable)
    export let chapterLabel = "Chapter";
    export let exerciseLabel = "Exercise";
    export let chapterPlaceholder = "Select chapter…";
    export let exercisePlaceholder = "Select exercise…";
  
    // Flags
    export let disabled = false;
    export let autoSelectFirstExercise = false; // pick first exercise automatically when chapter changes
  
    const dispatch = createEventDispatcher();
  
    // Helpers (support optional "filename" fallback if present in your data)
    const cSlug = (c) => c?.slug ?? c?.filename ?? "";
    const eSlug = (e) => e?.slug ?? e?.filename ?? "";
    const cName = (c) => c?.name ?? cSlug(c);
    const eName = (e) => e?.name ?? eSlug(e);
  
    // Normalize chapters list
    $: chapterList = Array.isArray(chapters) ? chapters : [];
  
    // Get exercises array for a chapter
    const exercisesOf = (chapterSlug) => {
      const ch = chapterList.find((c) => cSlug(c) === chapterSlug);
      return ch?.exercises ?? [];
    };
  
    // Emit selection to parent
    function emitPick() {
      const payload = { chapter: value.chapter, exercise: value.exercise };
      dispatch("pick", payload);
      dispatch("change", payload); // alias event
    }
  
    // Handlers
    function onChapterChange(e) {
      const nextChapter = e.target.value;
      let nextExercise = value.exercise;
  
      if (nextChapter !== value.chapter) {
        nextExercise = "";
        if (autoSelectFirstExercise) {
          const first = exercisesOf(nextChapter)[0];
          if (first) nextExercise = eSlug(first);
        }
      }
  
      value = { chapter: nextChapter, exercise: nextExercise };
      emitPick();
    }
  
    function onExerciseChange(e) {
      value = { ...value, exercise: e.target.value };
      emitPick();
    }
  
    // Sanitize selection if incoming data changes and makes current selection invalid
    $: {
      const chapterIsValid = !value.chapter || chapterList.some((c) => cSlug(c) === value.chapter);
      if (!chapterIsValid && (value.chapter || value.exercise)) {
        value = { chapter: "", exercise: "" };
      } else if (value.chapter) {
        const exerciseIsValid =
          !value.exercise || exercisesOf(value.chapter).some((x) => eSlug(x) === value.exercise);
        if (!exerciseIsValid) {
          value = { ...value, exercise: "" };
        }
      }
    }
  </script>
  
  <!-- Item 1: Chapter (no outer wrapper; parent controls layout) -->
  <div class="chapter">
    <label>
      <span>{chapterLabel}</span>
      <select
        bind:value={value.chapter}
        on:change={onChapterChange}
        disabled={disabled}
      >
        <option value="">{chapterPlaceholder}</option>
        {#each chapterList as ch (cSlug(ch))}
          <option value={cSlug(ch)}>{cName(ch)}</option>
        {/each}
      </select>
    </label>
  </div>
  
  <!-- Item 2: Exercise -->
  <div class="exercise">
    <label>
      <span>{exerciseLabel}</span>
      <select
        bind:value={value.exercise}
        on:change={onExerciseChange}
        disabled={disabled || !value.chapter}
      >
        <option value="">{exercisePlaceholder}</option>
        {#each exercisesOf(value.chapter) as ex (eSlug(ex))}
          <option value={eSlug(ex)}>{eName(ex)}</option>
        {/each}
      </select>
    </label>
  </div>
  
  <style>
    /* Minimal, parent controls layout (flex/grid). */
    label { display: grid; gap: 0.25rem; }
    select { width: 100%; padding: 0.6rem 0.7rem; border-radius: 8px; }
  </style>
  