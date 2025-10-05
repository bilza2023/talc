// /src/routes/stations/kef/receive_sorted/+page.server.js
import { loadReceive } from '$lib/app/receiveLoader.js';

const FROM_MMA = 'PSS_SORTED';
const TO_MMA   = 'KEF_SORTED';

export async function load(event) {
  return loadReceive(event, { fromMmaCode: FROM_MMA, toMmaCode: TO_MMA });
}
