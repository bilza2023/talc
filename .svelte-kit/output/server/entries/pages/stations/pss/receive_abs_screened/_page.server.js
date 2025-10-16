import { l as loadReceive } from "../../../../../chunks/receiveLoader.js";
const FROM_MMA = "ABS_SCREENED";
const TO_MMA = "PSS_SCREENED";
async function load(event) {
  return loadReceive(event, { fromMmaCode: FROM_MMA, toMmaCode: TO_MMA });
}
export {
  load
};
