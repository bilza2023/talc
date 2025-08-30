// src/lib/services/supplierService.js

/**
 * Supplier service (factory) — inject a Prisma client.
 * @param {import('@prisma/client').PrismaClient} db
 */
export default function createSupplierService(db) {
  if (!db) {
    throw Object.assign(new Error('Prisma client required'), { code: 'E_PRISMA_REQUIRED' });
  }

  /** Create a supplier */
  async function create({ name, code }) {
    return db.supplier.create({ data: { name, code } });
  }

  /** Update a supplier */
  async function update({ id, name, code }) {
    return db.supplier.update({
      where: { id: Number(id) },
      data: { name, code }
    });
  }

  /** Delete a supplier */
  async function remove({ id }) {
    return db.supplier.delete({ where: { id: Number(id) } });
  }

  /** List suppliers (ascending by id) */
  async function list() {
    return db.supplier.findMany({ orderBy: { id: 'asc' } });
  }

  /** Get one supplier by id */
  async function get({ id }) {
    return db.supplier.findUnique({ where: { id: Number(id) } });
  }

  return { create, update, remove, list, get };
}
