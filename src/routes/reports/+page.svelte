<!-- /src/routes/reports/+page.svelte -->
<script>
    import ReportShell from '$lib/components/reports/ReportShell.svelte';
    import KPIBar from '$lib/components/reports/KPIBar.svelte';
    import SmartTable from '$lib/components/reports/SmartTable.svelte';
  
    export let data;
    const { kpis = [], slots = [] } = data;
  
    const columns = [
      { key: 'mmaCode', label: 'MMA', align: 'left' },
      { key: 'qty',     label: 'Qty (t)', align: 'right' },
    ];
  </script>
  
  <ReportShell title="Reports Dashboard" dateRange="Live Data">
    <KPIBar items={kpis} />
    <h2 style="margin-top:1.5rem;">Top MMAs by On-Hand</h2>
    <SmartTable {columns} rows={slots} />
  </ReportShell>
  