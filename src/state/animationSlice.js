import { tileType } from "../components/Tile";
import { allPairs, boxesIntersect, clearSelected, oppositeText } from "../util";
import { current, produce } from "immer";
import { pushHistory } from "./historySlice";

export const animationSlice = (set) => ({
  animation: false,
  annihilation: () =>
    set(
      produce((state) => {
        const elements = state.elements;
        const annihilations = searchAnnihilations(state);
        if (annihilations.length > 0) {
          for (const id of annihilations) {
            elements[id].annihilation = true;
            elements[id].delete = true;
          }
          state.animation = true;
        }
      })
    ),
  finishAnimations: () =>
    set(
      produce((state) => {
        if (state.animation) {
          for (const id in current(state.elements)) {
            const element = state.elements[id];
            if (element.moveFrom) {
              delete element.moveFrom;
            }
            if (element.visibleAfterMove) {
              element.visible = true;
              delete element.visibleAfterMove;
            }
            if (element.delete) {
              delete state.elements[id];
            }
          }
          state.animation = false;
          clearSelected(state);
          pushHistory(state);
        }
      })
    ),
});

export function searchAnnihilations(state) {
  const annihilations = [];
  const elements = state.elements;
  const tiles = Object.values(current(elements)).filter((e) => e.type == tileType);
  for (const [that, other] of allPairs(tiles)) {
    if (boxesIntersect(that, other) && oppositeText(that.text, other.text)) {
      annihilations.push(that.id, other.id);
    }
  }
  return annihilations;
}
