
<script>
    export let text = '';
    export let size = '1.5rem'; // you can pass '2rem', '24px', etc.
  </script>
  
  <h1 class="page-title" style="font-size:{size};">{text}</h1>
  
  <style>
    .page-title {
      text-align: center;
      color: var(--baseTextColor);
      margin: 0.75rem 0 1rem;
      font-weight: 600;
      letter-spacing: 0.3px;
    }
  </style>
  