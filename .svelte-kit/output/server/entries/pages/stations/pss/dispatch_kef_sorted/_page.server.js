import { l as loadDispatch } from "../../../../../chunks/dispatchLoader.js";
const FROM_MMA = "PSS_SORTED";
const TO_MMA = "KEF_SORTED";
async function load(event) {
  return loadDispatch(event, { fromMmaCode: FROM_MMA, toMmaCode: TO_MMA }, { requireSize: true });
}
export {
  load
};
