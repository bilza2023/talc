import { fail } from '@sveltejs/kit';

export function mapActionError(e, values) {
  // Known app logic errors (throw { code, message })
  if (e?.code === 'INSUFFICIENT_STOCK') {
    return fail(400, { ok: false, code: e.code, message: e.message, values });
  }

  // Prisma common codes
  if (e?.code === 'P2025') {
    return fail(404, { ok: false, code: e.code, message: 'Record not found', values });
  }
  if (e?.code === 'P2003') {
    return fail(400, { ok: false, code: e.code, message: 'Foreign key constraint failed', values });
  }

  console.error('[ActionError]', e);
  return fail(400, { ok: false, message: e?.message || 'Something went wrong', values });
}
