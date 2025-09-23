Here’s a companion doc for your processes, in the same style as **Stock.md**. Save as `docs/Processes.md`.

---

# Processes (`/src/lib/processes/`)

Processes are **purpose-built bridges** between stock families.
They **do not** touch Prisma directly for inventory.
They only call `Stock.deposit` / `Stock.withdraw` and then write a single row into their **own process table** for audit and idempotency.

Currently two processes exist:

* `processing.js` — RAW → PROCESSED (one-to-many)
* `sorting.js` — PROCESSED → SORTED (one-to-one)

---

## 1. Processing (RAW → PROCESSED, one→many)

**File:** `src/lib/processes/processing.js`

### Purpose

* Split one **RAW slot** (e.g., 30t WHITE/LUMPS) into many **PROCESSED slots** (e.g., 10t LUMPS + 10t CHIPS + 10t FINE).
* Log full lineage in `process_tbl`.

### Payload

```js
{
  processId?: string,             // optional; generated if missing
  fromMmaCode: 'ABS_RAW',
  toMmaCode:   'ABS_PROCESSED',
  supplierId: number,
  from: { shade, size?, qtyT, stationCode? },
  targets: [ { shade, size, qtyT, stationCode? }, ... ],
  toStationCode?: string,         // optional default for targets
  meta?: object                   // echoed in process_tbl, also passed to ledger entries
}
```

### Invariants

* `Σ(targets.qtyT) === from.qtyT` (exact to 1e-6).
* Source must be RAW, targets must be PROCESSED.
* Station checks live above this layer; we only pass `stationCode` through.

### Behavior

1. **Withdraw** `from.qtyT` tons from RAW.
2. **Deposit** each target into PROCESSED.
3. On success: insert one row in `process_tbl` with `status = "SUCCESS"`.
4. If a target deposit fails:

   * Roll back any successful PROCESSED deposits (withdraw them).
   * Re-credit RAW.
   * Insert row with `status = "ROLLED_BACK"`.
5. If rollback fails: insert row with `status = "FAILED"`.

### Log schema (`process_tbl`)

* `processId` (unique), `processType="PROCESSING"`, `supplierId`
* `fromMmaCode`, `toMmaCode`, `sourceShade`, `sourceSize`, `sourceQtyT`
* `targetsQtyT`, `targets` (JSON array of shade/size/qtyT)
* `status`, `error`, `meta`
* `fromStationCode`, `toStationCode`

### Tests

* `tests/processing.test.js`:

  * Seeds 30t RAW → splits 10+10+10 into PROCESSED.
  * Asserts RAW decreased, PROCESSED increased, `process_tbl` row inserted.

---

## 2. Sorting (PROCESSED → SORTED, one→one)

**File:** `src/lib/processes/sorting.js`

### Purpose

* Move one slot **PROCESSED → SORTED** with the same qty.
* Capture additional attributes: `ht` and `wastage`.
* Log full lineage in `sorting_tbl`.

### Payload

```js
{
  processId?: string,             // optional; generated if missing
  fromMmaCode: 'PSS_PROCESSED',
  toMmaCode:   'PSS_SORTED',
  supplierId: number,
  from: { shade, size, qtyT, stationCode? },
  to?:  { shade?, size?, qtyT?, stationCode? }, // defaults from `from`
  meta?: { ht?: number, wastage?: number, ... }
}
```

### Invariants

* `fromMmaCode.family = PROCESSED`
* `toMmaCode.family = SORTED`
* Station prefix must match (`PSS_* → PSS_*`).
* `from.qtyT === to.qtyT` (enforced to 1e-6).
* Supplier must match on both sides.

### Behavior

1. **Withdraw** `qtyT` tons from PROCESSED.
2. **Deposit** `qtyT` tons into SORTED.
3. On success: insert one row in `sorting_tbl` with `status="SUCCESS"`.
4. If deposit fails:

   * Compensate by re-crediting PROCESSED.
   * Insert row with `status="ROLLED_BACK"`.
5. If rollback fails: insert row with `status="FAILED"` and throw.

### Log schema (`sorting_tbl`)

* `processId` (unique), `processType="SORTING"`, `supplierId`
* `fromMmaCode`, `toMmaCode`, `fromShade`, `fromSize`, `toShade`, `toSize`, `qtyT`
* `ht` (int), `wastage` (decimal), `withdrawLedgerId`, `depositLedgerId`
* `status`, `error`, `meta`
* `fromStationCode`, `toStationCode`, `committedAt`

### Tests

* `tests/sorting.test.js`:

  * Seeds 30t PROCESSED → moves 12t into SORTED.
  * Asserts PROCESSED down, SORTED up, `sorting_tbl` row has `ht=55`, `wastage=1`.

---

## Shared Principles

* **Processes never calculate stock.** They only orchestrate Stock API calls.
* **Each process writes exactly one row** in its own table for lineage & idempotency.
* **Append-only, no updates.** Stock ledgers + process tables form the immutable audit trail.
* **Station routing lives above processes.** These files don’t decide station — they just enforce valid MMA family transitions.
* **Tests prove everything.** Both happy paths and rollbacks are covered.

---

👉 With `Stock.md` + `Processes.md`, your core is fully frozen. From here, all work moves to **routes, pages, and wiring**.

Do you also want a **diagram (flow\.md)** showing RAW → PROCESSED → SORTED with processes as bridges? That could be a nice visual anchor for new contributors.
