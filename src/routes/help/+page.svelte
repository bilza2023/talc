<script>
  import H1 from "$lib/components/H1.svelte";
</script>

<H1 text="Northwest Minerals Logistics App" />
<section class="help">

  <article class="content">

    <section id="overview">
      <h2>Overview</h2>
      <p>
        This app helps you manage material from the moment it is purchased until it is exported.
        Every movement—purchase, screening, sorting, dispatch, or receive—is recorded automatically.
        You don’t have to worry about calculations; the app keeps every total, slot, and station
        up to date for you.
      </p>
      <p>
        Think of it as a live material ledger. You simply record what happens, and the system
        keeps track of where your stock is, how much remains, and what is in transit.
      </p>
    </section>

    <section id="stations">
      <h2>Stations</h2>
      <p>
        A <strong>station</strong> is a real physical place where material is handled.
        There are currently three:
      </p>
      <ul>
        <li><strong>ABS</strong> — where raw material is first received and screened.</li>
        <li><strong>PSS</strong> — where sorted and graded material is stored or prepared for dispatch.</li>
        <li><strong>KEF</strong> — where final export batches are assembled and shipped.</li>
      </ul>
      <p>
        When you open a station page, you’ll find only the actions that make sense there.
        For example, at ABS you can purchase and screen material; at PSS you can sort or dispatch;
        at KEF you mostly receive and reconcile.
      </p>
    </section>

    <section id="mma">
      <h2>MMAs (Material Buckets)</h2>
      <p>
        An <strong>MMA</strong> defines a stock bucket inside a station.
        It tells the system what form the material is in.
      </p>
      <ul>
        <li><strong>ABS_RAW</strong> — unscreened incoming stock.</li>
        <li><strong>ABS_SCREENED</strong> — screened stock ready for dispatch.</li>
        <li><strong>PSS_SCREENED</strong> — material received from ABS, ready to be sorted.</li>
        <li><strong>PSS_SORTED</strong> — sorted, quality-checked stock.</li>
        <li><strong>KEF_SORTED</strong> — final, export-ready stock at the port.</li>
      </ul>
      <p>
        Each deposit, withdrawal, or transfer updates one of these MMAs.
        The system uses them to calculate live balances, supplier-wise slots, and total availability.
      </p>
    </section>

    <section id="lanes">
      <h2>Lanes (Movement Paths)</h2>
      <p>
        A <strong>lane</strong> connects two MMAs and represents a shipment path—such as
        <em>ABS_SCREENED → PSS_SCREENED</em> or <em>PSS_SORTED → KEF_SORTED</em>.
        Each dispatch and receive pair belongs to a lane.
      </p>
      <p>
        When you dispatch, material leaves the first MMA and becomes “in transit.”
        When you receive, it enters the next MMA and the lane is marked complete.
      </p>
      <p>
        Lanes give you visibility on how much material is currently moving between stations
        and help prevent double counting.
      </p>
    </section>

    <section id="actions">
      <h2>Everyday Actions</h2>

      <h3>1) Purchase / Deposit</h3>
      <p>
        Use this when you buy material from a supplier. It adds stock into an MMA.
        Choose the correct station, shade, size, and quantity.
      </p>
      <p>
        Example: buying 20 tons of WHITE LUMPS at ABS means a deposit into <strong>ABS_SCREENED</strong>.
        Buying raw unscreened material goes into <strong>ABS_RAW</strong>.
      </p>

      <h3>2) Withdraw</h3>
      <p>
        Use withdraw when a process consumes stock, such as screening or sorting.
        The system links it to a process ID so you can trace which batch was used.
        Withdraw always decreases on-hand quantity in the selected bucket.
      </p>

      <h3>3) Dispatch</h3>
      <p>
        Dispatch is used when you send material to another station.
        You’ll enter supplier, shade, size, and quantity; the system automatically creates
        a transport ID for tracking.
        The material is now marked as “in transit.”
      </p>

      <h3>4) Receive</h3>
      <p>
        Once the truck reaches its destination, open the receive page, select the same transport,
        and confirm the quantity. This adds the stock into the destination MMA and closes the trip.
      </p>

      <h3>5) Audit / Reconciliation</h3>
      <p>
        Reports like “In Transit” and “Reconciliation” show what’s pending or mismatched.
        If a dispatch has not been received, it will appear here until confirmed.
      </p>
    </section>

    <section id="slots">
      <h2>On-Hand & Slots</h2>
      <p>
        On-hand means the total quantity currently available in an MMA.
        Slots break this down by supplier, shade, and size.
        This helps you answer questions like:
      </p>
      <ul>
        <li>“How much WHITE CHIPS from Wahid Khan are left at PSS?”</li>
        <li>“How much mixed fine is at KEF?”</li>
      </ul>
      <p>
        You don’t have to calculate these manually—the system keeps all slot balances live.
      </p>
    </section>

    <section id="workflow">
      <h2>Typical Workflow</h2>
      <ol>
        <li><strong>Purchase</strong> material at ABS or PSS.</li>
        <li><strong>Screen</strong> or <strong>Sort</strong> it as needed (uses Withdraw + Deposit automatically).</li>
        <li><strong>Dispatch</strong> screened or sorted stock to the next station.</li>
        <li><strong>Receive</strong> at the destination to update stock there.</li>
        <li>Check <strong>Reports</strong> for totals and pending movements.</li>
      </ol>
      <p>
        Following this order keeps the digital ledger perfectly aligned with real stock flow.
      </p>
    </section>

    <section id="troubleshooting">
      <h2>Troubleshooting & Good Habits</h2>
      <ul>
        <li>If totals look off, open the “In Transit” report—most often a dispatch wasn’t received yet.</li>
        <li>Always double-check the <em>shade</em> and <em>size</em> before confirming entries.</li>
        <li>Use <strong>Reports → Supplier Ledger</strong> to review all transactions for a specific supplier.</li>
        <li>Try to finish all receives before day end so balances stay current.</li>
        <li>If something is wrongly entered, don’t delete data—enter a correcting transaction instead.</li>
      </ul>
    </section>

    <section id="tips">
      <h2>Helpful Tips</h2>
      <ul>
        <li>Keep shades consistent: WHITE, LIGHTGREY, GREY, MIXED.</li>
        <li>“ANY” size is used only for raw or unscreened material.</li>
        <li>For each dispatch, you can track progress directly under the station’s “Logistics” report.</li>
        <li>Sorting adds value but also creates separate stock lines per size; the app handles that automatically.</li>
        <li>Purchases always increase balance; withdraws and dispatches reduce it; receives restore it at destination.</li>
      </ul>
    </section>

  </article>
