# MMA & Station — Core Spec (v0.3, no processes, single-ledger)
_Last updated: 2025-09-21_

## 1) Scope
Lock the **core storage & movement model** with **Material Management Areas (MMAs)** as logic-only wrappers over **one append-only ledger table** (call it `raw`). Stations are thin validators/routers. No screening/sorting/blending here — only **deposit**, **dispatch**, **receive**.

---

## 2) Key Ideas
- **MMA = logic, not a table.** MMAs are code objects (e.g., `ABS.SLOTS`, `PSS.DUMP`) validated against a registry. They **do not** require their own DB table.
- **One ledger table (`raw`).** Every change to stock is a **row**:
  - **Deposit row** (born here) — no transit lifecycle.
  - **Transfer row** (moves A→B) — has a transit lifecycle.
- **SSSS lineage (practical cut).** We track **Supplier · Shade · Size** (station is implied by the MMA code). For transfers, **shade can differ** between dispatch and receive; supplier stays the same.
- **On-hand is computed.** No authoritative “totals” table; stock is always derived from the ledger.

---

## 3) MMA — Minimal API (idempotent via `requestId`)
- **`deposit(mmaCode, { supplierId, shade, size, qty }, meta?, requestId)`**  
  Write a **Deposit** row: `bornAs=DEPOSIT`, `toMmaCode=mmaCode`, `status=RECEIVED`, `dispatchQty=qty`, `receiveQty=qty`, `dispatchShade=shade`, `receiveShade=shade`. Increases on-hand immediately.

- **`dispatch(fromMmaCode, toMmaCode, { supplierId, shade, size, qty }, meta?, requestId) -> edgeId`**  
  Write a **Transfer** row: `bornAs=TRANSFER`, `fromMmaCode`, `toMmaCode`, `status=IN_TRANSIT`, `dispatchQty=qty`, `dispatchShade=shade`. Decreases **from** on-hand immediately.

- **`receive(edgeId, { receiveQty?, receiveShade? }, meta?, requestId)`**  
  Update that **Transfer** row to `status=RECEIVED`, set `receiveQty = receiveQty ?? dispatchQty`, and `receiveShade = receiveShade ?? dispatchShade`, stamp `receivedAt`. Increases **to** on-hand when set to RECEIVED.

- **`cancel(edgeId, meta?, requestId)`**  
  Only for transfers with `status=IN_TRANSIT`. Set `status=CANCELED` (restores the planned outbound deduction in computed views).

**Invariants**
- Non-negative pre-dispatch check against computed on-hand.
- `fromMmaCode ≠ toMmaCode` on transfers.
- Supplier **must** match dispatch→receive; shade **may** differ (and is recorded).
- Idempotent writes (`requestId` unique) on all mutations.

---

## 4) Station — Thin Wrapper
- **`configure({ suppliersAllowed, shadesAllowed, policies })`** — validation lists & small policy knobs.
- **`acceptDeposit({ mmaCode, supplierId, shade, size, qty, meta, requestId })`** — validates then calls `MMA.deposit`.
- **`dispatch({ fromMmaCode, toMmaCode, supplierId, shade, size, qty, meta, requestId })`** — validates then calls `MMA.dispatch`.
- **`receive({ edgeId, receiveQty?, receiveShade?, meta, requestId })`** — validates then calls `MMA.receive`.
- **Derived views** — `stock(mmaCode, filters?)`, `incoming(mmaCode)`, `outgoing(mmaCode)`, `activeSlots(mmaCode)` — all computed from the ledger.

---

## 5) Single-Table Data Model (`raw`)
> You’ll still keep a tiny `Supplier` reference table; everything else lives in `raw`.

**`Supplier`**
- `id`, `name`, `code (unique)`

**`raw` (append-only ledger of deposits & transfers)**
- **Identity & lifecycle**
  - `id (pk)`
  - `bornAs ∈ { DEPOSIT, TRANSFER }`
  - `status ∈ { IN_TRANSIT, RECEIVED, CANCELED }`  
    • **DEPOSIT** rows are **inserted as RECEIVED**.  
    • **TRANSFER** starts **IN_TRANSIT**, becomes **RECEIVED** on `receive()`.
  - `requestId (unique)` — idempotency

- **Routing**
  - `fromMmaCode (nullable)` — **NULL for deposits**; set for transfers
  - `toMmaCode` — destination MMA code (always set)

- **Lineage**
  - `supplierId (FK -> Supplier.id)` — same at dispatch and receive
  - `dispatchShade` — shade at source (deposit/dispatch)
  - `receiveShade (nullable)` — shade at destination; set on receive (defaults to `dispatchShade` if omitted)
  - `size ∈ { LUMPS, CHIPS, FINE }`

- **Quantities**
  - `dispatchQty` — planned at dispatch (for deposits, equals receiveQty)
  - `receiveQty (nullable)` — actual received (set on receive; for deposits equals dispatchQty)

- **Audit**
  - `meta (json?)`
  - `createdAt (ts)`, `receivedAt (ts?)`

**Essential indexes**
- `(toMmaCode, status, createdAt)` — quick incoming
- `(fromMmaCode, status, createdAt)` — quick outgoing
- `(toMmaCode, supplierId, size, status)` / `(fromMmaCode, supplierId, size, status)` — filtered views
- Consider `(supplierId, createdAt)` for vendor reports

---

## 6) Computation Rules (no precomputed totals)
- **On-hand for MMA M, lineage (supplierId, shade, size)**  
