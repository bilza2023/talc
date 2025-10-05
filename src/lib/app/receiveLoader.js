
// /src/lib/app/receiveLoader.js
/**
 * Standard loader for Receive pages.
 * - Pulls inbound transports for a given TO_MMA via /api/inbound
 * - Optionally filters by FROM_MMA (lane-only list)
 * - Shapes rows for <Receive/>
 *
 * @param {{ fetch: typeof fetch }} event
 * @param {{ toMmaCode: string, fromMmaCode?: string }} lane
 */
export async function loadReceive(event, lane) {
    const { fetch } = event;
    const { toMmaCode, fromMmaCode } = lane;
  
    // Ask API for all inbound headed to toMmaCode
    const res = await fetch(`/api/inbound?mmaCode=${encodeURIComponent(toMmaCode)}`);
    const j = await res.json().catch(() => ({ ok: false, data: [] }));
    const inboundAll = j.ok ? j.data : [];
  
    // Optional narrow to lane (fromMmaCode→toMmaCode)
    const filtered = fromMmaCode
      ? inboundAll.filter(t => t.fromMmaCode === fromMmaCode && t.toMmaCode === toMmaCode)
      : inboundAll.filter(t => t.toMmaCode === toMmaCode);
  
    // Shape for the component
    const rows = filtered.map(t => ({
      transportId: t.transportId,
      createdAt: t.createdAt,
      supplierId: t.supplierId,
      shade: t.shade,
      size: t.size,
      dispatchedQty: Number(t.qty)
    }));
  
    return {
      fromMmaCode: fromMmaCode || '(any)',
      toMmaCode,
      rows
    };
  }
  