async function load({ fetch }) {
  const mmaCode = "ABS_SCREENED";
  const res = await fetch(`/api/slots?mmaCode=${encodeURIComponent(mmaCode)}&positiveOnly=1`);
  const j = await res.json().catch(() => ({ ok: false, data: [] }));
  return {
    mmaCode,
    positiveOnly: true,
    slots: j.ok ? j.data : []
  };
}
export {
  load
};
