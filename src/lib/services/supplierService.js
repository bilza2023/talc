// src/lib/services/supplierService.js

/**
 * Supplier service (factory pattern).
 * Usage:
 *   import prisma from '$lib/server/prisma.js';
 *   import createSupplierService from '$lib/services/supplierService.js';
 *   const suppliers = createSupplierService(prisma);
 *   await suppliers.list();
 */
export default function createSupplierService(prisma) {
    if (!prisma) throw new Error('supplierService requires a prisma instance');
  
    return {
      /**
       * Create a supplier
       * @param {{ name: string, code: string }} dto
       */
      async create({ name, code }) {
        return prisma.supplier.create({
          data: { name: String(name || '').trim(), code: String(code || '').trim() }
        });
      },
  
      /**
       * Update a supplier by id
       * @param {{ id: number, name?: string, code?: string }} dto
       */
      async update({ id, name, code }) {
        const data = {};
        if (name !== undefined) data.name = String(name).trim();
        if (code !== undefined) data.code = String(code).trim();
        return prisma.supplier.update({ where: { id: Number(id) }, data });
      },
  
      /**
       * Delete a supplier by id
       * @param {{ id: number }} dto
       */
      async remove({ id }) {
        return prisma.supplier.delete({ where: { id: Number(id) } });
      },
  
      /**
       * List suppliers (ordered)
       */
      async list() {
        return prisma.supplier.findMany({ orderBy: [{ name: 'asc' }, { id: 'asc' }] });
      },
  
      /**
       * Get supplier by id
       * @param {{ id: number }} dto
       */
      async get({ id }) {
        return prisma.supplier.findUnique({ where: { id: Number(id) } });
      },
  
      /**
       * Get supplier by code
       * @param {{ code: string }} dto
       */
      async getByCode({ code }) {
        return prisma.supplier.findUnique({ where: { code: String(code || '').trim() } });
      },
  
      /**
       * Upsert supplier by code (handy for quick workflows)
       * @param {{ code: string, name: string }} dto
       */
      async upsertByCode({ code, name }) {
        const _code = String(code || '').trim();
        const _name = String(name || '').trim();
        return prisma.supplier.upsert({
          where: { code: _code },
          update: { name: _name },
          create: { code: _code, name: _name }
        });
      }
    };
  }
  