// /src/routes/stations/pss/dispatch_kef_sorted/+page.server.js
import { loadDispatch } from '$lib/app/dispatchLoader.js';

const FROM_MMA = 'PSS_SORTED';
const TO_MMA   = 'KEF_SORTED';

export async function load(event) {
  // sorted lanes always have a size and may include amount
  return loadDispatch(event, { fromMmaCode: FROM_MMA, toMmaCode: TO_MMA }, { requireSize: true });
}
