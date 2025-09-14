// /src/lib/crudl/crudl.js
// Tiny CRUDL factory for Prisma-backed models (Create, Read, Update, Delete, List)
// Usage:
//   import { makeCrudl } from '$lib/crudl/crudl.js';
//   const questions = makeCrudl('question', { unique: ['slug', 'id'] });
//   await questions.create({...})
//   await questions.read('my-slug')
//   await questions.update('my-slug', {...})
//   await questions.delete('my-slug')
//   await questions.list({ filters: { tcode: 'math' }, limit: 50, offset: 0 })
//
// Design:
// - Generic base for boring CRUDL
// - App-facing services can wrap/extend this to add domain rules
// - Centralizes Prisma error mapping & consistent options

import prisma from '$lib/server/prisma.js';

/** Map Prisma errors to friendly, consistent error objects */
function mapPrismaError(e, ctx = {}) {
  if (!e || typeof e !== 'object') return e;

  // Prisma known request errors expose "code"
  switch (e.code) {
    case 'P2002': {
      const err = new Error('Duplicate: unique constraint failed');
      err.code = 'DUPLICATE';
      err.meta = e.meta;
      err.context = ctx;
      return err;
    }
    case 'P2025': {
      const err = new Error('Not found');
      err.code = 'NOT_FOUND';
      err.context = ctx;
      return err;
    }
    case 'P2003': {
      const err = new Error('Constraint: related record required or in use');
      err.code = 'FK_CONSTRAINT';
      err.meta = e.meta;
      err.context = ctx;
      return err;
    }
    default:
      return e;
  }
}

/** Ensure only one of select/include is passed to Prisma */
function pickSelectInclude(select, include, fallbacks = {}) {
  const s = select ?? fallbacks.select;
  const i = include ?? fallbacks.include;
  if (s && i) {
    // Prefer explicit call-level args over defaults
    return { select: s };
  }
  if (s) return { select: s };
  if (i) return { include: i };
  return {};
}

/** Heuristic to build a unique "where" from idOrUnique using configured keys */
function toUniqueWhere(idOrUnique, uniqueKeys = ['id']) {
  if (idOrUnique && typeof idOrUnique === 'object' && !Array.isArray(idOrUnique)) {
    // Assume caller already provided a valid unique where
    return { where: idOrUnique, mode: 'first' };
  }

  // Primitive → try keys in order
  const val = idOrUnique;
  for (const key of uniqueKeys) {
    if (key === 'id') {
      // Numeric id: accept number or numeric string
      const n = typeof val === 'number' ? val : Number(val);
      if (!Number.isNaN(n) && Number.isFinite(n)) {
        return { where: { id: n }, mode: 'unique' };
      }
      // If not numeric, continue trying next key
    } else {
      // Treat as string for slug or other unique fields
      if (val != null) return { where: { [key]: String(val) }, mode: 'unique' };
    }
  }
  // Fallback: treat as {id: Number(val)} if possible, else raw {idOrUnique}
  const n = Number(val);
  if (!Number.isNaN(n)) return { where: { id: n }, mode: 'unique' };
  // Last resort: let Prisma fail — but keep shape
  return { where: { [uniqueKeys[0] || 'id']: val }, mode: 'unique' };
}

/**
 * Factory for CRUDL on a Prisma model.
 *
 * @param {string} modelName - Prisma model name (e.g., 'question')
 * @param {object} options
 * @param {string[]} [options.unique=['id']] - Ordered unique keys to resolve Read/Update/Delete (e.g., ['slug','id'])
 * @param {object} [options.defaults] - Default data merged into create()
 * @param {object} [options.select] - Default Prisma select
 * @param {object} [options.include] - Default Prisma include
 * @param {object|object[]} [options.defaultOrderBy] - Default orderBy for list()
 * @param {(filters:any)=>object} [options.whereFilter] - Transform list(filters) → Prisma where
 * @param {object} [options.hooks] - Optional hooks: beforeCreate, beforeUpdate, afterRead
 * @returns {object} { create, read, update, delete, list }
 */
