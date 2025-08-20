// Tiny helpers to read/normalize values from FormData consistently.

export const R = {
    str: (key, { trim = true, upper = false, required = false } = {}) => (fd) => {
      let v = fd.get(key);
      v = v == null ? '' : String(v);
      if (trim) v = v.trim();
      if (upper) v = v.toUpperCase();
      if (required && !v) return ['ERR', `${key} required`];
      return ['OK', v];
    },
  
    intId: (key, { required = false } = {}) => (fd) => {
      const raw = fd.get(key);
      const v = Number(raw);
      if (Number.isInteger(v) && v > 0) return ['OK', v];
      if (required) return ['ERR', `${key} must be a positive integer`];
      return ['OK', 0];
    },
  
    num: (key, { required = false, gt = null, gte = null } = {}) => (fd) => {
      const v = Number(fd.get(key));
      if (Number.isFinite(v)) {
        if (gt != null && !(v > gt)) return ['ERR', `${key} must be > ${gt}`];
        if (gte != null && !(v >= gte)) return ['ERR', `${key} must be ≥ ${gte}`];
        if (required && !v) return ['ERR', `${key} required`];
        return ['OK', v];
      }
      return ['ERR', `${key} must be a number`];
    },
  
    // Simple enum validator if you want it:
    $enum: (key, allowed, { required = false, upper = false } = {}) => (fd) => {
      let v = fd.get(key);
      v = v == null ? '' : String(v);
      if (upper) v = v.toUpperCase();
      if (required && !v) return ['ERR', `${key} required`];
      if (v && !allowed.includes(v)) return ['ERR', `${key} must be one of: ${allowed.join(', ')}`];
      return ['OK', v];
    }
  };
  
  export function parse(fd, spec) {
    const values = {};
    const errors = [];
    for (const [key, reader] of Object.entries(spec)) {
      const [status, val] = reader(fd);
      if (status === 'OK') values[key] = val;
      else errors.push(val);
    }
    return { values, errors };
  }
  