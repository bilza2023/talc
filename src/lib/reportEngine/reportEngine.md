

## Overview

Server-first helpers that make every report consistent:

* **parsePagination(input, opts)** → `{ page, pageSize, sort, dir, idField }`
* **resolveOrderBy({ sort, dir, idField })** → Prisma `orderBy[]` with deterministic tiebreaker
* **paginateQuery(delegate, opts)** → `{ rows, paging }` (+1 look-ahead, optional count)
* **makeEnvelope({ meta, schema, rows, paging, kpis?, facets? })** → stable payload for ListTable

### Philosophy

* URL is the single source of truth for paging/sort.
* Deterministic sort (tie-break on `id`) to avoid jitter.
* Paging is offset-based with +1 row look-ahead for `hasNext`.
* Counting total rows is opt-in (`totalMode: 'count'`).

---

## API Reference

### parsePagination(input, opts?)

```ts
parsePagination(
  input: URL | string | URLSearchParams | Record<string,any>,
  opts?: {
    defaultPage?: number;          // 1
    defaultPageSize?: number;      // 25
    maxPageSize?: number;          // 200
    defaultSort?: string;          // 'createdAt'
    defaultDir?: 'asc'|'desc';     // 'desc'
    allowedSorts?: string[]|null;  // e.g. ['createdAt','qty']
    idField?: string;              // 'id'
  }
) => { page, pageSize, sort, dir, idField }
```

Notes:

* Non-numeric inputs fall back to defaults and are clamped to valid ranges.
* If `allowedSorts` is provided and `sort` is not allowed, it falls back to `defaultSort`.

---

### resolveOrderBy({ sort, dir, idField })

Returns a deterministic Prisma `orderBy`:

```ts
resolveOrderBy({ sort, dir, idField: 'id' })
// => [{ [sort]: dir }, { id: 'desc' }]
```

* Always appends the `id` tiebreaker if not already present.
* Use this result directly in Prisma `.findMany()`.

---

### paginateQuery(delegate, opts?)

```ts
await paginateQuery(prisma.someModel, {
  where?: object,                         // default {}
  orderBy?: Array<object>,                // default [{createdAt:'desc'},{id:'desc'}]
  page?: number,                          // default 1
  pageSize?: number,                      // default 25
  select?: object,
  include?: object,
  totalMode?: 'none' | 'count'            // default 'none'
})
// => { rows, paging: { page, pageSize, total?, totalPages?, hasPrev, hasNext } }
```

Details:

* **+1 look-ahead**: fetches `pageSize + 1` rows; if > `pageSize`, `hasNext = true`.
* **total/count**: if `totalMode: 'count'`, `total` and `totalPages` are set; otherwise omitted.

---

### makeEnvelope(...)

Shape the standard payload for the UI (ListTable):

```ts
makeEnvelope({
  meta: { reportId, title, defaultSort?: { key, dir } },
  kpis?: object,
  facets?: object,
  schema: { columns: Array<{ key, label, type? }> },
  rows: any[],
  paging: { page, pageSize, total?, totalPages?, hasPrev, hasNext }
})
```

---

## Example (end-to-end)

```ts
import { parsePagination, resolveOrderBy, paginateQuery, makeEnvelope } from '$lib/reportEngine';

export async function GET({ url, locals: { prisma } }) {
  const { page, pageSize, sort, dir } = parsePagination(url, {
    allowedSorts: ['createdAt', 'qty', 'id']
  });
  const orderBy = resolveOrderBy({ sort, dir, idField: 'id' });

  const { rows, paging } = await paginateQuery(prisma.ledger, {
    where: {},
    orderBy,
    page,
    pageSize,
    select: { id: true, qty: true, createdAt: true },
    totalMode: 'count'
  });

  const envelope = makeEnvelope({
    meta: { reportId: 'ledger', title: 'Ledger', defaultSort: { key: 'createdAt', dir: 'desc' } },
    schema: {
      columns: [
        { key: 'createdAt', label: 'Date', type: 'datetime' },
        { key: 'id',        label: 'ID' },
        { key: 'qty',       label: 'Qty' }
      ]
    },
    rows,
    paging
  });

  return new Response(JSON.stringify({ ok: true, envelope }), { headers: { 'content-type': 'application/json' } });
}
```

