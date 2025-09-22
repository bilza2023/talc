# MMA / MMA4S — Overview & API

## What’s an “MMA” here?

“MMA” = **Material Movement Account** — a ledger that records how material moves and changes inside our system.

* We keep **one ledger per stage** of the material:

  * `rawMaterial3s` (3-slot: no size)
  * `processed4s` (4-slot: has size)
  * `sorted4s` (4-slot: has size)
* A **transport** keeps the material in the *same* stage table (e.g., `ABS_PROCESSED → PSS_PROCESSED`).
* A **process** moves material *across* stage tables (e.g., `raw → processed`, `processed → sorted`).

MMA4S is the **table-bound engine** that operates inside a single 4-slot table (`processed4s` or `sorted4s`). It handles stock math, logistics (dispatch/receive/cancel), and amount rollups for transports.
(Separate “process” flows are logged in the global `Process` header and are **counted** in stock math but **not created** by MMA4S.)

---

## How MMA4S is used in this app

* We instantiate one engine **per stage table** and export them:

  * `processed4s` engine → works only on the `processed4s` table.
  * `sorted4s` engine → works only on the `sorted4s` table.
* Each engine is configured with:

  * Which **MMA codes** are valid for that stage (registry)
  * Optional allow-lists (suppliers, dispatch targets)
  * A shared Prisma client

**Tests prove behavior end-to-end**: deposit raises on-hand, dispatch creates an in-transit row and reduces source stock, receive finalizes and raises destination, cancel restores, `stock()` summarizes, and `transportAmounts()` rolls up money totals.

---

## Data required to create a new MMA4S instance

```js
new MMA4S({
  prisma,                 // PrismaClient (optional – a shared one is ideal)
  table,                  // 'processed4s' | 'sorted4s'   (REQUIRED)
  registry,               // string[] of allowed MMA codes for this stage (optional)
  suppliersAllowed,       // number[] allow-list of supplier IDs (optional)
  dispatchTargets,        // string[] allow-list for toMmaCode (optional)
})
```

**Why these matter:**

* `table` binds the engine to a specific schema/table (safety + query correctness).
* `registry`/`dispatchTargets` prevent cross-stage mistakes (e.g., sending a `processed` row into a `sorted` engine).
* `suppliersAllowed` is a lightweight guard when a site/station is restricted.

---

## Supported verbs (API) & arguments

### 1) `deposit()`

**Purpose:** Add received quantity straight into a destination MMA in this stage.
**Within-stage only**; it does not create transport/process headers.

**Args**

* `mmaCode` (string; must be in engine’s registry)
* `supplierId` (number)
* `shade` (enum: `WHITE | GREY | LIGHTGREY | GREEN | MIXED`)
* `size` (enum: `LUMPS | CHIPS | FINE`)
* `qty` (number > 0)
* `meta` (optional JSON)

**Behavior**

* Creates a **RECEIVED / DEPOSIT** row at `toMmaCode = mmaCode`.
* Sets `dispatchQty` = `receiveQty` = `qty` and `dispatchShade` = `receiveShade` = `shade`.
* **Amounts** (`dispatchAmount`/`receiveAmount`) are **not used** for deposits.

---

### 2) `dispatch()`

**Purpose:** Create an **in-transit** transport **within the same stage**; lowers on-hand at the source.

**Args**

* `fromMmaCode`, `toMmaCode` (strings; both must pass engine checks)
* `supplierId` (number)
* `shade` (enum)
* `size` (enum)
* `qty` (number > 0) — must be ≤ current on-hand at source (same supplier/shade/size)
* `amount` or `amountDispatch` (number; optional) — transport **money** at dispatch
* `meta` (optional JSON)

**Behavior**

* Validates stock availability and registry/targets.
* Creates a **TRANSFER / IN\_TRANSIT** row with `dispatchQty`, `dispatchShade`, and optional `dispatchAmount`.
* On-hand at `fromMmaCode` drops immediately by `dispatchQty`.

---

### 3) `receive()`

**Purpose:** Finalize a transport at the destination MMA; raise on-hand at the destination.

**Args**

* `id` (row id of the in-transit transfer)
* `toMmaCode` (string; must match the row)
* `supplierId` (number; must match the row)
* `receiveQty` (optional; defaults to `dispatchQty`)
* `receiveShade` (optional; defaults to `dispatchShade`)
* `amount` or `amountReceive` (optional; receive side **money**; defaults to `dispatchAmount` if missing)
* `meta` (optional JSON)

**Behavior**

