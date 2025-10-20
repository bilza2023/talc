async function load({ fetch }) {
  const mmaCode = "ABS_RAW";
  const positiveOnly = true;
  const res = await fetch(`/api/slots?mmaCode=${encodeURIComponent(mmaCode)}&positiveOnly=1`);
  const j = await res.json().catch(() => ({ ok: false, data: [] }));
  return {
    mmaCode,
    positiveOnly,
    slots: j.ok ? j.data : []
  };
}
export {
  load
};
