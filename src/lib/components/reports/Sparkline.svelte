<script>
    // points: array of numbers
    export let points = [];
    export let width = 120;
    export let height = 36;
    export let strokeWidth = 2;
  
    const pad = 3; // visual padding inside svg
  
    $: min = points.length ? Math.min(...points) : 0;
    $: max = points.length ? Math.max(...points) : 0;
    $: span = Math.max(1e-6, max - min);
    $: stepX = points.length > 1 ? (width - pad * 2) / (points.length - 1) : 0;
  
    $: d = (() => {
      if (!points.length) return '';
      return points.map((v, i) => {
        const x = pad + i * stepX;
        const y = pad + (height - pad * 2) * (1 - (v - min) / span);
        return `${i ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`;
      }).join(' ');
    })();
  
    $: last = points.length ? {
      x: pad + (points.length - 1) * stepX,
      y: pad + (height - pad * 2) * (1 - (points.at(-1) - min) / span)
    } : { x: 0, y: 0 };
  </script>
  
  <svg {width} {height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
    <path d={d} fill="none" stroke="var(--accent, #6ee7ff)" stroke-width={strokeWidth} stroke-linecap="round" stroke-linejoin="round" />
    {#if points.length}
      <circle cx={last.x} cy={last.y} r={strokeWidth + 1.5} fill="var(--accent, #6ee7ff)" />
    {/if}
  </svg>
  
  <style>
    svg { display: block; }
  </style>
  