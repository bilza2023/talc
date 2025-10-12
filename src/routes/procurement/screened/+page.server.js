// /src/routes/stations/abs/purchase_screened/+page.server.js
export async function load({ fetch }) {
  // Call our own API endpoint
  const res = await fetch('/api/suppliers');
  const j = await res.json().catch(() => ({ ok: false, data: [] }));

  return {
    mmaCode: 'ABS_SCREENED',
    sizes: ['LUMPS', 'CHIPS', 'FINE'],
    suppliers: j.ok ? j.data : []
  };
}
