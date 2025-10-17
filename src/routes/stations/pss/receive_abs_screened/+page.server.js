// /src/routes/stations/pss/receive_abs_screened/+page.server.js
import { loadReceive } from '$lib/app/receiveLoader.js';

const FROM_MMA = 'ABS_SCREENED';
const TO_MMA   = 'PSS_SCREENED';

export async function load(event) {
  return loadReceive(event, { fromMmaCode: FROM_MMA, toMmaCode: TO_MMA });
}
