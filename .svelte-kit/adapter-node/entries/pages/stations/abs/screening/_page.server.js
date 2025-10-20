import { redirect, fail } from "@sveltejs/kit";
import { s as stock$1, p as prisma, S as Stock } from "../../../../../chunks/stockEngine.js";
const FROM_MMA = "ABS_RAW";
const TO_MMA = "ABS_SCREENED";
const RAW_SIZE = "ANY";
async function screening(payload = {}) {
  const { supplierId, from, targets, meta = null } = payload;
  if (!supplierId) throw new Error("screening: supplierId is required");
  if (!from || !from.shade || from.qtyT == null) throw new Error("screening: from {shade, qtyT} is required");
  if (!Array.isArray(targets) || targets.length === 0) throw new Error("screening: targets[] is required");
  const srcQty = Number(from.qtyT);
  if (!(srcQty > 0)) throw new Error("screening: from.qtyT must be > 0");
  const fromShade = String(from.shade);
  const targetList = targets.map((t) => ({
    shade: String(t.shade),
    size: String(t.size ?? "ANY"),
    qtyT: Number(t.qtyT)
  }));
  const sumTargets = targetList.reduce((s, t) => s + (t.qtyT || 0), 0);
  if (Math.abs(sumTargets - srcQty) > 1e-6) {
    throw new Error(`screening: targets sum (${sumTargets}) must equal source qty (${srcQty})`);
  }
  const available = await stock$1.onHand({
    mmaCode: FROM_MMA,
    supplierId,
    shade: fromShade,
    size: RAW_SIZE
  });
  if (srcQty > Number(available)) {
    return {
      status: "FAILED",
      error: `Insufficient stock at ${FROM_MMA} (available=${available}, requested=${srcQty})`
    };
  }
  const header = await prisma.screening_tbl.create({
    data: {
      qtyT: srcQty,
      meta
    }
  });
  const linkId = String(header.id);
  let sourceWithdrawn = false;
  const postedTargets = [];
  try {
    await stock$1.withdraw({
      fromMmaCode: FROM_MMA,
      supplierId,
      shade: fromShade,
      size: RAW_SIZE,
      qty: srcQty,
      processId: linkId,
      meta: { ...meta, step: "screening.withdraw" }
    });
    sourceWithdrawn = true;
    for (const t of targetList) {
      const res = await stock$1.deposit({
        toMmaCode: TO_MMA,
        supplierId,
        shade: t.shade,
        size: t.size,
        qty: t.qtyT,
        processId: linkId,
        meta: { ...meta, step: "screening.deposit" }
      });
      postedTargets.push({ ...t, posting: res.posting });
    }
    await prisma.screening_tbl.update({
      where: { id: header.id },
      data: { committedAt: /* @__PURE__ */ new Date() }
    });
    return { id: header.id, status: "SUCCESS" };
  } catch (err) {
    try {
      for (const t of postedTargets.reverse()) {
        await stock$1.withdraw({
          fromMmaCode: TO_MMA,
          supplierId,
          shade: t.shade,
          size: t.size,
          qty: t.qtyT,
          processId: linkId,
          meta: { ...meta, step: "screening.rollback.target" }
        });
      }
      if (sourceWithdrawn) {
        await stock$1.deposit({
          toMmaCode: FROM_MMA,
          supplierId,
          shade: fromShade,
          size: RAW_SIZE,
          qty: srcQty,
          processId: linkId,
          meta: { ...meta, step: "screening.rollback.source" }
        });
      }
    } finally {
      await prisma.screening_tbl.delete({ where: { id: header.id } }).catch(() => null);
    }
    return { status: "ROLLED_BACK", error: String(err?.message ?? err) };
  }
}
const SIZES = ["LUMPS", "CHIPS", "FINE"];
const stock = new Stock();
async function fetchAvailableSlot({ supplierId, shade }) {
  if (!supplierId || !shade) return 0;
  const s = await stock.slot({
    mmaCode: "ABS_RAW",
    supplierId: Number(supplierId),
    shade: String(shade),
    size: "ANY"
  });
  return Number(s.qty || 0);
}
async function load({ url }) {
  const supplierId = Number(url.searchParams.get("supplierId") || 0);
  const fromShade = (url.searchParams.get("fromShade") || "").trim();
  const availableDb = await fetchAvailableSlot({ supplierId, shade: fromShade });
  return {
    stationCode: "ABS",
    lane: "ABS_RAW → ABS_SCREENED",
    sizes: SIZES,
    from: {
      supplierId: supplierId || "",
      shade: fromShade,
      availableDb
      // single source of truth for Available
    }
  };
}
async function handleScreen({ request }) {
  const fd = await request.formData();
  const supplierId = Number(fd.get("supplierId") || 0);
  const fromShade = String(fd.get("fromShade") || "").trim();
  if (!supplierId || !fromShade) {
    return fail(400, {
      error: "Supplier and shade are required.",
      detail: `supplierId=${supplierId}, fromShade='${fromShade}'`
    });
  }
  const targets = [];
  for (const size of SIZES) {
    const qty = Number(fd.get(`qty_${size}`) || 0);
    if (qty > 0) targets.push({ shade: fromShade, size, qtyT: qty });
  }
  if (targets.length === 0) {
    return fail(400, { error: "Enter at least one positive quantity into LUMPS/CHIPS/FINE." });
  }
  const allocated = targets.reduce((s, t) => s + Number(t.qtyT || 0), 0);
  if (!(allocated > 0)) {
    return fail(400, { error: "Allocated total must be > 0." });
  }
  const availableDb = await fetchAvailableSlot({ supplierId, shade: fromShade });
  if (allocated > availableDb) {
    return fail(400, {
      error: `Allocated (${allocated}) exceeds available (${availableDb}).`
    });
  }
  try {
    const res = await screening({
      supplierId,
      from: { shade: fromShade, qtyT: allocated },
      targets,
      meta: { ui: "abs/screening", fixedRows: true, allocated, availableDb }
    });
    if (res?.status === "SUCCESS") {
      return { success: true, screeningId: res.id, allocated, availableDb };
    }
    if (res?.status === "FAILED") {
      return fail(400, { error: res.error });
    }
    return fail(500, { error: "Unknown screening result." });
  } catch (err) {
    return fail(500, { error: "Screening failed", detail: String(err?.message ?? err) });
  }
}
const actions = {
  screen: handleScreen,
  async cancel() {
    throw redirect(303, "/stations/abs");
  }
};
export {
  actions,
  load
};
