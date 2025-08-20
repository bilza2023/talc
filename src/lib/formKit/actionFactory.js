import { fail } from '@sveltejs/kit';
import { parse } from './readers.js';
import { mapActionError } from './errors.js';

/**
 * makeAction({
 *   spec: { field: R.str(...), ... },
 *   prepare?: (values) => values | throws,
 *   service: async (values) => any,
 *   success?: (result, values) => ({ ...extra })
 * })
 */
export function makeAction({ spec, prepare, service, success }) {
  return async ({ request }) => {
    const fd = await request.formData();
    const { values, errors } = parse(fd, spec);

    if (errors.length) {
      return fail(400, { ok: false, message: errors[0], errors, values });
    }

    try {
      const prepared = prepare ? await prepare(values) : values;
      const result = await service(prepared);

      return {
        ok: true,
        saved: prepared,
        ...(success ? success(result, prepared) : {})
      };
    } catch (e) {
      return mapActionError(e, values);
    }
  };
}
