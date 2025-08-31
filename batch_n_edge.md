# batch\_n\_edge.md

**Purpose:** This document defines exactly how the **services layer** will operate on the final Batch ↔ Edge schema (gold-standard). It specifies what each **action** does (which rows it creates/updates; who fills which fields) and the **core queries** we’ll support. No code—just the contract.

---

## 0) Mental model (one paragraph)

* **Batch** is the source of truth for stock (`createdTon`, `remainingTon`, open/close, birth “why”).
* **Edge** is one transfer/transaction: the source station **dispatches** (opens it, fills dispatch side); the destination station **receives** (completes it, fills receive side, and sets the `childBatchId`).
* Stock reduction happens **on receive** using the **actual** `receiveWeight`. Variance (dispatch − receive) is **derived**, not stored.

---

## 1) Entities (what fields matter during actions)

### oreBatch / talcBatch

* `stationCode`, `gradeCode`
* `createdTon` (set at birth)
* `remainingTon` (authoritative running balance)
* `bornAs` (ore: `"deposit"` or `"receive"`; talc: `"process"` or `"receive"`)
* `createdAt`, `closedAt?`
* (ore only) `supplierId?`, `depositedAt?`

### oreEdge / talcEdge (identical contract)

* Lifecycle: `status` in `{ in_transit, received, cancelled }`
* Route: `fromStation`, `toStation`
* Logistics: `truckNo?`, `amount?` (bag count etc.)
* Dispatch side (filled by **source**): `dispatchWeight`, `dispatchGrade`, `dispatchedAt?`, `dispatchedBy?`
* Receive side (filled by **destination**): `receiveWeight?`, `receiveGrade?`, `receivedAt?`, `receivedBy?`
* Linking: `parentBatchId` (required), `childBatchId?` (set at receive), `createdAt`

---

## 2) Action methods (per service)

### 2.1 oreService.deposit(input)  → creates **batch only**

**Intent:** Record external ore arrival at a station (no movement).
**Required input (source fills):**

* `stationCode`, `gradeCode`, `createdTon`
* Optional: `supplierId?`, `depositedAt?`
  **DB effects:**
* Create `oreBatch` with:

  * `bornAs = "deposit"`
  * `createdTon = input.createdTon`
  * `remainingTon = input.createdTon`
  * `stationCode`, `gradeCode`, `supplierId?`, `depositedAt?`
* **No edge is created.**
  **Post rules:**
* If `remainingTon` drops to 0 later, services may set `closedAt`.

---

### 2.2 oreService.dispatch(input)  → creates **edge only**

**Who fills:** **Source** station.
**Required input:**

* `parentBatchId`, `toStation`, `dispatchWeight`, `dispatchGrade`
* Optional: `truckNo?`, `amount?`, `dispatchedAt?`, `dispatchedBy?`
  **Prechecks:**
* `parentBatch` exists; `fromStation = parentBatch.stationCode`.
* `dispatchWeight > 0`.
* **Over-dispatch guard:** `sum(dispatchWeight of parent’s in_transit edges) + dispatchWeight ≤ parentBatch.remainingTon`.
  **DB effects:**
* Create `oreEdge` with:

  * `status = in_transit`
  * `fromStation = parentBatch.stationCode`, `toStation = input.toStation`
  * `dispatchWeight`, `dispatchGrade`
  * `truckNo?`, `amount?`, `dispatchedAt?`, `dispatchedBy?`
  * `parentBatchId = input.parentBatchId`
  * `childBatchId = null`
    **Post rules:** None (no stock change yet).

> **talcService.dispatch** is identical, using `talcBatch` + `talcEdge`.

---

### 2.3 oreService.receive(input)  → **creates child batch** + **completes same edge**

**Who fills:** **Destination** station.
**Required input:**

* `edgeId`, `receiveWeight`
* Optional: `receiveGrade?`, `receivedAt?`, `receivedBy?`
  **Prechecks:**
