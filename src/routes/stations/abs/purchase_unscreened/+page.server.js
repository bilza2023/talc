// Load suppliers via our API; wire page for ABS_RAW (unscreened)
export async function load({ fetch }) {
  const res = await fetch('/api/suppliers');
  const j = await res.json().catch(() => ({ ok: false, data: [] }));

  return {
    mmaCode: 'ABS_RAW',                    // ← unscreened MMA
    sizes: ['LUMPS', 'CHIPS', 'FINE'],
    suppliers: j.ok ? j.data : []
  };
}
