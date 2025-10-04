// PSS — SCREENED (processed family)


// PSS — Screened slots, via API (no lib imports)
export async function load({ fetch }) {
  const mmaCode = 'PSS_SCREENED';
  const res = await fetch(`/api/slots?mmaCode=${encodeURIComponent(mmaCode)}&positiveOnly=1`);
  const j = await res.json().catch(() => ({ ok: false, data: [] }));

  return {
    mmaCode,
    positiveOnly: true,
    slots: j.ok ? j.data : []
  };
}