* Edge exists, `status = in_transit`.
* `receiveWeight > 0` and `receiveWeight ≤ dispatchWeight`.
* Destination station will be `edge.toStation`.
  **DB effects:**

1. **Create child `oreBatch`:**

   * `stationCode = edge.toStation`
   * `gradeCode = receiveGrade ?? edge.dispatchGrade`
   * `bornAs = "receive"`
   * `createdTon = receiveWeight`
   * `remainingTon = receiveWeight`
2. **Update the edge:**

   * `status = received`
   * Set `receiveWeight`, `receiveGrade?`, `receivedAt?`, `receivedBy?`
   * `childBatchId = (new child id)`
3. **Update parent batch:**

   * `remainingTon := remainingTon - receiveWeight`
   * If `remainingTon == 0`, set `closedAt = now()` (service’s discretion).
     **Post rules:**

* Derived variance available: `dispatchWeight - receiveWeight`.

> **talcService.receive** is identical, creating a **child `talcBatch`** and completing a **`talcEdge`**.

---

### 2.4 Cancellation (optional, when needed)

* **Who:** Source station (before receive).
* **Effect:** Set `status = cancelled`; leave `childBatchId = null`; do **not** change stock.
* **Guard:** Only allowed while `status = in_transit`.

---

## 3) Notes on symmetry

* **Two edge tables** are kept (ore/talc) but share **one contract** (fields + behavior).
* **Dispatch fields** are source-filled; **receive fields** are destination-filled; all **receive-side** fields are **nullable** until completion.

---

## 4) Core queries (lookup methods)

1. **getStationStock(stationCode)**

   * Return:

     * `ore: sum(remainingTon) of oreBatch at stationCode`
     * `talc: sum(remainingTon) of talcBatch at stationCode`
   * Notes: Batch is authoritative; do not recompute from edges.

2. **listIncomingEdges(stationCode)**

   * Return in-transit edges destined to `stationCode`:

     * ` oreEdge where status = in_transit AND toStation = stationCode`
     * `talcEdge where status = in_transit AND toStation = stationCode`

3. **listOutgoingsByBatch(parentBatchId)**

   * All edges (any status) for that parent, newest first.

4. **getBatchLedger(batchId, material)**

   * For a given batch:

     * `edgesOut`, `edgesIn`
     * (plus, if ore/talc linkage matters) related `processEdge` rows.

5. **inTransitByTruck(truckNo)**

   * All in-transit edges (ore + talc) filtered by `truckNo`.

6. **recentActivity(stationCode, since?)**

   * Edges & Batches created/received since a timestamp.

7. **supplierDeposits(supplierId)** (ore only)

   * All `oreBatch` with `bornAs = "deposit"` and `supplierId`.

8. **processRun(runKey)**

   * All `processEdge` with that key + their parent/child batches.

---

## 5) Service-level invariants (to enforce)

* While `status = in_transit`: `childBatchId IS NULL`.
* On `status = received`: `childBatchId` **must be set** and the child’s `stationCode == toStation`.
* `fromStation == parentBatch.stationCode`.
* `receiveWeight ≤ dispatchWeight`.
* Over-dispatch prevention on the parent (see §2.2 prechecks).
* Only **receive** changes stock (parent minus **actual** `receiveWeight`; child `createdTon = receiveWeight`).
* Variance is **derived** (never stored).

---

## 6) Minimal logging (recommended)

* Log one event per action with enough metadata to audit:

  * `type = "ORE_DEPOSIT" | "ORE_DISPATCH" | "ORE_RECEIVE" | "TALC_DISPATCH" | "TALC_RECEIVE" | "EDGE_CANCELLED"`
  * Include ids (batch/edge), weights, stations, truck, and user.

---

### That’s it

This is the full contract for implementing services on the Batch ↔ Edge schema—**no surprises during coding** and the exact fields each step must touch.