export function makeCrudl(modelName, options = {}) {
  const {
    unique = ['id'],
    defaults = {},
    select: defaultSelect,
    include: defaultInclude,
    defaultOrderBy,
    whereFilter,
    hooks = {}
  } = options;

  const model = prisma?.[modelName];
  if (!model) {
    throw new Error(`[crudl] Prisma model "${modelName}" not found. Check model name and Prisma client import.`);
  }

  async function create(data, { select, include } = {}) {
    try {
      const payload = hooks.beforeCreate ? await hooks.beforeCreate({ ...defaults, ...data }) : { ...defaults, ...data };
      const si = pickSelectInclude(select, include, { select: defaultSelect, include: defaultInclude });
      const row = await model.create({ data: payload, ...si });
      return hooks.afterRead ? await hooks.afterRead(row) : row;
    } catch (e) {
      throw mapPrismaError(e, { op: 'create', model: modelName, data });
    }
  }

  async function read(idOrUnique, { select, include } = {}) {
    try {
      const { where, mode } = toUniqueWhere(idOrUnique, unique);
      const si = pickSelectInclude(select, include, { select: defaultSelect, include: defaultInclude });
      const row = mode === 'unique'
        ? await model.findUnique({ where, ...si })
        : await model.findFirst({ where, ...si });
      if (!row) {
        const err = new Error('Not found');
        err.code = 'NOT_FOUND';
        err.context = { op: 'read', model: modelName, where };
        throw err;
      }
      return hooks.afterRead ? await hooks.afterRead(row) : row;
    } catch (e) {
      throw mapPrismaError(e, { op: 'read', model: modelName, idOrUnique });
    }
  }

  async function update(idOrUnique, data, { select, include } = {}) {
    const { where } = toUniqueWhere(idOrUnique, unique);
    try {
      const payload = hooks.beforeUpdate ? await hooks.beforeUpdate(data, where) : data;
      const si = pickSelectInclude(select, include, { select: defaultSelect, include: defaultInclude });
      const row = await model.update({ where, data: payload, ...si });
      return hooks.afterRead ? await hooks.afterRead(row) : row;
    } catch (e) {
      throw mapPrismaError(e, { op: 'update', model: modelName, where, data });
    }
  }

  async function remove(idOrUnique, { select, include } = {}) {
    const { where } = toUniqueWhere(idOrUnique, unique);
    try {
      const si = pickSelectInclude(select, include, { select: defaultSelect, include: defaultInclude });
      const row = await model.delete({ where, ...si });
      return hooks.afterRead ? await hooks.afterRead(row) : row;
    } catch (e) {
      throw mapPrismaError(e, { op: 'delete', model: modelName, where });
    }
  }

  /**
   * List records.
   * @param {object} opts
   * @param {any} [opts.filters] - Arbitrary filter input to be transformed by whereFilter
   * @param {object} [opts.where] - Direct Prisma where (overrides filters)
   * @param {object|object[]} [opts.orderBy] - Prisma orderBy (default: options.defaultOrderBy or [{sortOrder:'asc'},{createdAt:'asc'}] if present)
   * @param {number} [opts.limit=100]
   * @param {number} [opts.offset=0]
   * @param {object} [opts.select]
   * @param {object} [opts.include]
   * @param {boolean} [opts.withCount=false] - If true, also return total count
   * @returns {Promise<any[] | {items:any[], total:number}>}
   */
  async function list(opts = {}) {
    const {
      filters,
      where,
      orderBy,
      limit = 100,
      offset = 0,
      select,
      include,
      withCount = false
    } = opts;

    try {
      const whereFinal =
        where ??
        (typeof whereFilter === 'function' ? whereFilter(filters) : (filters || {}));

      const ob =
        orderBy ??
        defaultOrderBy ??
        // sensible fallback if fields exist; Prisma ignores unknown keys gracefully
        [{ sortOrder: 'asc' }, { createdAt: 'asc' }];

      const si = pickSelectInclude(select, include, { select: defaultSelect, include: defaultInclude });

      if (withCount) {
        const [items, total] = await Promise.all([
          model.findMany({ where: whereFinal, orderBy: ob, take: limit, skip: offset, ...si }),
          model.count({ where: whereFinal })
        ]);
        const mapped = hooks.afterRead ? await Promise.all(items.map((r) => hooks.afterRead(r))) : items;
        return { items: mapped, total };
      }

      const rows = await model.findMany({ where: whereFinal, orderBy: ob, take: limit, skip: offset, ...si });
      return hooks.afterRead ? Promise.all(rows.map((r) => hooks.afterRead(r))) : rows;
    } catch (e) {
      throw mapPrismaError(e, { op: 'list', model: modelName, opts });
    }
  }

  return {
    create,
    read,
    update,
    delete: remove,
    list
  };
}

export default makeCrudl;