</section>

<style>
  .help {
    max-width: 960px;
    margin: 0 auto;
    padding: var(--spaceLg, 24px) var(--spaceMd, 16px);
    color: var(--primaryText, #e6ebf1);
  }

  .content h2 {
    margin-top: var(--spaceLg, 24px);
    margin-bottom: var(--spaceSm, 12px);
    font-size: clamp(1.1rem, 2.8vw, 1.4rem);
  }
  .content h3 {
    margin-top: var(--spaceMd, 16px);
    margin-bottom: var(--spaceXs, 8px);
    font-size: clamp(1rem, 2.4vw, 1.2rem);
  }

  p { margin: 0 0 var(--spaceSm, 12px); line-height: 1.6; }
  ul, ol { margin: 0 0 var(--spaceSm, 12px); padding-left: 1.1rem; }

  .content section {
    border: 1px solid var(--borderColor, #2b3a36);
    border-radius: var(--radiusXl, 16px);
    background: color-mix(in srgb, var(--surfaceColor, #0f1a16) 10%, transparent);
    padding: var(--spaceMd, 16px);
    margin-bottom: var(--spaceMd, 16px);
    box-shadow: var(--shadowLg, 0 6px 20px rgba(0,0,0,.25));
    backdrop-filter: blur(var(--blurSm, 6px)) saturate(115%);
    -webkit-backdrop-filter: blur(var(--blurSm, 6px)) saturate(115%);
  }

  @media (min-width: 720px) {
    .help { padding: var(--spaceXl, 32px) var(--spaceLg, 24px); }
  }
</style>
