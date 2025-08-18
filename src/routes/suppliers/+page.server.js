
// /src/routes/suppliers/+page.server.js
import { fail, redirect } from '@sveltejs/kit';
import * as supplierService from '/services/supplierService.js';

export async function load() {
  const suppliers = await supplierService.list();
  return { suppliers };
}

export const actions = {
  async create({ request }) {
    const fd = await request.formData();
    const code = String(fd.get('code') || '').trim();
    const name = String(fd.get('name') || '').trim();
    if (!code || !name) return fail(400, { message: 'Code and Name are required.' });

    try {
      await supplierService.create({ code, name });
      throw redirect(303, '/suppliers');
    } catch (err) {
      if (err?.code === 'P2002') {
        return fail(400, { message: `Supplier code "${code}" already exists.` });
      }
      return fail(500, { message: 'Failed to create supplier.' });
    }
  },

  async update({ request }) {
    const fd = await request.formData();
    const id = Number(fd.get('id'));
    const code = String(fd.get('code') || '').trim();
    const name = String(fd.get('name') || '').trim();
    if (!id || !code || !name) return fail(400, { message: 'ID, Code, Name required.' });

    try {
      await supplierService.update({ id, code, name });
      throw redirect(303, '/suppliers');
    } catch (err) {
      if (err?.code === 'P2002') {
        return fail(400, { message: `Supplier code "${code}" already exists.` });
      }
      return fail(500, { message: 'Failed to update supplier.' });
    }
  },

  async delete({ request }) {
    const fd = await request.formData();
    const id = Number(fd.get('id'));
    if (!id) return fail(400, { message: 'ID required.' });

    try {
      await supplierService.remove({ id });
      throw redirect(303, '/suppliers');
    } catch {
      return fail(500, { message: 'Failed to delete supplier.' });
    }
  }
};
