Perfect — let’s merge everything we’ve seen (ABS + PSS, including process pages) into **one clean flat list** of APIs the UI actually needs across *all stations*:

---

### Core DB helper

* `prisma.supplier.findMany()`

### Stock engine — movement & queries

* `stock.inbound({ mmaCode })`
* `stock.slots({ mmaCode, positiveOnly })`
* `stock.onHand({ mmaCode, supplierId, shade, size })`

### Stock engine — actions

* `stock.deposit({ toMmaCode, supplierId, shade, size, qty, … })`
* `stock.withdraw({ fromMmaCode, supplierId, shade, size, qty, processId })`
* `stock.dispatch({ fromMmaCode, toMmaCode, supplierId, shade, size, qty, … })`
* `stock.receive({ transportId, toMmaCode, supplierId, qty?, amount?, shade? })`

### Stock engine — audits (optional but useful)

* `stock.auditProcess({ processId, mmaCode? })`

---

👉 That’s the **complete minimal surface**: 1 Prisma call + 7 Stock verbs (+ 1 audit helper).
Every station page you’ve shown (ABS, PSS, purchase, dispatch, receive, sort) can be built using only this list.
