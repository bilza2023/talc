
# Stock API (station-free, mmaCode-driven)

Small inventory helper that records stock movements in an **append-only ledger** plus **transport events**. There is **no station concept**; everything keys off `mmaCode + supplierId + shade + size`.

* Ledger rows live in a unified table (delegate default: `stockLedger`)
* Transport events live in a unified table (delegate default: `stockTransport`)
* `sizeDefault` is `ANY` (RAW buckets should pass `size: 'ANY'` explicitly)

## Construction

```js
import Stock from './Stock';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const stock = new Stock({
  prisma,                     // optional; defaults to new PrismaClient()
  ledgerDelegate: 'stockLedger',        // Prisma delegate name for the ledger table
  transportDelegate: 'stockTransport',  // Prisma delegate name for the transport table
  sizeDefault: 'ANY',                   // fallback when size is omitted
});
```

### Expected Prisma models (unified tables)

* **Ledger** (`stockLedger` by default):

  ```
  id, createdAt, mmaCode, supplierId, shade, size, qtyDelta, reason, linkId?, meta?
  ```
* **Transport** (`stockTransport` by default):

  ```
  id, createdAt, transportId, type('DISPATCH'|'RECEIVE'|'CANCEL'),
  fromMmaCode, toMmaCode, supplierId, shade, size, qty, amount?, meta?
  ```

> If you use different names (e.g. `processedLedger`), pass them via `ledgerDelegate` / `transportDelegate`.

---

## Commands (mutations)

### `deposit(opts) → { posting }`  *(and optional `purchase` integration)*

Append a positive quantity to the ledger. Three paths are supported:

1. **PROCESS path** (when `processId` is provided)

   * Forces `reason = 'PROCESS'` and requires `qty > 0`.

2. **PURCHASE path** (when `reason === 'PURCHASE'` or `purchase` object provided)

   * Requires `qty` OR `purchase.quantity`.
   * Creates a ledger row with `reason = 'PURCHASE'`.
   * Also inserts into `purchase_tbl` and links it back to the ledger row.

3. **GENERIC path** (otherwise)

   * Requires `qty > 0`.
   * Uses `reason` (default `'ADJUST'`).

```ts
await stock.deposit({
  toMmaCode: string,            // required
  supplierId: number,           // required
  shade: string,                // required
  qty?: number,                 // required in PROCESS/GENERIC; optional if purchase.quantity given
  size?: string,                // defaults to sizeDefault ('ANY')
  processId?: string,           // PROCESS path when present
  reason?: 'ADJUST'|'PURCHASE'|string, // 'PURCHASE' triggers purchase path; default 'ADJUST'
  meta?: Record<string, any>,

  // Optional purchase path (if provided, reason becomes 'PURCHASE')
  purchase?: {
    docDate?: string|Date,
    quantity?: number,          // used if qty is not provided
    paymentMode?: string|null,
    ratePerMt?: number|null,
    freightPerMt?: number|null,
    supplierFreight?: number|null,
    roadExp?: number|null,
    cashPaid?: number|null,
    remarks?: string|null,
    meta?: Record<string, any>  // stored on purchase row
  }
});
```

Errors: throws on missing required fields or `qty <= 0` for paths that require quantity.

---

### `withdraw(opts) → { posting }`

Append a negative quantity to the ledger (consumption). **Requires `processId`.** Guards for availability first.

```ts
await stock.withdraw({
  fromMmaCode: string,    // required
  supplierId: number,     // required
  shade: string,          // required
  qty: number,            // required > 0
  size?: string,          // defaults to sizeDefault
  processId: string,      // required
  reason?: string,        // default 'PROCESS'
  meta?: Record<string, any>
});
```

Errors: throws if missing fields, `qty <= 0`, or insufficient on-hand.

---

### `dispatch(opts) → { transportId, dispatch, posting }`

Create a `DISPATCH` transport and record a matching **negative** ledger entry at the source—**atomically**.

```ts
const { transportId } = await stock.dispatch({
  fromMmaCode: string,    // required
  toMmaCode: string,      // required
  supplierId: number,     // required
  shade: string,          // required
  qty: number,            // required > 0
  size?: string,          // defaults to sizeDefault
  amount?: number|null,   // optional monetary amount
  meta?: any,
  transportId?: string    // optional; auto-uuid if omitted
});
```

---

### `receive(opts) → { transportId, receive, posting }`

