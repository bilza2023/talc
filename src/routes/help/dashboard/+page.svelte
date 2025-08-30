<script>
  // Static documentation page — no loader needed.
  const chips = (arr) =>
    arr.map((t) => `<span class="chip">${t}</span>`).join(" ");
</script>

<style>
  /* Tiny helpers to keep markup clean */
  .card {
    @apply rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.03] shadow-xl shadow-black/30;
  }
  .card:hover {
    @apply border-white/20 from-white/10 to-white/[0.06];
  }
  .card-head {
    @apply flex items-center justify-between p-4 sm:p-5 border-b border-white/10;
  }
  .card-body {
    @apply p-4 sm:p-5 space-y-4;
  }
  .chip {
    @apply inline-flex items-center rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-xs text-[#c7d2e1];
  }
  .tbl {
    @apply w-full text-sm;
  }
  .tbl thead th {
    @apply text-left text-[#9fb0c5] font-normal px-3 py-2;
  }
  .tbl tbody td {
    @apply px-3 py-2 border-t border-white/10 align-top;
  }
  .link {
    @apply text-blue-300 hover:text-blue-200 hover:underline;
  }
  .pill {
    @apply inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm;
  }
</style>

<div class="min-h-screen bg-[#0b1018] text-[#e6ebf1]">
  <div class="mx-auto max-w-5xl p-6 space-y-8">

    <!-- Title -->
    <header class="space-y-2">
      <h1 class="text-3xl font-bold">Dashboards — In-App Documentation</h1>
      <p class="text-sm text-[#9fb0c5]">
        This page explains each dashboard, the columns it displays, supported filters,
        and how computed figures are derived.
      </p>
    </header>

    <!-- Quick links -->
    <section class="grid gap-3 sm:grid-cols-3">
      <a class="pill" href="/dashboard/overview"><span>📊</span><span>Overview</span></a>
      <a class="pill" href="/dashboard/ore"><span>🪨</span><span>Ore</span></a>
      <a class="pill" href="/dashboard/talc"><span>🧪</span><span>Talc</span></a>
      <a class="pill" href="/dashboard/in-transit"><span>🚚</span><span>In-Transit</span></a>
      <a class="pill" href="/dashboard/trucks"><span>🚛</span><span>Trucks</span></a>
      <a class="pill" href="/dashboard/traceability"><span>🔗</span><span>Traceability</span></a>
    </section>

    <!-- OVERVIEW -->
    <section id="overview" class="card">
      <div class="card-head">
        <h2 class="text-xl font-semibold">Overview</h2>
        <a class="link" href="/dashboard/overview">Open →</a>
      </div>
      <div class="card-body">
        <p>
          Company-wide snapshot combining **Ore** and **Talc**. Shows current
          in-transit shipments, plus total **Deposits** and **Receipts** within the selected window.
          It also displays per-material mini-cards for quick comparison.
        </p>

        <div class="space-y-2">
          <div class="text-xs text-[#9fb0c5]">Filters</div>
          <div class="space-x-1" use:chips>{@html chips(["days"])}</div>
        </div>

        <div class="space-y-2">
          <div class="text-xs text-[#9fb0c5]">Displayed fields</div>
          <table class="tbl">
            <thead>
              <tr><th>Field</th><th>Description</th><th>Formula / Source</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>In-Transit (shipments)</td>
                <td>Count of shipments with status = <code>in_transit</code>.</td>
                <td><code>count(*)</code> over ore+talc transports</td>
              </tr>
              <tr>
                <td>In-Transit Ton</td>
                <td>Total tonnage currently on the road.</td>
                <td><code>Σ sendWeightTon</code> where status=<code>in_transit</code></td>
              </tr>
              <tr>
                <td>Deposited (last N days)</td>
                <td>Total external inflow to stations.</td>
                <td><code>Σ deposit.weightTon</code> with <code>depositedAt ≥ since</code></td>
              </tr>
              <tr>
                <td>Received (last N days)</td>
                <td>Total received tonnage at destination stations.</td>
                <td><code>Σ receiveWeightTon</code> with status=<code>received</code> and <code>receivedAt ≥ since</code></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- ORE -->
    <section id="ore" class="card">
      <div class="card-head">
        <h2 class="text-xl font-semibold">Ore Dashboard</h2>
        <a class="link" href="/dashboard/ore">Open →</a>
      </div>
      <div class="card-body">
        <p>
          Material-specific view for **Ore**. Mirrors Overview but restricted to Ore:
          in-transit shipments, deposits (last N days), and receipts (last N days). Useful for
          supply-side tracking and supplier discussions.
        </p>

        <div class="space-y-2">
          <div class="text-xs text-[#9fb0c5]">Filters</div>
          <div class="space-x-1" use:chips>{@html chips(["days"])}</div>
        </div>

        <div class="space-y-2">
          <div class="text-xs text-[#9fb0c5]">Displayed fields</div>
          <table class="tbl">
            <thead>
              <tr><th>Field</th><th>Description</th><th>Formula / Source</th></tr>
            </thead>
            <tbody>
              <tr><td>In-Transit (shipments)</td><td>Ore shipments on road.</td><td>oreTransport: <code>count(*)</code> where status=<code>in_transit</code></td></tr>
              <tr><td>In-Transit Ton</td><td>Tons on road.</td><td>oreTransport: <code>Σ sendWeightTon</code> where status=<code>in_transit</code></td></tr>
              <tr><td>Deposited (last N days)</td><td>Incoming ore deposits.</td><td>oreDeposit: <code>Σ weightTon</code> with <code>depositedAt ≥ since</code></td></tr>
              <tr><td>Received (last N days)</td><td>Received ore tonnage.</td><td>oreTransport: <code>Σ receiveWeightTon</code> with status=<code>received</code> and <code>receivedAt ≥ since</code></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- TALC -->
    <section id="talc" class="card">
      <div class="card-head">
        <h2 class="text-xl font-semibold">Talc Dashboard</h2>
        <a class="link" href="/dashboard/talc">Open →</a>
      </div>
      <div class="card-body">
        <p>
          Material-specific view for **Talc**. Same KPIs as Ore but on Talc transport and deposits.
          When talc deposits are linked back to ore transports (<code>oreTransportId</code>),
          deeper analysis appears in the **Traceability** board.
        </p>

        <div class="space-y-2">
          <div class="text-xs text-[#9fb0c5]">Filters</div>
          <div class="space-x-1" use:chips>{@html chips(["days"])}</div>
        </div>

        <div class="space-y-2">
          <div class="text-xs text-[#9fb0c5]">Displayed fields</div>
          <table class="tbl">
            <thead>
              <tr><th>Field</th><th>Description</th><th>Formula / Source</th></tr>
            </thead>
            <tbody>
              <tr><td>In-Transit (shipments)</td><td>Talc shipments on road.</td><td>talcTransport: <code>count(*)</code> where status=<code>in_transit</code></td></tr>
              <tr><td>In-Transit Ton</td><td>Tons on road.</td><td>talcTransport: <code>Σ sendWeightTon</code> where status=<code>in_transit</code></td></tr>
              <tr><td>Deposited (last N days)</td><td>Incoming talc deposits.</td><td>talcDeposit: <code>Σ weightTon</code> with <code>depositedAt ≥ since</code></td></tr>
              <tr><td>Received (last N days)</td><td>Received talc tonnage.</td><td>talcTransport: <code>Σ receiveWeightTon</code> with status=<code>received</code> and <code>receivedAt ≥ since</code></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- IN-TRANSIT -->
    <section id="in-transit" class="card">
      <div class="card-head">
        <h2 class="text-xl font-semibold">In-Transit</h2>
        <a class="link" href="/dashboard/in-transit">Open →</a>
      </div>
      <div class="card-body">
        <p>
          Operations board showing **all shipments on the road** for the selected window, with a
          summary by destination and a full detail table. Great for daily dispatch/receiving coordination.
        </p>

        <div class="space-y-2">
          <div class="text-xs text-[#9fb0c5]">Filters</div>
          <div class="space-x-1" use:chips>{@html chips(["days","from","to","grade","truck"])}</div>
        </div>

        <div class="space-y-2">
          <div class="text-xs text-[#9fb0c5]">Displayed fields — Summary (By Destination)</div>
          <table class="tbl">
            <thead>
              <tr><th>Column</th><th>Description</th><th>Formula</th></tr>
            </thead>
            <tbody>
              <tr><td>To Station</td><td>Destination station code.</td><td>group key</td></tr>
              <tr><td>Shipments</td><td>Count headed to destination.</td><td><code>count(*)</code></td></tr>
              <tr><td>Total Ton</td><td>Sum of tonnage in transit to destination.</td><td><code>Σ sendWeightTon</code></td></tr>
              <tr><td>Avg Age (h)</td><td>Average hours since dispatch.</td><td><code>avg(now − dispatchedAt)</code></td></tr>
              <tr><td>Oldest (h)</td><td>Longest time on road.</td><td><code>max(now − dispatchedAt)</code></td></tr>
            </tbody>
          </table>
        </div>

        <div class="space-y-2">
          <div class="text-xs text-[#9fb0c5]">Displayed fields — Detail</div>
          <table class="tbl">
            <thead>
              <tr><th>Column</th><th>Description</th><th>Formula</th></tr>
            </thead>
            <tbody>
              <tr><td>Material</td><td>Ore / Talc.</td><td>transport table</td></tr>
              <tr><td>Truck</td><td>Truck number.</td><td>transport.truckNo</td></tr>
              <tr><td>Route</td><td>From → To station.</td><td><code>fromStation → toStation</code></td></tr>
              <tr><td>Grade</td><td>Shipment grade.</td><td><code>sendGradeCode</code></td></tr>
              <tr><td>Ton</td><td>Shipment tonnage.</td><td><code>sendWeightTon</code></td></tr>
              <tr><td>Dispatched At</td><td>Dispatch datetime.</td><td><code>dispatchedAt</code></td></tr>
              <tr><td>Age (h)</td><td>Hours since dispatch.</td><td><code>(now − dispatchedAt) / 3600000</code></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- TRUCKS -->
    <section id="trucks" class="card">
      <div class="card-head">
        <h2 class="text-xl font-semibold">Trucks</h2>
        <a class="link" href="/dashboard/trucks">Open →</a>
      </div>
      <div class="card-body">
        <p>
          Fleet view grouped by <strong>truckNo</strong> across Ore and Talc. Helps spot utilization,
          turnaround, and handling losses. Click through to investigate specific trucks (optional drill-down).
        </p>

        <div class="space-y-2">
          <div class="text-xs text-[#9fb0c5]">Filters</div>
          <div class="space-x-1" use:chips>{@html chips(["days"])}</div>
        </div>

        <div class="space-y-2">
          <div class="text-xs text-[#9fb0c5]">Displayed fields</div>
          <table class="tbl">
            <thead>
              <tr><th>Column</th><th>Description</th><th>Formula</th></tr>
            </thead>
            <tbody>
              <tr><td>Truck</td><td>Truck number.</td><td>group key</td></tr>
              <tr><td>Trips</td><td>Total trips (ore+talc).</td><td><code>count(*)</code></td></tr>
              <tr><td>Ore Trips / Talc Trips</td><td>Trips per material.</td><td><code>count(*)</code> by material</td></tr>
              <tr><td>Sent (t)</td><td>Total sent tonnage.</td><td><code>Σ sendWeightTon</code></td></tr>
              <tr><td>Received (t)</td><td>Total received tonnage.</td><td><code>Σ receiveWeightTon</code></td></tr>
              <tr><td>Loss %</td><td>Handling loss over window.</td><td><code>(Σ send − Σ recv) / Σ send × 100</code></td></tr>
              <tr><td>Avg Turnaround (h)</td><td>Avg hrs dispatch→receive.</td><td><code>avg(receivedAt − dispatchedAt)</code></td></tr>
              <tr><td>Last Trip</td><td>Most recent dispatch.</td><td><code>max(dispatchedAt)</code></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- TRACEABILITY -->
    <section id="traceability" class="card">
      <div class="card-head">
        <h2 class="text-xl font-semibold">Traceability (Ore → Talc)</h2>
        <a class="link" href="/dashboard/traceability">Open →</a>
      </div>
      <div class="card-body">
        <p>
          Links **Ore transports** to **Talc deposits** using <code>talcDeposit.oreTransportId</code>.
          Shows coverage (how much talc is mapped back to an ore shipment) and lag (time from ore receive
          to first linked talc deposit). Use this for QA/compliance.
        </p>

        <div class="space-y-2">
          <div class="text-xs text-[#9fb0c5]">Filters</div>
          <div class="space-x-1" use:chips>{@html chips(["days","from","to","status"])}</div>
        </div>

        <div class="space-y-2">
          <div class="text-xs text-[#9fb0c5]">Displayed fields</div>
          <table class="tbl">
            <thead>
              <tr><th>Column</th><th>Description</th><th>Formula</th></tr>
            </thead>
            <tbody>
              <tr><td>Route</td><td>Origin → Destination.</td><td><code>fromStation → toStation</code></td></tr>
              <tr><td>Send Grade</td><td>Ore shipment grade.</td><td><code>sendGradeCode</code></td></tr>
              <tr><td>Send (t)</td><td>Ore shipment tonnage.</td><td><code>sendWeightTon</code></td></tr>
              <tr><td>Linked Talc (t)</td><td>Talc deposits tied to the ore transport.</td><td><code>Σ talcDeposit.weightTon</code> grouped by <code>oreTransportId</code></td></tr>
              <tr><td>Coverage %</td><td>Linked ÷ Sent.</td><td><code>linkedTalcTon / sendTon × 100</code></td></tr>
              <tr><td>Lag (h)</td><td>Delay to first talc deposit.</td><td><code>min(talcDeposit.depositedAt) − receivedAt</code></td></tr>
              <tr><td>Received At</td><td>When the ore shipment was received.</td><td><code>receivedAt</code></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- Global Notes -->
    <section class="card">
      <div class="card-head">
        <h2 class="text-xl font-semibold">Notes</h2>
        <div />
      </div>
      <div class="card-body">
        <ul class="list-disc ml-6 text-sm space-y-1 text-[#c7d2e1]">
          <li>All links support query params (e.g. <code>?days=30&from=JSS&to=PSS</code>). Values are read in the server loaders.</li>
          <li>All computed figures are derived in loaders using simple aggregations; services stay minimal and reusable.</li>
          <li>Links in the UI build query strings via <code>$page.url.searchParams</code> to stay SSR-safe.</li>
        </ul>
      </div>
    </section>

  </div>
</div>
