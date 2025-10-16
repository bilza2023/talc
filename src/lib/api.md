
# API Reference

All endpoints return JSON. Success payloads are `{ ok: true, ... }`; errors are `{ ok: false, error }`. Timestamps are ISO 8601 (UTC). Unless noted, ordering is deterministic by `createdAt desc, id desc`.

> Tip: For report-style endpoints, prefer the server-first pattern from `docs/reportEngine.md` to keep paging/sort consistent.

---

## Suppliers

### GET `/api/suppliers`

List suppliers, optionally filtered by a case-insensitive substring on `name` or `code`.

**Query**

* `q` *(optional)* – substring to match (`mode: 'insensitive'` when available; falls back to JS filter on SQLite)

**Response 200**

```json
{ "ok": true, "data": [ { "id": 1, "name": "Acme", "code": "ACME" } ] }
```

Source behavior: DB query with `orderBy: { name: 'asc' }`; SQLite fallback if case-insensitive mode isn’t supported. 

---

## Stock — deposit / onhand / slots

### POST `/api/deposit`

Create a deposit via `Stock.deposit(...)`.
Supports generic, process, and purchase paths (see `docs/stockApi.md` for field semantics).

**Body (JSON or querystring)**

* `toMmaCode` (string, required)
* `supplierId` (number, required)
* `shade` (string, required)
* `qty` (number, required unless provided in `purchase.quantity`)
* `size` (string, default `'ANY'`)
* `reason` (string, default `'ADJUST'`; `'PURCHASE'` triggers purchase path)
* `processId` (string, optional; when present → process path)
* `purchase` (object, optional) with keys like `docDate`, `quantity`, `paymentMode`, `ratePerMt`, `freightPerMt`, `supplierFreight`, `roadExp`, `cashPaid`, `remarks`, `meta`

**Response 200**

```json
{ "ok": true, "posting": { "id": 123, "qtyDelta": 10 } }
```

---

### GET `/api/onhand`

Numeric on-hand for optional filters.

**Query**

* `mmaCode` *(optional but typical)*
* `supplierId` *(optional)*
* `shade` *(optional)*
* `size` *(optional; normalized to `'ANY'` if omitted/falsy)*

**Response 200**

```json
{ "ok": true, "data": 42 }
```

---

### GET `/api/slots`

Per-slot balances (grouped by `supplierId, shade, size`) at a given `mmaCode`.

**Query**

* `mmaCode` (required)
* `positiveOnly` *(optional, default `true`)* — accepts `1|true|yes|on` (case-insensitive)

**Response 200**

```json
{
  "ok": true,
  "data": [
    { "mmaCode": "PSS_SCREENED", "supplierId": 1, "shade": "WHITE", "size": "CHIPS", "qty": 6 }
  ]
}
```

Source behavior: validates `mmaCode`, parses boolean flags from common truthy strings. 

---

## Transport — dispatch / receive / inbound

### POST `/api/dispatch`

Create a `DISPATCH` and an atomic negative ledger posting at the source (`Stock.dispatch(...)`).

**Body**

* `fromMmaCode`, `toMmaCode` (string, required)
* `supplierId` (number, required)
* `shade` (string, required)
* `qty` (number, required)
* `size` (string, default `'ANY'`)
* `amount` (number, optional)
* `transportId` (string, optional; auto-uuid if omitted)
* `meta` (object, optional)

**Response 200**

```json
{ "ok": true, "transportId": "uuid-or-string" }
```

---

### POST `/api/receive`

Receive an existing `transportId` (idempotent) and create a matching positive ledger posting at the destination (`Stock.receive(...)`).

**Query / Body**

* `transportId` (string, required)
* `toMmaCode` (string, required)
* `supplierId` (number, required)
* `qty` (number, optional; defaults to dispatched qty)
* `amount` (number, optional)
* `shade` (string, optional; defaults to dispatched shade)

**Response 200**

```json
{ "ok": true, "data": { "transportId": "uuid-or-string", "...": "..." } }
```

Source behavior: validates presence of `transportId`, `toMmaCode`, `supplierId`; coerces optional numeric fields only when present. 

---

### GET `/api/inbound`

Flat array of unsettled incoming dispatches (latest `DISPATCH` per `transportId` with **no** `RECEIVE`/**CANCEL**).
Each row: `{ date, transportId, lane, supplierId, shade, size, qty, amount }`.

**Query**

* `mmaCode` *(optional in tests; typical UIs filter by destination)*

**Response 200**

```json
{
  "ok": true,
  "data": [
    {
      "date": "2025-10-16T03:00:00.000Z",
      "transportId": "abc-123",
      "lane": "ABS_SCREENED→PSS_SCREENED",
      "supplierId": 1,
      "shade": "WHITE",
      "size": "ANY",
      "qty": 6,
      "amount": 0
    }
  ]
}
```

---

## Processes — withdraw / audit

### POST `/api/withdraw`

Consume stock for a process (negative ledger entry) via `Stock.withdraw(...)`.

**Query / Body**

* `fromMmaCode` (string, required)
* `supplierId` (number, required)
* `shade` (string, required)
* `size` (string, default `'ANY'`)
* `qty` (number, required)
* `processId` (string, required)

**Response 200**

```json
{ "ok": true, "data": { "id": 456, "qtyDelta": -3, "...": "..." } }
```

Source behavior: strict parameter validation; 400 on missing inputs. 

---

### GET `/api/audit-process`

Return all ledger rows linked to a `processId` (optionally scoped to an `mmaCode`), ordered by time, plus a `total` sum of `qtyDelta`.

**Query**

* `processId` (string, required)
* `mmaCode` (string, optional)

**Response 200**

```json
{ "ok": true, "data": { "rows": [ /* ledger rows */ ], "total": 123 } }
```

---

## Error semantics

* **400** — Missing or invalid required parameters (e.g., `/api/withdraw` will 400 if any required field is absent). 
* **500** — Unhandled server errors (`err.message` surfaced in `error`) are wrapped as `{ ok: false, error }` across handlers.

---

## Notes & Guarantees

* **Idempotency**: `/api/receive` is idempotent per `transportId` (no duplicate postings).
* **Size defaults**: Omitting size normalizes to `'ANY'` wherever applicable (RAW buckets).
* **Ordering**: Where lists are returned, handlers use deterministic ordering so pagination/sorting are stable.
* **Consistency**: For report-like endpoints, keep paging/sort in URL and use `reportEngine` helpers (`parsePagination`, `resolveOrderBy`, `paginateQuery`).
