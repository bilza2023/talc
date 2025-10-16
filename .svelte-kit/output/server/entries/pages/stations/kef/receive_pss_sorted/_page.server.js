import { l as loadReceive } from "../../../../../chunks/receiveLoader.js";
const FROM_MMA = "PSS_SORTED";
const TO_MMA = "KEF_SORTED";
async function load(event) {
  return loadReceive(event, { fromMmaCode: FROM_MMA, toMmaCode: TO_MMA });
}
export {
  load
};
