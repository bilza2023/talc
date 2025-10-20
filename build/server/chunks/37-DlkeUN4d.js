import { f as fail, r as redirect } from './index-BL3bFNcc.js';
import { s as stock, p as prisma } from './stockEngine-jmqVw6zN.js';
import '@prisma/client';
import 'crypto';

const FROM_MMA = "PSS_SCREENED";
const TO_MMA = "PSS_SORTED";
async function sorting({ supplierId, from, ht, wastage, meta } = {}) {
  if (!supplierId) throw new Error("supplierId is required");
  if (!from?.shade) throw new Error("from.shade is required");
  if (!from?.size) throw new Error("from.size is required");
  const qtyT = Number(from?.qtyT ?? 0);
  if (!(qtyT > 0)) throw new Error("qtyT must be > 0");
  const available = await stock.onHand({
    mmaCode: FROM_MMA,
    supplierId,
    shade: from.shade,
    size: from.size
  });
  if (Number(available) < qtyT) {
    return { status: "FAILED", error: `Insufficient stock: have ${available}, need ${qtyT}` };
  }
  const header = await prisma.sorting_tbl.create({
    data: {
      ht: ht == null ? null : Number(ht),
      wastage: wastage == null ? null : Number(wastage),
      meta: meta ?? null
      // committedAt is set after both ledger posts succeed
    }
  });
  const linkId = String(header.id);
  try {
    await stock.withdraw({
      fromMmaCode: FROM_MMA,
      supplierId,
      shade: from.shade,
      size: from.size,
      qty: qtyT,
      processId: linkId,
      reason: "PROCESS",
      meta: { ...meta, process: "sorting", step: "withdraw" }
    });
    await stock.deposit({
      toMmaCode: TO_MMA,
      supplierId,
      shade: from.shade,
      size: from.size,
      qty: qtyT,
      processId: linkId,
      reason: "PROCESS",
      meta: { ...meta, process: "sorting", step: "deposit" }
    });
    await prisma.sorting_tbl.update({
      where: { id: header.id },
      data: { committedAt: /* @__PURE__ */ new Date() }
    });
    return { status: "SUCCESS", id: header.id };
  } catch (err) {
    try {
      const have = await stock.onHand({
        mmaCode: TO_MMA,
        supplierId,
        shade: from.shade,
        size: from.size
      });
      if (have >= qtyT) {
        await stock.withdraw({
          fromMmaCode: TO_MMA,
          supplierId,
          shade: from.shade,
          size: from.size,
          qty: qtyT,
          processId: linkId,
          meta: { ...meta, step: "sorting.rollback.dest" }
        });
      }
      const lost = await stock.onHand({
        mmaCode: FROM_MMA,
        supplierId,
        shade: from.shade,
        size: from.size
      });
      if (lost < available) {
        await stock.deposit({
          toMmaCode: FROM_MMA,
          supplierId,
          shade: from.shade,
          size: from.size,
          qty: qtyT,
          processId: linkId,
          meta: { ...meta, step: "sorting.rollback.source" }
        });
      }
    } finally {
      await prisma.sorting_tbl.delete({ where: { id: header.id } }).catch(() => null);
    }
    return { status: "ROLLED_BACK", error: String(err?.message ?? err) };
  }
}
const load = async ({ url }) => {
  const supplierId = Number(url.searchParams.get("supplierId") ?? "");
  const shade = String(url.searchParams.get("shade") ?? "");
  const size = String(url.searchParams.get("size") ?? "");
  const qty = Number(url.searchParams.get("qty") ?? "");
  return {
    defaults: {
      supplierId: Number.isFinite(supplierId) ? supplierId : null,
      shade: shade || "",
      size: size || "",
      qty: Number.isFinite(qty) && qty > 0 ? qty : null,
      ht: null,
      wastage: null
    }
  };
};
const actions = {
  default: async ({ request }) => {
    const form = await request.formData();
    const supplierId = Number(form.get("supplierId"));
    const fromShade = String(form.get("shade") ?? "").trim();
    const fromSize = String(form.get("size") ?? "").trim();
    const qtyRaw = form.get("qty");
    const htRaw = form.get("ht");
    const wastageRaw = form.get("wastage");
    const qtyT = qtyRaw == null || qtyRaw === "" ? NaN : Number(qtyRaw);
    const ht = htRaw == null || htRaw === "" ? null : Number(htRaw);
    const wastage = wastageRaw == null || wastageRaw === "" ? null : Number(wastageRaw);
    if (!supplierId) throw new Error("supplierId is required");
    if (!fromShade) throw new Error("shade is required");
    if (!fromSize) throw new Error("size is required");
    if (!(qtyT > 0)) throw new Error("qtyT must be > 0");
    try {
      const res = await sorting({
        supplierId,
        from: { shade: fromShade, size: fromSize, qtyT },
        ht,
        wastage,
        meta: { page: "pss/sort" }
      });
      if (res.status !== "SUCCESS") {
        return fail(400, {
          error: "Sort failed",
          detail: res.error || "Unknown error",
          posted: { supplierId, fromShade, fromSize, qtyT, ht, wastage }
        });
      }
      throw redirect(303, "/stations/pss/pss_screened");
    } catch (e) {
      if (e?.status && e?.location) {
        throw e;
      }
      return fail(400, {
        error: "Sort failed",
        detail: String(e?.message || e),
        posted: { supplierId, fromShade, fromSize, qtyT, ht, wastage }
      });
    }
  }
};

var _page_server = /*#__PURE__*/Object.freeze({
  __proto__: null,
  actions: actions,
  load: load
});

const index = 37;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-BzTcMh-s.js')).default;
const server_id = "src/routes/stations/pss/sort/+page.server.js";
const imports = ["_app/immutable/nodes/37.zIxUR8nH.js","_app/immutable/chunks/BCQUcm9Y.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/pWrOR9M9.js","_app/immutable/chunks/CRYz92Wr.js","_app/immutable/chunks/CCnCa0Il.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server as server, server_id, stylesheets };
//# sourceMappingURL=37-DlkeUN4d.js.map
