# AB Project – Stage 1 Spec (Draft v0.1)

## 1 Scope

Afghanistan segment: 3 Base Stations (**BS1, BS2, BS3**) → **JSS** → **PSS**. Focus on *ore* flow only.

## 2 Stations

I. **BS1** (Base Camp 1)
II. **BS2**
III. **BS3**
IV. **JSS** (Jalalabad Support Station)
V. **PSS** (Processing and Sorting Station)
VI. **KEF** (Karachi Export Facility) – declared for completeness; out‑of‑scope for Stage 1 stock.

## 3 Data Model

### 3.1 `ore`

| column       | type                                    | notes                        |
| ------------ | --------------------------------------- | ---------------------------- |
| id           | integer PK                              |                              |
| station\_id  | FK → stations                           |                              |
| supplier\_id | FK → suppliers                          |                              |
| batch\_ref   | string                                  | optional label from supplier |
| weight\_ton  | real                                    |                              |
| status       | enum(`on_hand`,`reserved`,`in_transit`) |                              |
| created\_at  | timestamp                               |                              |

### 3.2 `ore_transport`

| column            | type                                      | notes |
| ----------------- | ----------------------------------------- | ----- |
| id                | integer PK                                |       |
| from\_station\_id | FK → stations                             |       |
| to\_station\_id   | FK → stations                             |       |
| ore\_id           | FK → ore                                  |       |
| weight\_ton       | real                                      |       |
| truck\_no         | string                                    |       |
| status            | enum(`in_transit`,`received`,`cancelled`) |       |
| departed\_at      | timestamp                                 |       |
| received\_at      | timestamp                                 |       |

## 4 Service: `oreService.js`

```ts
// Create new ore batch at a base station
deposit({ stationId, supplierId, weightTon, batchRef?, userId }): Promise<OreId>

// Move ore in a truck between stations
despatch({ fromStationId, toStationId, oreId, weightTon, truckNo, userId }): Promise<TransportId>

// Confirm truck arrival and transfer stock
receive({ transportId, userId }): Promise<OreId>

// Stock snapshot for dashboards
getStock(stationId): Promise<{ onHand: number; inboundTransit: number; outboundTransit: number }>
```

All methods:

* Validate station pair (allowed routes: **BS* → JSS*\*, **JSS → PSS** in Stage 1).
* Execute DB changes inside a single transaction.
* Emit `logService.log(eventType, data)` after commit.

## 5 Business Rules

I. `deposit` allowed only at **Base Stations** (BS1‑3) for now.
II. Ore weight is immutable after deposit; splitting is deferred.
III. `despatch` sets `ore.status = 'in_transit'` and writes `ore_transport` row.
IV. `receive` sets `ore_transport.status = 'received'`, updates `ore.station_id` to destination, `ore.status = 'on_hand'`.
V. Stock formula: `onHand + inboundTransit − outboundTransit` (per station).

## 6 Testing

I. Use in‑memory SQLite for isolated Jest runs.
II. Unit tests for each service function.
III. Integration chain: deposit → despatch → receive → stock calc.
IV. Edge cases: duplicate receive, invalid route, overweight truck.

## 7 Logging

```js
logService.log("ORE_DEPOSIT",   { oreId, stationId, supplierId, weightTon });
logService.log("ORE_DESPATCH",  { transportId, fromStationId, toStationId, weightTon });
logService.log("ORE_RECEIVE",   { transportId });
```

Logs are queryable by station, supplier, and time range.

## 8 Out of Scope

I. Talc stock & KEF routes (Stage 2).
II. UI/dashboard composition (separate spec).
III. Ore batch splitting/merging.

---

*Draft saved — ready for review and iteration.*
