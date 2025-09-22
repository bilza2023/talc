// /src/routes/tests/_actions.server.js
import { fail } from '@sveltejs/kit';
import { processed4s, sorted4s } from '$lib/mma/index.js';
import { zMmaCode, zShade, zSize } from '$lib/mma/enums.js';

/* ───────────────────────── helpers ───────────────────────── */

function errList(...messages) {
  return fail(400, { errors: messages.filter(Boolean) });
}

function asNumber(v, field, { int = false } = {}) {
  if (v == null || v === '') throw new Error(`${field} is required`);
  const n = int ? parseInt(String(v), 10) : parseFloat(String(v));
  if (Number.isNaN(n)) throw new Error(`Invalid ${field}: expected a number`);
  return n;
}

function toISO(v) {
  if (!v) return null;
  // Accepts "datetime-local" value or ISO; returns ISO or null
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

function safeMeta(raw) {
  if (!raw) return null;
  try {
    const s = String(raw).trim();
    return s ? JSON.parse(s) : null;
  } catch {
    throw new Error('Meta must be valid JSON (e.g., {"truckNo":"ABC-123"})');
  }
}

// Try to detect if an instance "owns" this mmaCode via its registry
function instanceOwns(inst, mmaCode) {
  try {
    const reg = inst?.registry;
    return Array.isArray(reg) && reg.includes(mmaCode);
  } catch {
    return false;
  }
}

// Pick the right instance by mmaCode; default to processed4s if unknown
function pickInstanceByMmaCode(mmaCode) {
  if (instanceOwns(processed4s, mmaCode)) return processed4s;
  if (instanceOwns(sorted4s, mmaCode)) return sorted4s;
  return processed4s;
}

// Some actions (receive/cancel) only get an inTransitId; try both instances
async function callOnAnyInstance(methodName, ...args) {
  const candidates = [processed4s, sorted4s];
  let lastErr;
  for (const inst of candidates) {
    const fn = inst?.[methodName];
    if (typeof fn !== 'function') continue;
    try {
      // Bind the instance to preserve "this" if the class uses it
      return await fn.call(inst, ...args);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error(`${methodName} failed on all instances`);
}

/* ───────────────────────── actions ───────────────────────── */

export const deposit = async ({ request }) => {
  const fd = await request.formData();
  try {
    const mmaCode = zMmaCode.parse(fd.get('mmaCode'));
    const supplierId = asNumber(fd.get('supplierId'), 'supplierId', { int: true });
    const shade = zShade.parse(fd.get('shade'));
    const size = zSize.parse(fd.get('size'));

    // form field is "amount" (or "qty"); engine wants "qty"
    const qty = asNumber(fd.get('amount') ?? fd.get('qty'), 'amount');
    if (!(qty > 0)) throw new Error('Amount must be > 0');

    const depositedAt = toISO(fd.get('depositedAt'));
    const meta = safeMeta(fd.get('meta'));

    const inst = pickInstanceByMmaCode(mmaCode);
    const res = await inst.deposit({ mmaCode, supplierId, shade, size, qty, depositedAt, meta });

    const id = res?.id ?? res?.batchId ?? null;
    return { ok: true, message: id ? `Deposit created (batch #${id})` : 'Deposit created' };
  } catch (e) {
    return errList(e.message || 'Deposit failed');
  }
};


export const dispatch = async ({ request }) => {
  const fd = await request.formData();
  try {
    const sourceMmaCode = zMmaCode.parse(fd.get('sourceMmaCode'));
    const destMmaCode = zMmaCode.parse(fd.get('destMmaCode'));
    const supplierId = asNumber(fd.get('supplierId'), 'supplierId', { int: true });
    const shade = zShade.parse(fd.get('shade'));
    const size = zSize.parse(fd.get('size'));

    const qty = asNumber(fd.get('amount') ?? fd.get('qty'), 'amount');
    if (!(qty > 0)) throw new Error('Amount must be > 0');

    const dispatchedAt = toISO(fd.get('dispatchedAt'));
    const meta = safeMeta(fd.get('meta'));

    const inst = pickInstanceByMmaCode(sourceMmaCode);
    const res = await inst.dispatch({
      sourceMmaCode, destMmaCode, supplierId, shade, size, qty, dispatchedAt, meta
    });

    const rowId = res?.id ?? res?.dispatchId ?? null;
    return { ok: true, message: rowId ? `Dispatch created (row #${rowId})` : 'Dispatch created' };
  } catch (e) {
    return errList(e.message || 'Dispatch failed');
  }
};


export const receive = async ({ request }) => {
  const fd = await request.formData();
  try {
    const inTransitId = asNumber(fd.get('inTransitId'), 'inTransitId', { int: true });

    const qty = asNumber(
      fd.get('receivedAmount') ?? fd.get('amount') ?? fd.get('qty'),
      'receivedAmount'
    );
    if (!(qty > 0)) throw new Error('Received amount must be > 0');

    const receivedAt = toISO(fd.get('receivedAt'));
    const meta = safeMeta(fd.get('meta'));

    // Try common signatures with qty first
    let res;
    try {
      res = await callOnAnyInstance('receive', { inTransitId, qty, receivedAt, meta });
    } catch {
      res = await callOnAnyInstance('receive', inTransitId, { qty, receivedAt, meta });
    }

    const rowId = res?.id ?? inTransitId;
    return { ok: true, message: `Received (row #${rowId})` };
  } catch (e) {
    return errList(e.message || 'Receive failed');
  }
};

export const cancel = async ({ request }) => {
  const fd = await request.formData();
  try {
    const inTransitId = asNumber(fd.get('inTransitId'), 'inTransitId', { int: true });
    const confirm = fd.get('confirm');
    if (confirm !== 'on') throw new Error('Please confirm cancellation');

    // Try both instances; support (id) and ({ inTransitId })
    try {
      await callOnAnyInstance('cancel', inTransitId);
    } catch {
      await callOnAnyInstance('cancel', { inTransitId });
    }

    return { ok: true, message: `Dispatch cancelled (row #${inTransitId})` };
  } catch (e) {
    return errList(e.message || 'Cancel failed');
  }
};

// SCREEN: "grade → deposit" convenience; defaults to whichever instance owns the code
export const screen = async ({ request }) => {
  const fd = await request.formData();
  try {
    const mmaCode = zMmaCode.parse(fd.get('mmaCode'));
    const supplierId = asNumber(fd.get('supplierId'), 'supplierId', { int: true });
    const shadeOut = zShade.parse(fd.get('shadeOut'));
    const sizeOut = zSize.parse(fd.get('sizeOut'));

    const qty = asNumber(fd.get('amount') ?? fd.get('qty'), 'amount');
    if (!(qty > 0)) throw new Error('Amount must be > 0');

    const at = toISO(fd.get('at'));
    const meta = safeMeta(fd.get('meta'));

    const inst = pickInstanceByMmaCode(mmaCode);
    await inst.deposit({ mmaCode, supplierId, shade: shadeOut, size: sizeOut, qty, depositedAt: at, meta });

    return { ok: true, message: 'Screened → deposit created' };
  } catch (e) {
    return errList(e.message || 'Screen failed');
  }
};


// SORT: move amount between slots (shade/size) inside the SAME MMA/table
export const sort = async ({ request }) => {
  const fd = await request.formData();
  try {
    const mmaCode = zMmaCode.parse(fd.get('mmaCode'));
    const supplierId = asNumber(fd.get('supplierId'), 'supplierId', { int: true });
    const fromShade = zShade.parse(fd.get('fromShade'));
    const fromSize = zSize.parse(fd.get('fromSize'));
    const toShade = zShade.parse(fd.get('toShade'));
    const toSize = zSize.parse(fd.get('toSize'));
    const amount = asNumber(fd.get('amount'), 'amount');
    if (!(amount > 0)) throw new Error('Amount must be > 0');
    if (fromShade === toShade && fromSize === toSize) {
      throw new Error('From and To slots are identical');
    }

    const at = toISO(fd.get('at'));
    const meta = safeMeta(fd.get('meta'));

    const inst = pickInstanceByMmaCode(mmaCode);

    // Preferred: call a first-class method if your instance supports it
    if (typeof inst.sort === 'function') {
      await inst.sort({ mmaCode, supplierId, fromShade, fromSize, toShade, toSize, amount, at, meta });
      return { ok: true, message: 'Sort completed (slot → slot)' };
    }
    if (typeof inst.relabel === 'function') {
      await inst.relabel({ mmaCode, supplierId, fromShade, fromSize, toShade, toSize, amount, at, meta });
      return { ok: true, message: 'Relabel completed (slot → slot)' };
    }

    // If the engine lacks a relabel/sort primitive, bail with a clear error.
    throw new Error('Sort/relabel is not implemented on this MMA instance. Add inst.sort() or inst.relabel().');
  } catch (e) {
    return errList(e.message || 'Sort failed');
  }
};
