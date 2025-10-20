import { f as fail, r as redirect } from './index-BL3bFNcc.js';
import { PrismaClient } from '@prisma/client';

const prisma = globalThis.__prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}
function createSupplierService(db) {
  if (!db) {
    throw Object.assign(new Error("Prisma client required"), { code: "E_PRISMA_REQUIRED" });
  }
  async function create({ name, code }) {
    return db.supplier.create({ data: { name, code } });
  }
  async function update({ id, name, code }) {
    return db.supplier.update({
      where: { id: Number(id) },
      data: { name, code }
    });
  }
  async function remove({ id }) {
    return db.supplier.delete({ where: { id: Number(id) } });
  }
  async function list() {
    return db.supplier.findMany({ orderBy: { id: "asc" } });
  }
  async function get({ id }) {
    return db.supplier.findUnique({ where: { id: Number(id) } });
  }
  return { create, update, remove, list, get };
}
const supplierService = createSupplierService(prisma);
async function load() {
  const suppliers = await supplierService.list();
  return { suppliers };
}
const actions = {
  async create({ request }) {
    const fd = await request.formData();
    const code = String(fd.get("code") || "").trim();
    const name = String(fd.get("name") || "").trim();
    if (!code || !name) return fail(400, { message: "Code and Name are required." });
    try {
      await supplierService.create({ code, name });
      throw redirect(303, "/suppliers");
    } catch (err) {
      if (err?.code === "P2002") {
        return fail(400, { message: `Supplier code "${code}" already exists.` });
      }
      return fail(500, { message: "Failed to create supplier." });
    }
  },
  async update({ request }) {
    const fd = await request.formData();
    const id = Number(fd.get("id"));
    const code = String(fd.get("code") || "").trim();
    const name = String(fd.get("name") || "").trim();
    if (!id || !code || !name) return fail(400, { message: "ID, Code, and Name are required." });
    try {
      await supplierService.update({ id, code, name });
      throw redirect(303, "/suppliers");
    } catch (err) {
      if (err?.code === "P2002") {
        return fail(400, { message: `Supplier code "${code}" already exists.` });
      }
      return fail(500, { message: "Failed to update supplier." });
    }
  },
  async delete({ request }) {
    const fd = await request.formData();
    const id = Number(fd.get("id"));
    if (!id) return fail(400, { message: "ID required." });
    try {
      await supplierService.remove({ id });
      throw redirect(303, "/suppliers");
    } catch {
      return fail(500, { message: "Failed to delete supplier." });
    }
  }
};

var _page_server = /*#__PURE__*/Object.freeze({
  __proto__: null,
  actions: actions,
  load: load
});

const index = 38;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-_dr7aLFD.js')).default;
const server_id = "src/routes/suppliers/+page.server.js";
const imports = ["_app/immutable/nodes/38.CBZXNUu3.js","_app/immutable/chunks/BCQUcm9Y.js","_app/immutable/chunks/D4gjX95n.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/B8JI30u4.js"];
const stylesheets = ["_app/immutable/assets/H1.BAUvzhtN.css","_app/immutable/assets/38.BT553QCA.css"];
const fonts = [];

export { component, fonts, imports, index, _page_server as server, server_id, stylesheets };
//# sourceMappingURL=38-Du-OmhAi.js.map
