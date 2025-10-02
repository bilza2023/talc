
// mma.js — ultra‑simple wrapper around a Stock engine
// No imports. No registry. No policies. No normalization.
// You pass the bound Stock engine and the fixed mmaCode.
// The wrapper just forwards calls with mmaCode prefilled.

/**
 * Create a tiny MMA wrapper bound to a specific Stock engine and mmaCode.
 *
 * @param {object} opts
 * @param {object} opts.stock   A Stock engine (RAW/SCREENED/SORTED) exposing
 *                              deposit, withdraw, dispatch, receive, cancel,
 *                              onHand, slots, inbound, outbound, transportAmounts, auditTransport.
 * @param {string} opts.mmaCode The identity for this MMA (e.g., 'PSS_SCREENED').
 * @param {string[]} [opts.verbs] Optional list of allowed verbs (e.g., ['purchase','dispatch','receive']).
 */
export function mma({ stock, mmaCode, verbs = [] }) {
    const allow = (v) => {
      if (verbs.length && !verbs.includes(v)) throw new Error(`${mmaCode} cannot ${v}`);
    };
  
    return Object.freeze({
      code: mmaCode,
      verbs: [...verbs],
  
      // ---- mutations ----
      async purchase({ supplierId, shade, size, qty, amount, meta } = {}) {
        allow('purchase');
        return stock.deposit({ toMmaCode: mmaCode, supplierId, shade, size, qty, amount, meta });
      },
  
      async withdraw({ supplierId, shade, size, qty, amount, meta } = {}) {
        // optional: only if your Stock exposes withdraw for MMAs
        allow('withdraw');
        return stock.withdraw({ fromMmaCode: mmaCode, supplierId, shade, size, qty, amount, meta });
      },
  
      async dispatch({ toMmaCode, supplierId, shade, size, qty, amount, meta } = {}) {
        allow('dispatch');
        return stock.dispatch({ fromMmaCode: mmaCode, toMmaCode, supplierId, shade, size, qty, amount, meta });
      },
  
      async receive({ transportId, supplierId, qty, shade, amount, meta } = {}) {
        allow('receive');
        return stock.receive({ transportId, toMmaCode: mmaCode, supplierId, qty, shade, amount, meta });
      },
  
      async cancel({ transportId, meta } = {}) {
        allow('cancel');
        return stock.cancel({ transportId, meta });
      },
  
      // ---- reads ----
      onHand:           (q = {}) => stock.onHand({ mmaCode, ...q }),
      slots:            (q = {}) => stock.slots({ mmaCode, ...q }),
      inbound:          (q = {}) => stock.inbound({ mmaCode, ...q }),
      outbound:         (q = {}) => stock.outbound({ mmaCode, ...q }),
      transportAmounts: (q = {}) => stock.transportAmounts({ mmaCode, ...q }),
      auditTransport:   (transportId) => stock.auditTransport(transportId),
    });
  }
  
  /**
   * Convenience helper if you prefer explicit engines object instead of importing elsewhere.
   * Usage:
   *   const { rawStock, processedStock, sortedStock } = ...
   *   const engines = { RAW: rawStock, SCREENED: processedStock, SORTED: sortedStock };
   *   const PSS = mmaFromFamily({ engines, family: 'SCREENED', mmaCode: 'PSS_SCREENED', verbs: ['purchase','dispatch','receive'] });
   */
  export function mmaFromFamily({ engines, family, mmaCode, verbs = [] }) {
    const stock = engines?.[family];
    if (!stock) throw new Error(`No Stock engine for family: ${family}`);
    return mma({ stock, mmaCode, verbs });
  }
  // mma.js — ultra‑simple wrapper around a Stock engine
  // No imports. No registry. No policies. No normalization.
  // You pass the bound Stock engine and the fixed mmaCode.
  // The wrapper just forwards calls with mmaCode prefilled.
  
  /**
   * Create a tiny MMA wrapper bound to a specific Stock engine and mmaCode.
   *
   * @param {object} opts
   * @param {object} opts.stock   A Stock engine (RAW/SCREENED/SORTED) exposing
   *                              deposit, withdraw, dispatch, receive, cancel,
   *                              onHand, slots, inbound, outbound, transportAmounts, auditTransport.
   * @param {string} opts.mmaCode The identity for this MMA (e.g., 'PSS_SCREENED').
   * @param {string[]} [opts.verbs] Optional list of allowed verbs (e.g., ['purchase','dispatch','receive']).
   */
  export function mma({ stock, mmaCode, verbs = [] }) {
    const allow = (v) => {
      if (verbs.length && !verbs.includes(v)) throw new Error(`${mmaCode} cannot ${v}`);
    };
  
    return Object.freeze({
      code: mmaCode,
      verbs: [...verbs],
  
      // ---- mutations ----
      async purchase({ supplierId, shade, size, qty, amount, meta } = {}) {
        allow('purchase');
        return stock.deposit({ toMmaCode: mmaCode, supplierId, shade, size, qty, amount, meta });
      },
  
      async withdraw({ supplierId, shade, size, qty, amount, meta } = {}) {
        // optional: only if your Stock exposes withdraw for MMAs
        allow('withdraw');
        return stock.withdraw({ fromMmaCode: mmaCode, supplierId, shade, size, qty, amount, meta });
      },
  
      async dispatch({ toMmaCode, supplierId, shade, size, qty, amount, meta } = {}) {
        allow('dispatch');
        return stock.dispatch({ fromMmaCode: mmaCode, toMmaCode, supplierId, shade, size, qty, amount, meta });
      },
  
      async receive({ transportId, supplierId, qty, shade, amount, meta } = {}) {
        allow('receive');
        return stock.receive({ transportId, toMmaCode: mmaCode, supplierId, qty, shade, amount, meta });
      },
  
      async cancel({ transportId, meta } = {}) {
        allow('cancel');
        return stock.cancel({ transportId, meta });
      },
  
      // ---- reads ----
      onHand:           (q = {}) => stock.onHand({ mmaCode, ...q }),
      slots:            (q = {}) => stock.slots({ mmaCode, ...q }),
      inbound:          (q = {}) => stock.inbound({ mmaCode, ...q }),
      outbound:         (q = {}) => stock.outbound({ mmaCode, ...q }),
      transportAmounts: (q = {}) => stock.transportAmounts({ mmaCode, ...q }),
      auditTransport:   (transportId) => stock.auditTransport(transportId),
    });
  }
  
  /**
   * Convenience helper if you prefer explicit engines object instead of importing elsewhere.
   * Usage:
   *   const { rawStock, processedStock, sortedStock } = ...
   *   const engines = { RAW: rawStock, SCREENED: processedStock, SORTED: sortedStock };
   *   const PSS = mmaFromFamily({ engines, family: 'SCREENED', mmaCode: 'PSS_SCREENED', verbs: ['purchase','dispatch','receive'] });
   */
  export function mmaFromFamily({ engines, family, mmaCode, verbs = [] }) {
    const stock = engines?.[family];
    if (!stock) throw new Error(`No Stock engine for family: ${family}`);
    return mma({ stock, mmaCode, verbs });
  }
  