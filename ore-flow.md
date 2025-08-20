Here’s the **short, stable table** for how we handle ore using only 2 tables:

| Action               | Table         | What happens                                                                                                                                                                   |
| -------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Deposit**          | `OreDeposit`  | Insert row with `stationCode, supplierId, weightTon, gradeCode, createdAt`.                                                                                                    |
| **Dispatch**         | `OreReceived` | Create row with `fromStation, toStation, weightTon, gradeCode, supplierId, departedAt`. Fields for `receivedAt, receivedWeight, receivedGrade` remain **empty** at this point. |
| **Receive (Unload)** | `OreReceived` | Update that same row: fill in `receivedAt`, `receivedWeight`, `receivedGrade`, and mark status as `received`.                                                                  |

👉 Stock = `sum(OreDeposit) + sum(OreReceived.received)` − `sum(OreReceived.dispatched but not received)`

Would you like me to also show this as a **flow diagram** (Deposit → Dispatch → Receive) so it’s even clearer?