* Validates identity (supplier, destination).
* Updates row to **RECEIVED** with `receiveQty`, `receiveShade`, and optional `receiveAmount`.
* Raises on-hand at `toMmaCode` by `receiveQty`.
* **Idempotent**: calling `receive()` again on a RECEIVED row only updates `meta` (if provided).

---

### 4) `cancel()`

**Purpose:** Abort a transport that is still in-transit; restore source stock.

**Args**

* `id` (row id)
* `meta` (optional JSON)

**Behavior**

* Only allowed for **TRANSFER / IN\_TRANSIT** rows.
* Sets status to **CANCELED**; on-hand at source returns to pre-dispatch level.

---

### 5) `onHand()`

**Purpose:** Get current stock (quantity) for an MMA slot.

**Args**

* `mmaCode` (string)
* Optional filters: `supplierId`, `shade`, `size`

**Math**

```
onHand = (DEPOSIT.received into MMA)
       + (TRANSFER.received into MMA)
       + (PROCESS.received into MMA)
       – (TRANSFER.dispatched from MMA where IN_TRANSIT or RECEIVED)
       – (PROCESS.dispatched from MMA)
```

> Quantities are separate from money amounts; this function returns **qty only**.

---

### 6) `stock()`

**Purpose:** Snapshot of positive slots for an MMA (rollup by `supplierId`, `shade`, `size`).

**Args**

* `mmaCode` (string)
* `positiveOnly` (boolean; default `true`)

**Returns**

* Array of `{ supplierId, shade, size, qty }`, sorted by `qty` desc.

---

### 7) `inbound()` / `outbound()`

**Purpose:** List transfer edges into or out of a given `mmaCode`.

**Args**

* `mmaCode` (string)
* `status` (default `IN_TRANSIT`), or pass `undefined` to get all statuses.

**Returns**

* Raw rows ordered by newest.

---

### 8) `activeSlots()`

Alias for `stock({ positiveOnly: true })`.

---

### 9) `transportAmounts()`

**Purpose:** Money rollups for transports (not quantities).

**Args**

* `mmaCode` (string)

**Returns**

* `{ outboundDispatched, inboundInTransit, inboundReceived }`

  * `outboundDispatched` = Σ `dispatchAmount` for transfers **from** `mmaCode` (still in-transit or received)
  * `inboundInTransit`   = Σ `dispatchAmount` for transfers **to** `mmaCode` still **IN\_TRANSIT**
  * `inboundReceived`    = Σ `receiveAmount`  for transfers **to** `mmaCode` already **RECEIVED**

---

## Notes & invariants

* **Stage boundaries**

  * **Transport** must keep `fromTable === toTable` (same stage). MMA4S enforces by registry/targets.
  * **Process** must change tables (across stages). MMA4S **counts** process rows in math but does not create them.

* **Enums**

  * `Shade` is an enum: use one of `WHITE, GREY, LIGHTGREY, GREEN, MIXED`.
  * `Size` (4-slot only): `LUMPS, CHIPS, FINE`.
  * `MmaCode` values must match your deployment (e.g., `ABS_PROCESSED`, `PSS_PROCESSED`, `PSS_SORTED`).

* **Amounts vs Quantities**

  * Quantities drive stock; **amounts** are transport money totals.
  * Deposits don’t carry amounts; only `dispatch()`/`receive()` record `dispatchAmount`/`receiveAmount`.

* **Idempotency & safety**

  * `receive()` is idempotent: re-receiving only updates `meta` if already `RECEIVED`.
  * `cancel()` allowed **only** from `IN_TRANSIT`.
  * All verbs validate registry (MMAs), supplier allow-lists, and optional dispatch target allow-lists.

* **Performance**

  * Reads use Prisma `aggregate` / `groupBy` and scoped filters; all queries run against the bound table.
  * Stock math keeps a single consistent formula; no hidden adjustments.

* **Extensibility**

  * Add more `MmaCode` values (sites/stations) by extending the engine’s `registry` and `dispatchTargets`.
  * Add new `ProcessType`s without changing MMA4S (it already counts `BornAs.PROCESS` rows).

---

## TL;DR

* **MMA4S** is a safe, table-bound engine for **processed** & **sorted** stage logistics.
* It guarantees:

  * Correct **on-hand** math,
  * Proper **dispatch/receive/cancel** semantics,
  * Clear **money rollups** for transports,
  * And guardrails via registries and allow-lists.

If you want, I can drop this into a `docs/mma4s.md` file verbatim.
