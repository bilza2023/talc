
# Stock API (station-free)

Small inventory helper that records stock movements in an **append-only ledger** plus **transport events**. No concept of station; everything is keyed by `mmaCode + supplierId + shade + size`.

## Construction

```js
import Stock from './Stock';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const stock = new Stock({
  // pick the stage you’re testing/using:
  ledgerModel: 'processedLedger',      // Prisma delegate name
  transportModel: 'processedTransport',// Prisma delegate name
  prisma,                              // optional, defaults to new PrismaClient()
  sizeDefault: 'ANY',                  // optional fallback when size is omitted
});
```

### Expected Prisma models

For the chosen stage, you must have two tables exposed as Prisma delegates:

* **`<stage>Ledger`** (e.g. `ProcessedLedger`) with fields:
  `id, createdAt, mmaCode, supplierId, shade, size, qtyDelta, reason, linkId, meta`

* **`<stage>Transport`** (e.g. `ProcessedTransport`) with fields:
  `id, createdAt, transportId, type('DISPATCH'|'RECEIVE'|'CANCEL'), fromMmaCode?, toMmaCode?, supplierId, shade, size, qty, amount?, meta`

> Note: this class uses the **delegate names** (camelCase) you pass in (`processedLedger`, `processedTransport`). Make sure they match your Prisma client.

---

## Commands (mutations)

### `deposit(opts) -> { posting }`

Append a positive quantity to the ledger.

```ts
await stock.deposit({
  toMmaCode: string,       // required
  supplierId: number,      // required (must exist if you enforce FK)
  shade: string,           // required
  qty: number,             // required > 0
  size?: string,           // defaults to sizeDefault ('ANY')
  processId?: string,      // if present, reason becomes 'PROCESS'
  reason?: string,         // default 'DIRECT'
  meta?: Record<string, any>
});
```

**Errors:** throws if required fields missing or `qty <= 0`.

---

### `withdraw(opts) -> { posting }`

Append a negative quantity to the ledger (consumption). Requires a `processId`. Guards for availability first.

```ts
await stock.withdraw({
  fromMmaCode: string,     // required
  supplierId: number,      // required
  shade: string,           // required
  qty: number,             // required > 0
  size?: string,           // defaults to sizeDefault
  processId: string,       // required
  reason?: string,         // default 'PROCESS'
  meta?: Record<string, any>
});
```

**Errors:** throws if missing fields, `qty <= 0`, or insufficient on-hand.

---

### `dispatch(opts) -> { transportId, dispatch, posting }`

Create a `DISPATCH` transport and record a matching **negative** ledger entry at the source.

```ts
const { transportId } = await stock.dispatch({
  fromMmaCode: string,     // required
  toMmaCode: string,       // required
  supplierId: number,      // required
  shade: string,           // required
  qty: number,             // required > 0
  size?: string,           // defaults to sizeDefault
  amount?: number|null,    // optional money at dispatch
  meta?: any,
  transportId?: string     // optional; auto-uuid if omitted
});
```

Runs in a single DB transaction.

---

### `receive(opts) -> { transportId, receive, posting }`

Create a `RECEIVE` for an existing `transportId` and record a **positive** ledger entry at the destination. Idempotent.

```ts
await stock.receive({
  transportId: string,     // required (must match an existing DISPATCH)
  toMmaCode: string,       // required
  supplierId: number,      // required
  qty?: number,            // default = dispatched qty
  shade?: string,          // default = dispatched shade
  amount?: number|null,    // optional money at receive
  meta?: any
});
```

**Errors:** throws if dispatch missing or canceled. If already received, returns the existing receive and no new posting.

---

### `cancel({ transportId, meta }) -> { transportId, cancel, posting }`

Cancel a dispatch that hasn’t been received yet, and create a **reversal** (+qty back) at the source in the ledger. Idempotent.

---

## Reads

### `onHand({ mmaCode?, supplierId?, shade?, size? }) -> number`

Sum of `qtyDelta` from the ledger with optional filters. `size` defaults to `sizeDefault` if provided as null/undefined.

### `slots({ mmaCode, positiveOnly = true }) -> Array<{ mmaCode, supplierId, shade, size, qty }>`

Grouped balances per `(supplierId, shade, size)` at a given `mmaCode`, sorted by `qty` desc. If `positiveOnly`, filters out zero/negative.

### `inbound({ mmaCode }) -> Transport[]`

List unsettled **DISPATCH** events **to** `mmaCode` (i.e., not yet received or canceled).

### `outbound({ mmaCode }) -> Transport[]`

List unsettled **DISPATCH** events **from** `mmaCode`.

### `transportAmounts({ mmaCode }) -> { outboundDispatched, inboundInTransit, inboundReceived }`

Simple amount rollup buckets for money view.

### `auditTransport({ transportId }) -> { status, dispatch, receive, cancel, deltas? }`

Returns transport events & status (`IN_TRANSIT | RECEIVED | CANCELED`) and deltas (`qtyDelta`, `amountDelta`, changed `shade` if any).

### `auditProcess({ processId, mmaCode? }) -> { rows, total }`

All ledger rows linked to a `processId` (optionally scoped to an `mmaCode`), ordered by time with total sum.

---

## Minimal testing pattern

* **Create the `Stock` instance directly** in each test (don’t go through your app).
* **Reset tables** for the chosen stage before each test:

```js
beforeEach(async () => {
  await prisma.$transaction([
    prisma.processedTransport.deleteMany(),
    prisma.processedLedger.deleteMany(),
  ]);
});
```

* **Seed suppliers** with both `name` and `code` if you have FKs:

```js
const sup = await prisma.supplier.create({ data: { name: 'Test', code: 'SUP-T1' } });
```

---

## Example flow

```js
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

---

## Notes & guarantees

* **Append-only**: no updates/deletes; all corrections are new rows (e.g., `REVERSAL`).
* **Idempotency**: `receive` and `cancel` are idempotent per `transportId`.
* **No station**: API intentionally excludes station concepts; if you need station-level queries, build them as read-only projections elsewhere.
