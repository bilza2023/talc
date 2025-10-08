<script>
    import ReportShell from '$lib/components/reports/ReportShell.svelte';
    import KPIBar from '$lib/components/reports/KPIBar.svelte';
    import FacetPanel from '$lib/components/reports/FacetPanel.svelte';
    import SmartTable from '$lib/components/reports/SmartTable.svelte';
    import { goto } from '$app/navigation';
  
    export let data;
  
    const tabs = [
      { label: 'Overview',       href: '/reports/transport/overview' },
      { label: 'In-Transit',     href: '/reports/transport/in-transit' },
      { label: 'Reconciliation', href: '/reports/transport/reconciliation' },
    ];
  
    const { filters, options, kpis, lanes, suppliers, variances } = data;
  
    // Facets
    const facets = [
      { key: 'from',       label: 'From MMA',   type: 'select', options: [''].concat(options.fromOpts  || []), value: filters.from },
      { key: 'to',         label: 'To MMA',     type: 'select', options: [''].concat(options.toOpts    || []), value: filters.to },
      { key: 'supplierId', label: 'Supplier',   type: 'select', options: [''].concat(options.supOpts   || []), value: filters.supplierId },
      { key: 'shade',      label: 'Shade',      type: 'select', options: [''].concat(options.shadeOpts || []), value: filters.shade },
      { key: 'size',       label: 'Size',       type: 'select', options: [''].concat(options.sizeOpts  || []), value: filters.size },
      { key: 'days',       label: 'Lookback',   type: 'chips',  options: options.daysOpts || [], value: filters.days },
    ];
    function pretty(opt) { return opt === '' ? 'All' : opt; }
    facets.forEach(f => f.options = f.options.map(pretty));
  
    function onFacetChange(e) {
      const next = e.detail || {};
      for (const k of Object.keys(next)) if (next[k] === 'All') next[k] = '';
      const qs = new URLSearchParams();
      if (next.from)       qs.set('from', next.from);
      if (next.to)         qs.set('to', next.to);
      if (next.supplierId) qs.set('supplierId', next.supplierId);
      if (next.shade)      qs.set('shade', next.shade);
      if (next.size)       qs.set('size', next.size);
      if (next.days)       qs.set('days', next.days);
      const q = qs.toString();
      goto(q ? `?${q}` : '?', { replaceState: true });
    }
  
    // Tables
    const laneCols = [
      { key: 'from',        label: 'From',         align: 'left' },
      { key: 'to',          label: 'To',           align: 'left' },
      { key: 'dispatched',  label: 'Dispatched',   align: 'right' },
      { key: 'received',    label: 'Received',     align: 'right' },
      { key: 'deltaQty',    label: 'Δ Qty',        align: 'right' },
      { key: 'deltaAmount', label: 'Δ Amount',     align: 'right' },
    ];
  
    const supCols = [
      { key: 'supplierId',  label: 'Supplier',     align: 'right', width: '90px' },
      { key: 'dispatched',  label: 'Dispatched',   align: 'right' },
      { key: 'received',    label: 'Received',     align: 'right' },
      { key: 'deltaQty',    label: 'Δ Qty',        align: 'right' },
      { key: 'deltaAmount', label: 'Δ Amount',     align: 'right' },
    ];
  
    const varCols = [
      { key: 'date',           label: 'Date',        align: 'left' },
      { key: 'transportId',    label: 'Transport',   align: 'left' },
      { key: 'from',           label: 'From',        align: 'left' },
      { key: 'to',             label: 'To',          align: 'left' },
      { key: 'supplierId',     label: 'Supplier',    align: 'right', width: '90px' },
      { key: 'shade',          label: 'Shade',       align: 'left' },
      { key: 'size',           label: 'Size',        align: 'left' },
      { key: 'qtyDispatch',    label: 'Qty D',       align: 'right' },
      { key: 'qtyReceive',     label: 'Qty R',       align: 'right' },
      { key: 'qtyDelta',       label: 'Δ Qty',       align: 'right' },
      { key: 'amountDispatch', label: 'Amt D',       align: 'right' },
      { key: 'amountReceive',  label: 'Amt R',       align: 'right' },
      { key: 'amountDelta',    label: 'Δ Amount',    align: 'right' },
      { key: 'status',         label: 'Status',      align: 'left' },
    ];
  
    const lanesRows = lanes || [];
    const supRows   = suppliers || [];
    const varRows   = (variances || []).map(r => ({
      ...r,
      date: new Date(r.date).toISOString().slice(0,10),
    }));
  </script>
  
  <ReportShell title="Transport — Reconciliation" dateRange="Live Data" {tabs}>
    <KPIBar items={kpis} />
  
    <div style="margin:1rem 0;">
      <FacetPanel facets={facets} on:change={onFacetChange} />
    </div>
  
    <h2 style="margin:1.25rem 0 .5rem;">By Lane</h2>
    <SmartTable columns={laneCols} rows={lanesRows} />
  
    <h2 style="margin:1.25rem 0 .5rem;">By Supplier</h2>
    <SmartTable columns={supCols} rows={supRows} />
  
    <h2 style="margin:1.25rem 0 .5rem;">Variances & Unsettled</h2>
    <SmartTable columns={varCols} rows={varRows} />
  </ReportShell>
  