---

## Testing pattern

* Unit: see `tests/reports/01.pagination.spec.js`, `02.prismaPage.spec.js`, `03.envelope.spec.js`, `04.contract.smoke.spec.js`.
* Contract: Given a URL `?sort=createdAt&dir=desc&page=1&pageSize=25`, the same envelope should be produced regardless of transport (API/UI).

---

# docs/apis.md

## Conventions

* All responses are JSON.
* Success base: `{ ok: true, ... }`
* Errors: `{ ok: false, error: { code, message } }`
* Pagination (when applicable) follows `reportEngine` envelope or exposes direct arrays depending on endpoint.
* Deterministic ordering: `createdAt desc, id desc`.

---

## Suppliers

### GET `/api/suppliers`

List suppliers, optionally filtered by substring.

**Query:**

* `q` *(optional)* — case-insensitive substring of `name` or `code`.

**Response (200):**

```json
{ "ok": true, "data": [ { "id": 1, "name": "Acme", "code": "ACME" }, ... ] }
```

**Notes:**

* Sorted by `name` ascending (per test).

---

## Stock — Deposit / On-hand / Slots

### POST `/api/deposit`

Create a deposit (goes through `Stock.deposit`).

* Body should contain: `toMmaCode`, `supplierId`, `shade`, `qty` (or `purchase.quantity`), optional `size`, `reason`, `processId`, `purchase`, `meta`.

**Response (200):**

```json
{ "ok": true, "posting": { "id": 123, "qtyDelta": 10, "...": "..." } }
```

### GET `/api/onhand`

Return a numeric on-hand.

**Query:**

* `mmaCode` *(optional but typical)*
* `supplierId` *(optional)*
* `shade` *(optional)*
* `size` *(optional; defaults to `'ANY'` if omitted/falsy)*

**Response (200):**

```json
{ "ok": true, "data": 42 }
```

### GET `/api/slots`

Return per-slot balances at an `mmaCode`.

**Query:**

* `mmaCode` *(required)*
* `positiveOnly` *(optional, default `true`)*

**Response (200):**

```json
{
  "ok": true,
  "data": [
    { "mmaCode": "PSS_SCREENED", "supplierId": 1, "shade": "WHITE", "size": "CHIPS", "qty": 6 },
    ...
  ]
}
```

---

## Transport — Dispatch / Receive / Inbound (Unsettled)

### POST `/api/dispatch`

Create a dispatch and matching negative ledger entry (atomic).
**Body:**

* `fromMmaCode`, `toMmaCode`, `supplierId`, `shade`, `qty`, optional `size`, `amount`, `meta`, `transportId`.

**Response (200):**

```json
{ "ok": true, "transportId": "..." }
```

### POST `/api/receive`

Receive a dispatch (idempotent) and create matching positive ledger entry.
**Body:**

* `transportId`, `toMmaCode`, `supplierId`, optional `qty`, `shade`, `amount`, `meta`.

**Response (200):**

```json
{ "ok": true, "transportId": "..." }
```

### GET `/api/inbound`

List unsettled incoming dispatches (in transit) for a given `mmaCode`.
This endpoint intentionally returns a **flat array** for convenience in the UI/test.

**Query:**

* `mmaCode` *(required for filtering in real UIs; tests may pass specific codes)*

**Response (200):**

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

**Notes:**

* Unsettled = the **latest** `DISPATCH` for each `transportId` that has **no** `RECEIVE` or `CANCEL`.
* Deterministic sort: newest first by `createdAt desc, id desc`.

---

## Audit

### POST `/api/withdraw`

Consumes stock for a process (requires `processId`), then…

### GET `/api/audit-process`

Query rows linked to a `processId`.
*(Exact body/params are per your current handlers; contract in tests: withdraw requires `processId` and the row appears in audit.)*

**Response (200):**

```json
{ "ok": true, "data": { "rows": [...], "total": 123 } }
```

---

## Stability & Testing

* Every API should have a matching **vitest** file that asserts the contract (shape, ordering, pagination flags).
* For report endpoints that serve ListTable, prefer returning `{ ok, envelope }` (see `reportEngine`) unless a flat array simplifies the UI (as in `/api/inbound` test).


