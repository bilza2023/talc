// PSS — Sorted slots (unified /api/slots read)
export async function load({ fetch }) {
  const mmaCode = 'PSS_SORTED';
  const res = await fetch(`/api/slots?mmaCode=${encodeURIComponent(mmaCode)}&positiveOnly=1`);
  const j = await res.json().catch(() => ({ ok: false, data: [] }));

  return {
    mmaCode,
    positiveOnly: true,
    slots: j.ok ? j.data : []
  };
}
