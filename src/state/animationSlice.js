import { tileType } from "../components/Tile";
import { allPairs, boxesIntersect, clearSelected, oppositeText } from "../util";
import { current, produce } from "immer";
import { pushHistory } from "./historySlice";
import { animationDuration } from "../config";

export const animationSlice = (set) => ({
  finishDelay: null,
  checkAnnihilations: () =>
    set(
      produce((state) => {
        const elements = state.elements;
        const annihilations = searchAnnihilations(state);
        if (annihilations.length > 0) {
          for (const [id1, id2] of annihilations) {
            elements[id1].annihilation = true;
            elements[id1].delete = true;
            elements[id2].annihilation = true;
            elements[id2].delete = true;
          }
          state.finishDelay = animationDuration;
        }
      })
    ),
  zeroPair: () =>
    set(
      produce((state) => {
        const elements = state.elements;
        const opposites = searchOpposites(state);
        if (opposites.length > 0) {
          for (const [id1, id2] of opposites) {
            const that = elements[id1];
            const other = elements[id2];
            const moveTo = {
              x: (that.x + other.x) / 2,
              y: (that.y + other.y) / 2,
            };
            that.moveTo = moveTo;
            other.moveTo = moveTo;
            that.delete = true;
            other.delete = true;
          }
          state.finishDelay = animationDuration * 2;
        }
      })
    ),
  finishAnimations: () =>
    set(
      produce((state) => {
        for (const id in current(state.elements)) {
          const element = state.elements[id];
          if (element.delete) {
            delete state.elements[id];
          }
        }
        state.finishDelay = null;
        clearSelected(state);
        pushHistory(state);
      })
    ),
});

export function searchAnnihilations(state) {
  const annihilations = [];
  const elements = state.elements;
  const tiles = Object.values(current(elements)).filter((e) => e.type == tileType);
  for (const [that, other] of allPairs(tiles)) {
    if (boxesIntersect(that, other) && oppositeText(that.text, other.text)) {
      annihilations.push([that.id, other.id]);
    }
  }
  return annihilations;
}

export function searchOpposites(state) {
  const opposites = [];
  const elements = state.elements;
  const tiles = Object.values(current(elements)).filter((e) => e.type == tileType);
  for (const [that, other] of allPairs(tiles)) {
    if (oppositeText(that.text, other.text)) {
      opposites.push([that.id, other.id]);
    }
  }
  return opposites;
}
