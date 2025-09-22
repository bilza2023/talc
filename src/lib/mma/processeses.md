
# Processes — Cross-Stage Material Transformations

## What is a Process?

A **Process** is any operation that **moves material from one stage table to another**.
Unlike transport (which keeps material within the same table), a process always changes the stage:

* **Screening** → raw → processed
* **Sorting** → processed → sorted
* **Blending** → sorted → sorted (with different shades) or processed → processed (by rule)
* **Other** → any other cross-stage transformation you define

Processes are tracked in the global `Process` table and linked to the affected rows in the stage tables.

---

## Process Table Schema

| Field         | Type               | Notes                                           |
| ------------- | ------------------ | ----------------------------------------------- |
| `id`          | Int                | Auto-increment primary key                      |
| `type`        | `ProcessType` enum | `SCREENING`, `SORTING`, `BLENDING`, `OTHER`     |
| `fromTable`   | `StageTable` enum  | Must differ from `toTable`                      |
| `toTable`     | `StageTable` enum  | Must differ from `fromTable`                    |
| `fromMmaCode` | `MmaCode?`         | Optional station code where material originated |
| `toMmaCode`   | `MmaCode?`         | Optional station code where material ends up    |
| `meta`        | Json?              | Free-form process metadata                      |
| `createdAt`   | DateTime           | Timestamp of process start                      |

**Back-relations:** each stage table (`rawMaterial3s`, `processed4s`, `sorted4s`) has a `processId` foreign key that links a row back to the process that created it.

---

## How Processes Work in Practice

I. **Start** — material is withdrawn from one stage table (rows created with `bornAs: PROCESS`, `status: RECEIVED`, `fromMmaCode` set).
II. **Transform** — app logic determines output shade/size and inserts corresponding rows in the target table (`toTable`).
III. **Link** — each output row references the `processId` so the lineage is preserved.
IV. **Stock math** — on-hand calculations already count:

* Inbound: any rows `bornAs: PROCESS`, `status: RECEIVED`, into a table
* Outbound: any rows `bornAs: PROCESS`, `status: RECEIVED`, out of a table

This ensures processes behave like “consuming” from one table and “depositing” into another.

---

## API Concept (future)

We don’t yet expose a full `ProcessEngine` class, but the intended verbs are:

* `startProcess({ type, fromTable, toTable, fromMmaCode, toMmaCode, supplierId, shade, size, qty, meta })`
  Creates a `Process` header and corresponding outbound rows from the source stage.

* `completeProcess({ processId, outputs })`
  Inserts new inbound rows in the target stage (linked to the same process).

---

## Notes & Invariants

* A process **must** cross tables (`fromTable != toTable`), unlike transport.
* A process row uses the same structure as deposits/transfers in stage tables, but with `bornAs: PROCESS`.
* Processes are **already included** in on-hand and stock math; no special code is needed to “count” them.
* The `ProcessType` enum lets you classify transformations without affecting math.
* All lineage is preserved: you can always trace an inbound row in one stage back to the outbound rows and the process header that created it.

---

Do you want me to also scaffold a **`ProcessEngine.js`** (parallel to `mma4s.js`) that implements these `startProcess` / `completeProcess` methods against your schema?
