Here’s the top-level “satellite view”:

1. We have **MMA objects** (Material Movement Accounts), some 3-slot, some 4-slot. Each station holds one or more MMA instances.
2. Both 3s and 4s expose a **common API** (deposit, dispatch, receive, cancel, stock, etc.) so usage is nearly uniform.
3. The **database tables** are stage-based (rawMaterial3s, processed4s, sorted4s), not tied to MMA type.
4. **Transports** stay within a stage table, while **Processes** cross tables (e.g. sorting, screening, blending).
5. Business rules decide which stage is used: e.g. both ABS and PSS have a processed4s MMA, so they share the `processed4s` table; but PSS also has a sorted4s MMA, which requires the “sorting” process and writes to the `sorted4s` table.
6. Every MMA supports **direct deposit** into its stage, regardless of station.

That’s the absolute top layer: **MMA = uniform API object, bound to a stage table; tables are stage-based; processes move across stages; business rules decide which MMA writes where.**