Create a `RECEIVE` for an existing `transportId` and record a **positive** ledger entry at the destination. **Idempotent** (a second call returns the existing receive and no new posting).

```ts
await stock.receive({
  transportId: string,    // required (must match an existing DISPATCH)
  toMmaCode: string,      // required
  supplierId: number,     // required
  qty?: number,           // default = dispatched qty
  shade?: string,         // default = dispatched shade
  amount?: number|null,   // optional money at receive
  meta?: any
});
```

Errors: throws if dispatch missing or canceled.

---

### `cancel({ transportId, meta }) → { transportId, cancel, posting }`

Cancel a dispatch that hasn’t been received yet, and insert a **reversal** (+qty back) at the source in the ledger. **Idempotent** (repeated cancels return the existing cancel).

---

## Reads

### `onHand({ mmaCode?, supplierId?, shade?, size? }) → number`

Sum of `qtyDelta` from the ledger with optional filters. If `size` is provided but falsy, it is normalized to `sizeDefault` (e.g., `'ANY'`).

---

### `slots({ mmaCode, positiveOnly = true }) → Array<{ mmaCode, supplierId, shade, size, qty }>`

Per-slot balances at a given `mmaCode`, grouped by `(supplierId, shade, size)`, sorted by `qty desc`.
If `positiveOnly` is true, zero/negative groups are filtered out.

---

### `slot({ mmaCode, supplierId, shade, size }) → { mmaCode, supplierId, shade, size, qty }`

**Exact-bucket** balance for a single tuple.
Note: For RAW buckets, callers must pass `size: 'ANY'` explicitly.

---

### `inbound({ mmaCode }) → Transport[]`

Unsettled **DISPATCH** events **to** `mmaCode` (i.e. where there’s no `RECEIVE`/`CANCEL` for the same `transportId`).

---

### `outbound({ mmaCode }) → Transport[]`

Unsettled **DISPATCH** events **from** `mmaCode`.

---

### `transportAmounts({ mmaCode }) → { outboundDispatched, inboundInTransit, inboundReceived }`

Simple money rollups:

* `outboundDispatched`: sum of `amount` for `DISPATCH` **from** `mmaCode`
* `inboundInTransit`: sum of `amount` for `DISPATCH` **to** `mmaCode` that are **not** settled
* `inboundReceived`: sum of `amount` for `RECEIVE` **to** `mmaCode`

---

### `auditTransport({ transportId }) → { status, dispatch, receive, cancel, deltas? }`

Returns all three potential events and a status:

* `status`: `IN_TRANSIT` | `RECEIVED` | `CANCELED`
* `deltas` (when received): `{ qtyDelta, amountDelta, shadeDelta?, size }`

---

### `auditProcess({ processId, mmaCode? }) → { rows, total }`

All ledger rows linked to `processId` (optionally scoped to an `mmaCode`), ordered by time, plus sum of `qtyDelta`.

---

## Guarantees & Notes

* **Append-only**: no updates/deletes; corrections are recorded as new rows (e.g., `REVERSAL`).
* **Idempotency**: `receive` and `cancel` are idempotent per `transportId`.
* **Deterministic ordering**: reads use `createdAt desc, id desc` to break ties.
* **Availability guard**: `withdraw` and `dispatch` check `onHand` at the exact bucket.

---

## Minimal testing pattern

```js
import { PrismaClient } from '@prisma/client';
import Stock from './Stock';

const prisma = new PrismaClient();
const stock = new Stock({ prisma });

beforeEach(async () => {
  await prisma.$transaction([
    prisma.stockTransport.deleteMany(),
    prisma.stockLedger.deleteMany(),
  ]);
});

const sup = await prisma.supplier.create({ data: { name: 'Acme', code: 'ACME' } });

await stock.deposit({ toMmaCode: 'ABS_SCREENED', supplierId: sup.id, shade: 'WHITE', qty: 10 });

const { transportId } = await stock.dispatch({
  fromMmaCode: 'ABS_SCREENED',
  toMmaCode: 'PSS_SCREENED',
  supplierId: sup.id,
  shade: 'WHITE',
  qty: 6
});

await stock.receive({ transportId, toMmaCode: 'PSS_SCREENED', supplierId: sup.id });

const src = await stock.onHand({ mmaCode: 'ABS_SCREENED', supplierId: sup.id, shade: 'WHITE' }); // 4
const dst = await stock.onHand({ mmaCode: 'PSS_SCREENED', supplierId: sup.id, shade: 'WHITE' }); // 6
```

