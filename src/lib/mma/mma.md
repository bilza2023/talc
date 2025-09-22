Perfect—let’s lock a **single, common API** that all MMA variants (2S / 3S / 4S) expose. Names stay identical; arguments differ only by whether `size` is used (4S requires it; 2S/3S omit it). No code—just the canonical surface.

# Common write API

* **deposit({ mmaCode, supplierId, shade, \[size], qty, amount?, meta? }) → row**
  Creates a **DEPOSIT** row that is immediately **RECEIVED**; raises on-hand at `mmaCode`. 4S requires `size`; 3S/2S forbid it. Lifecycle matches the spec (bornAs/status).
* **dispatch({ fromMmaCode, toMmaCode, supplierId, shade, \[size], qty, meta? }) → row**
  Creates a **TRANSFER** row in **IN\_TRANSIT**; immediately reduces on-hand at `fromMmaCode`. Validates registry codes, non-negative stock, and `from≠to`. (4S includes `size` in checks.)
* **receive({ id, toMmaCode, supplierId, receiveQty?, receiveShade?, meta? }) → row**
  Completes that **same transfer row**: sets **RECEIVED**, stamps `receivedAt`, increases on-hand at `toMmaCode`. Verifies supplier and destination MMA. (Shade may differ at receive.)
* **cancel({ id, meta? }) → row**
  Allowed only while **IN\_TRANSIT**; marks **CANCELED** (restores the outbound deduction in computed views).

# Common read API

* **onHand({ mmaCode, supplierId?, shade?, \[size?] }) → number**
  Computes stock from ledger (no precomputed totals). 4S path includes `size`; 3S path does not.
* **stock({ mmaCode, positiveOnly=true }) → Array\<slotLine>**
  Summarizes by slot keys:
  • 4S: `{ supplierId, shade, size, qty }`
  • 3S/2S: `{ supplierId, shade, qty }` (no size)
  Uses grouped aggregates aligned to each depth.
* **inbound({ mmaCode, status='IN\_TRANSIT' }) → rows\[]**
  Incoming transfers to `mmaCode`, newest first.
* **outbound({ mmaCode, status='IN\_TRANSIT' }) → rows\[]**
  Outgoing transfers from `mmaCode`, newest first.
* **activeSlots({ mmaCode }) → Array\<slotLine>**
  Convenience: `stock({ positiveOnly:true })`; shows only slots with qty > 0.
  (In 3S it’s currently named `activePiles`; standardize to `activeSlots` across all.)

# Shared invariants & rules (identical for all depths)

* **Registry-validated MMA codes**; station is implied by the code string.
* **Lifecycle & lineage**: one ledger, rows are DEPOSIT or TRANSFER; statuses IN\_TRANSIT / RECEIVED / CANCELED; Supplier fixed across dispatch→receive; Shade may change on receive; Size required only in 4S.
* **Pre-dispatch availability check** against computed on-hand (no negatives).

# Parameter notes (depth-aware, but one API)

* **Common required:** `mmaCode` (or `fromMmaCode`/`toMmaCode`), `supplierId`, `shade`, `qty`.
* **4S-only:** `size` (required on deposit/dispatch, part of filters/stock).
* **Optional everywhere:** `amount` (if commercial), `meta` (JSON), `receiveQty`, `receiveShade`.
* **Movement compatibility:** transfers must be between MMAs that share the same slot structure; 3S→4S requires screening (not a transfer).

If you want, we can add a tiny **factory** (unchanging API) that returns the correct depth engine (2S/3S/4S) based on `mmaCode` registry—your pages call the same methods regardless of depth, and each engine enforces its own validation/queries under the hood.
