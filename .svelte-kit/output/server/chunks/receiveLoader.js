async function loadReceive(event, lane) {
  const { fetch } = event;
  const { toMmaCode, fromMmaCode } = lane;
  const res = await fetch(`/api/inbound?mmaCode=${encodeURIComponent(toMmaCode)}`);
  const j = await res.json().catch(() => ({ ok: false, data: [] }));
  const inboundAll = j.ok ? j.data : [];
  const filtered = fromMmaCode ? inboundAll.filter((t) => t.fromMmaCode === fromMmaCode && t.toMmaCode === toMmaCode) : inboundAll.filter((t) => t.toMmaCode === toMmaCode);
  const rows = filtered.map((t) => ({
    transportId: t.transportId,
    createdAt: t.createdAt,
    supplierId: t.supplierId,
    shade: t.shade,
    size: t.size,
    dispatchedQty: Number(t.qty)
  }));
  return {
    fromMmaCode: fromMmaCode || "(any)",
    toMmaCode,
    rows
  };
}
export {
  loadReceive as l
};
