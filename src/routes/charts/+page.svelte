<script>
    import Piechart from '$lib/components/Piechart.svelte';
  
    const fruitData = [
      { label: 'Apples', value: 40, color: '#0088FE' },
      { label: 'Bananas', value: 30, color: '#00C49F' },
      { label: 'Cherries', value: 20, color: '#FFBB28' },
      { label: 'Dates', value: 10, color: '#FF8042' }
    ];
  </script>
  
  <section class="wrap">
    <h1>Charts Demo</h1>
    <Piechart data={fruitData} legendDirection="col" />
  </section>
  
  <style>
    .wrap {
      margin: 0 auto;
      padding: 1.5rem;
      width: min(90vw, 900px);
      text-align: center;
    }
    h1 {
      font-size: 1.5rem;
      margin-bottom: 1.5rem;
    }
  </style>
  