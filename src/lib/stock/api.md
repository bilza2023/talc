

# Lookups (reads)

* `onHand({ mmaCode, supplierId?, shade?, size='ANY' }) → number`
* `slots({ mmaCode, positiveOnly=true }) → [{ mmaCode, supplierId, shade, size, qty }]`
* `inbound({ mmaCode, status='IN_TRANSIT' }) → transport[]`
* `outbound({ mmaCode, status='IN_TRANSIT' }) → transport[]`
* `transportById({ transportId }) → transport`
* `transports({ fromMmaCode?, toMmaCode?, status?, since?, limit? }) → transport[]`
* `ledger({ mmaCode?, supplierId?, shade?, size?, reason?, linkId?, since?, limit? }) → postings[]`
* `transportAmounts({ mmaCode }) → { outboundDispatched, inboundInTransit, inboundReceived }`
* `auditTransport({ transportId }) → { dispatch, receive, deltas }`
* `auditProcess({ processId }) → { withdrawals[], deposits[], totals }`

Notes:

* **Stock is stage-wide**; pass `size='ANY'` to unify 3s vs 4s.
* `reason` and `linkId` (e.g., `processId`, `transportId`) keep lineage without Stock doing business-rule checks.
