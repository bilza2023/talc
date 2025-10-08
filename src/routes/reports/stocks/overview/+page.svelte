<script>
    import ReportShell from '$lib/components/reports/ReportShell.svelte';
    import KPIBar from '$lib/components/reports/KPIBar.svelte';
    import SmartTable from '$lib/components/reports/SmartTable.svelte';
  
    export let data;
  
    const tabs = [
      { label: 'Overview',  href: '/reports/stocks/overview' },
      { label: 'Slots',     href: '/reports/stocks/slots' },
      { label: 'Suppliers', href: '/reports/stocks/suppliers' },
    ];
  
    const kpis = data.kpis ?? [];
  
    // Heat table columns built from families list
    const heatCols = [
      { key: 'station', label: 'Station', align: 'left' },
      ...((data.families ?? []).map(f => ({ key: f, label: f, align: 'right' }))),
      { key: 'total', label: 'Total (t)', align: 'right' }
    ];
  
    const heatRows = (data.heatRows ?? []).map(r => {
      const obj = { ...r };
      // format numbers as plain numbers; SmartTable formats numbers automatically
      return obj;
    });
  
    const slotCols = [
      { key: 'mmaCode',    label: 'MMA', align: 'left' },
      { key: 'supplierId', label: 'Supplier', align: 'right' },
      { key: 'shade',      label: 'Shade', align: 'left' },
      { key: 'size',       label: 'Size', align: 'left' },
      { key: 'qty',        label: 'Qty (t)', align: 'right' },
    ];
  
    const topSlots = data.topSlots ?? [];
  </script>
  
  <ReportShell title="Stocks — Overview" dateRange="Live Data" {tabs}>
  
    <KPIBar items={kpis} />
  
    <h2 style="margin:1.25rem 0 .5rem;">Station × Family</h2>
    <SmartTable columns={heatCols} rows={heatRows} />
  
    <h2 style="margin:1.25rem 0 .5rem;">Top 25 Slots</h2>
    <SmartTable columns={slotCols} rows={topSlots} />
  
  </ReportShell>
  