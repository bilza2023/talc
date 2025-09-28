
// URL helpers so pages build consistent links from the same policy.
// We keep them simple and explicit.

function q(obj) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(obj)) {
      if (v === undefined || v === null || v === '') continue;
      params.set(k, String(v));
    }
    return `?${params.toString()}`;
  }
  
  export function buildDispatchUrl({
    fromStation, fromFamily,
    toStation, toFamily,
    supplierId, shade, size, qty, amount, meta
  }) {
    return `/actions/dispatch${q({
      fromStation, fromFamily, toStation, toFamily,
      supplierId, shade, size, qty, amount,
      meta: meta ? JSON.stringify(meta) : undefined
    })}`;
  }
  
  export function buildReceiveUrl({
    toStation, toFamily,
    transportId, supplierId, qty, amount, shade, meta
  }) {
    return `/actions/receive${q({
      toStation, toFamily,
      transportId, supplierId, qty, amount, shade,
      meta: meta ? JSON.stringify(meta) : undefined
    })}`;
  }
  