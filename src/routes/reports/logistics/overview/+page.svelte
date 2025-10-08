
<script>
    import ReportShell from '$lib/components/reports/ReportShell.svelte';
    import KPIBar from '$lib/components/reports/KPIBar.svelte';
    import SmartTable from '$lib/components/reports/SmartTable.svelte';
  
    export let data;
  
    const tabs = [
      { label: 'Overview',       href: '/reports/transport/overview' },
      { label: 'In-Transit',     href: '/reports/transport/in-transit' },
      { label: 'Reconciliation', href: '/reports/transport/reconciliation' },
    ];
  
    const kpis = data.kpis ?? [];
  
    const laneCols = [
      { key: 'from',      label: 'From',        align: 'left' },
      { key: 'to',        label: 'To',          align: 'left' },
      { key: 'dispatched',label: 'Dispatched',  align: 'right' },
      { key: 'received',  label: 'Received',    align: 'right' },
      { key: 'delta',     label: 'Δ Qty',       align: 'right' },
    ];
  
    const lanes = data.lanes ?? [];
  
    const recentCols = [
      { key: 'date',           label: 'Date',        align: 'left' },
      { key: 'transportId',    label: 'Transport',   align: 'left' },
      { key: 'lane',           label: 'Lane',        align: 'left' },
      { key: 'supplierId',     label: 'Supplier',    align: 'right', width: '90px' },
      { key: 'shade',          label: 'Shade',       align: 'left' },
      { key: 'size',           label: 'Size',        align: 'left' },
      { key: 'qty',            label: 'Qty (t)',     align: 'right' },
      { key: 'status',         label: 'Status',      align: 'left' },
      { key: 'ageHrs',         label: 'Age (hrs)',   align: 'right' },
      { key: 'qtyDelta',       label: 'Δ Qty',       align: 'right' },
      { key: 'amountDelta',    label: 'Δ Amount',    align: 'right' },
    ];
  
    // format dates as yyyy-mm-dd for display
    const recent = (data.recent ?? []).map(r => ({
      ...r,
      date: new Date(r.date).toISOString().slice(0, 10)
    }));
  </script>
  
  <ReportShell title="Logistics" dateRange="Live Data" {tabs}>
    <KPIBar items={kpis} />
  
    <h2 style="margin:1.25rem 0 .5rem;">Lane Summary</h2>
    <SmartTable columns={laneCols} rows={lanes} />
  
    <h2 style="margin:1.25rem 0 .5rem;">Recent Movements (latest 25 dispatches)</h2>
    <SmartTable columns={recentCols} rows={recent} />
  </ReportShell>
  