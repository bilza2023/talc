# talc\_process.md

**Purpose:** Contract for how the **talc services** operate when talc is produced from ore via **processing**, and then moved via **talc edges** (dispatch/receive). No code—just the exact steps, fields, and checks.

---

## 0) Mental model (processing)

* **Processing** consumes **ore batches** and **births talc batches**.
* Each processing act is an entry in **`processEdge`**: it links `parentOreBatchId` → `childTalcBatchId`, records **`oreDeltaTon`** (ore consumed) and optional **`talcDeltaTon`** (portion of talc attributed to this edge/run).
* The **talc batch** born from processing is a normal batch: `bornAs="process"`, with its own `createdTon` and `remainingTon`.

---

## 1) Action methods (talc service)

### 1.1 `talcService.process(input)` → **creates child talc batch** + **creates processEdge** + **reduces ore stock**

**Who fills:** Processing/plant station (where talc is produced).

**Required input:**

* `parentOreBatchId`
* `stationCode` (where the talc batch is created)
* `gradeCode` (talc grade)
* `oreDeltaTon` (> 0)
* `talcCreatedTon` (> 0)  ← sets child talc batch `createdTon` & `remainingTon`

**Optional input:**

* `talcDeltaTon?` (if you want to explicitly attribute part/all of the child output to this specific edge; often equals `talcCreatedTon` when it’s a 1:1 run)
* `runKey?` (to group multiple inputs/outputs of one production run)
* `processAt?` (timestamp override)

**Prechecks:**

* `parentOreBatch` exists; `oreDeltaTon > 0`.
* `parentOreBatch.remainingTon ≥ oreDeltaTon`.
* `talcCreatedTon > 0`.

**DB effects:**

1. **Create child `talcBatch`:**

   * `stationCode = input.stationCode`
   * `gradeCode = input.gradeCode`
   * `bornAs = "process"`
   * `createdTon = talcCreatedTon`
   * `remainingTon = talcCreatedTon`
2. **Create `processEdge`:**

   * `parentOreBatchId = input.parentOreBatchId`
   * `childTalcBatchId = (new talc batch id)`
   * `oreDeltaTon = input.oreDeltaTon`
   * `talcDeltaTon = input.talcDeltaTon?` (optional)
   * `runKey?`, `processAt?`
3. **Update parent ore batch:**

   * `remainingTon := remainingTon - oreDeltaTon`
   * (Optionally) `closedAt = now()` if `remainingTon` becomes 0.

**Post rules / notes:**

* **Recovery** can be computed per run as `sum(talcDeltaTon) / sum(oreDeltaTon)` or, if you don’t apportion, as `talcCreatedTon / oreDeltaTon` for single-edge runs.
* If you run **multi-input, multi-output** under one `runKey`, the sum of `talcDeltaTon` across edges should match total talc created across those child batches (by policy).

---

### 1.2 `talcService.dispatch(input)` → **creates talc edge (in\_transit)**

**Who fills:** **Source** station (owning the talc parent batch).

**Required input:**

* `parentBatchId`
* `toStation`
* `dispatchWeight` (> 0)
* `dispatchGrade`
  **Optional input:** `truckNo?`, `amount?`, `dispatchedAt?`, `dispatchedBy?`

**Prechecks:**

* `parentBatch` exists; `fromStation = parentBatch.stationCode`.
* Over-dispatch guard: `sum(dispatchWeight of in_transit edges) + dispatchWeight ≤ parentBatch.remainingTon`.

**DB effects:**

* Create `talcEdge` with:

  * `status = in_transit`
  * `fromStation = parentBatch.stationCode`, `toStation = input.toStation`
  * `dispatchWeight`, `dispatchGrade`
  * `truckNo?`, `amount?`, `dispatchedAt?`, `dispatchedBy?`
  * `parentBatchId = input.parentBatchId`
  * `childBatchId = null`

**Stock:** No immediate deduction (we deduct on **receive** using actuals).

---

### 1.3 `talcService.receive(input)` → **creates child talc batch** + **completes the same talc edge**

**Who fills:** **Destination** station.

**Required input:**

* `edgeId`
* `receiveWeight` (> 0, ≤ `dispatchWeight`)
  **Optional input:** `receiveGrade?`, `receivedAt?`, `receivedBy?`

**Prechecks:**

* Edge exists, `status = in_transit`.
* `receiveWeight ≤ dispatchWeight`.

**DB effects:**

1. **Create child `talcBatch`:**

   * `stationCode = edge.toStation`
   * `gradeCode = receiveGrade ?? edge.dispatchGrade`
   * `bornAs = "receive"`
   * `createdTon = receiveWeight`
   * `remainingTon = receiveWeight`
2. **Update talc edge:**

   * `status = received`
   * Set `receiveWeight`, `receiveGrade?`, `receivedAt?`, `receivedBy?`
   * `childBatchId = (new child id)`
3. **Update parent talc batch:**

   * `remainingTon := remainingTon - receiveWeight`
   * If `remainingTon == 0`, optionally set `closedAt`.

**Variance:** Derived as `dispatchWeight - receiveWeight` (not stored).

---

## 2) Core queries (talc)

1. **getTalcStationStock(stationCode)**

   * `sum(remainingTon)` for `talcBatch` at that station.

2. **listTalcIncomingEdges(stationCode)**

   * `talcEdge` where `status = in_transit AND toStation = stationCode`.

3. **talcOutgoingsByBatch(parentBatchId)**

   * All `talcEdge` for that parent, any status, newest first.

4. **talcBatchLedger(batchId)**

   * `edgesOut`, `edgesIn`, and any `processEdge` rows where `childTalcBatchId = batchId`.

5. **processRun(runKey)**

   * All `processEdge` with `runKey`, their ore parents, and talc children; compute recovery aggregates.

6. **recoveryByDay(stationCode, day)**

   * Aggregate `sum(oreDeltaTon)` vs `sum(talcDeltaTon)` for `processEdge` at plant station & day.

---

## 3) Service invariants (talc side)

* While `talcEdge.status = in_transit`: `childBatchId IS NULL`.
* On `received`: `childBatchId` **must** be set, and `child.stationCode = toStation`.
* `fromStation = parentBatch.stationCode`.
* **Processing** is the only way talc is born besides receive; at processing, **ore stock decreases** by `oreDeltaTon`; talc batch **created** with `talcCreatedTon`.
* Only **receive** changes talc parent stock; only **process** changes ore parent stock.

---

### Done

This is the full talc-side contract: **process** births talc (via `processEdge`), **dispatch** opens a talc movement, **receive** closes it and births a new talc batch. The schema stays uncluttered; services know exactly which fields to touch and when.
