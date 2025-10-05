

// /src/routes/stations/abs/dispatch_kef_screened/+page.server.js
import { loadDispatch } from '$lib/app/dispatchLoader.js';

const FROM_MMA = 'ABS_SCREENED';
const TO_MMA   = 'KEF_SCREENED';

export async function load(event) {

  return loadDispatch(event, { fromMmaCode: FROM_MMA, toMmaCode: TO_MMA }, { requireSize: true });

}
