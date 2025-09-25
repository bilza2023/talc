
# Stock Object (`src/lib/stock/Stock.js`)

The **Stock object** is the universal engine for all inventory stages (`raw`, `processed`, `sorted`).
It encapsulates append-only ledgers, transport events, and computed balances.
Every change in inventory flows through this API. Nothing else mutates stock tables directly.

---

## Underlying Prisma Models

For each stage (`raw`, `processed`, `sorted`), two append-only models exist:

1. **Ledger** (`<stage>Ledger`)

   * Records *all* qty deltas.
   * Fields:

     * `mmaCode` (e.g. `ABS_RAW`, `PSS_PROCESSED`)
     * `supplierId`, `shade`, `size`
     * `qtyDelta` (+ or – tons)
     * `reason`: `"DIRECT" | "PROCESS" | "TRANSPORT" | "REVERSAL" | "ADJUST"`
     * `linkId`: process/transport id for lineage
     * `meta`: JSON (audit only)

2. **Transport** (`<stage>Transport`)

   * Records paired `DISPATCH/RECEIVE/CANCEL` events.
   * Groups by `transportId`.
   * Fields: `type`, `fromMmaCode`, `toMmaCode`, `supplierId`, `shade`, `size`, `qty`, `amount?`, `meta`.

Ledger = authoritative stock math.
Transport = event trail for moves.

---

## Construction

```js
import Stock from '../stock/Stock.js';
import { prisma } from '@prisma/client';

const processedStock = new Stock({
  prisma,
  ledgerModel: 'processedLedger',
  transportModel: 'processedTransport',
});
```

Options:

* `ledgerModel` — required Prisma delegate
* `transportModel` — required
* `prisma` — Prisma client (singleton injected)
* `sizeDefault` — default `"ANY"` to unify single-slot stages

---

## Core Verbs (Mutations)

### `deposit({ toMmaCode, supplierId, shade, size, qty, processId?, reason?, meta?, toStationCode? })`

* Appends +qty in ledger.
* `reason = "DIRECT"` (manual) or `"PROCESS"` (if `processId` provided).
* Returns `{ posting }`.

### `withdraw({ fromMmaCode, supplierId, shade, size, qty, processId, meta?, fromStationCode? })`

* Appends –qty in ledger (must have `processId`).
* Guard: rejects if insufficient stock (`onHand < qty`).
* Returns `{ posting }`.

### `dispatch({ fromMmaCode, toMmaCode, supplierId, shade, qty, size, amount?, meta?, transportId?, fromStationCode?, toStationCode? })`

* Transport outflow.
* Creates `DISPATCH` in transport + –qty in ledger.
* Returns `{ transportId, dispatch, posting }`.

### `receive({ transportId, toMmaCode, supplierId, qty?, shade?, amount?, meta?, toStationCode? })`

* Transport inflow.
* Creates `RECEIVE` in transport + +qty in ledger.
* Idempotent (re-running returns existing receive).
* Rejects if already canceled.

### `cancel({ transportId, meta? })`

* Transport rollback.
* Creates `CANCEL` in transport + +qty reversal in ledger.
* Idempotent unless already received.

---

## Reads (Computed)

* **`onHand({ mmaCode, supplierId, shade, size })`**
  → Σ `qtyDelta` from ledger.

* **`slots({ mmaCode, positiveOnly = true })`**
  → grouped balances per `(supplierId, shade, size)`.

* **`inbound({ mmaCode })`**
  → list of active DISPATCHes not yet received/canceled.

* **`outbound({ mmaCode })`**
  → list of DISPATCHes from this mmaCode not yet received/canceled.

* **`transportAmounts({ mmaCode })`**
  → rollup `{ outboundDispatched, inboundInTransit, inboundReceived }`.

* **`auditTransport({ transportId })`**
  → timeline of DISPATCH/RECEIVE/CANCEL + deltas.

* **`auditProcess({ processId, mmaCode? })`**
  → ledger rows linked to process + total qty delta.

---

## Invariants

* **Append-only:** Ledgers and transport tables never update in place. Only inserts.
* **Idempotency:**

  * `receive()` and `cancel()` are safe to retry.
  * `withdraw()`/`deposit()` require unique `processId` for lineage.
* **Balance math:**

  * `onHand(mma,supplier,shade,size)` must equal Σ of ledger deltas.
  * Tests enforce this (`*.audit.test.js`).
* **Processes:**

  * Higher-level flows (`processing.js`, `sorting.js`) only call `deposit`/`withdraw` and then log to their own tables.
  * They never touch Prisma directly for stock math.

---

## Usage in Processes

* **Processing (RAW → PROCESSED one→many)**

  * Withdraw from RAW slot.
  * Deposit into multiple PROCESSED slots.
  * Log to `process_tbl`.

* **Sorting (PROCESSED → SORTED one→one)**

  * Withdraw from PROCESSED slot.
  * Deposit into SORTED slot.
  * Log to `sorting_tbl` with `ht` and `wastage`.

Both are tested end-to-end (`processing.test.js`, `sorting.test.js`).

---

## Tests (Proof)

* **Deposit/Withdraw**: `raw.stock.deposit-withdraw.test.js`, `processed.stock.deposit-withdraw.test.js`, `sorted.stock.deposit-withdraw.test.js`
* **Transport**: `*.stock.transport.test.js`
* **Audit**: `*.stock.audit.test.js`
* **Processes**: `processing.test.js`, `sorting.test.js`

> Green tests = invariant safety. Any change that breaks them indicates design drift.

---

👉 With this `.md`, new contributors can *only* add **routes/pages/wiring**. The Stock object is sealed: append-only, audited, and untouchable.

---

Do you want me to also draft the **Process.md** right after this, to cover `processing.js` and `sorting.js` in the same style?
