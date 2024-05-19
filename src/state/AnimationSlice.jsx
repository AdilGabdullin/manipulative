import { allPairs, boxesIntersect, clearSelected, halfPixel, invertText, newId, oppositeText } from "../util";
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
            that.moveTo = {
              x: Math.round((that.x + other.x) / 2),
              y: Math.round((that.y + other.y) / 2 - that.size / 4),
            };
            other.moveTo = {
              x: Math.round((that.x + other.x) / 2),
              y: Math.round((that.y + other.y) / 2 + that.size / 4),
            };
            that.delete = true;
            that.zeroPos = {
              x: Math.round((that.x + other.x) / 2),
              y: Math.round((that.y + other.y) / 2 - that.size / 4),
            };
            other.delete = true;
          }
          state.finishDelay = animationDuration * 2;
          clearSelected(state);
        }
      })
    ),
  invertSelected: () =>
    set(
      produce((state) => {
        for (const id of current(state.selected)) {
          const element = state.elements[id];
          if (element.type == "tile") {
            element.invert = true;
          }
        }
        state.finishDelay = animationDuration;
        clearSelected(state);
      })
    ),
  rotateSelected: () =>
    set(
      produce((state) => {
        for (const id of current(state.selected)) {
          const element = state.elements[id];
          if (element.type == "tile") {
            element.rotate = true;
          }
        }
        state.finishDelay = animationDuration;
        clearSelected(state);
      })
    ),
  finishAnimations: () =>
    set(
      produce((state) => {
        for (const id in current(state.elements)) {
          const element = state.elements[id];
          if (element.delete) {
            if (element.zeroPos) {
              addZero(state, element.zeroPos);
            }
            delete state.elements[id];
          }
          if (element.invert) {
            element.text = invertText(element.text);
            delete element.invert;
          }
          if (element.rotate) {
            const { x, y, width, height } = element;
            element.width = height;
            element.height = width;
            element.x = x + width / 2 - height / 2;
            element.y = y + height / 2 - width / 2;
            delete element.rotate;
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
  const tiles = Object.values(current(elements)).filter((e) => e.type == "tile");
  const used = [];
  for (const [that, other] of allPairs(tiles)) {
    if (used.includes(that.id) || used.includes(other.id)) continue;
    if (boxesIntersect(that, other) && oppositeText(that.text, other.text)) {
      annihilations.push([that.id, other.id]);
      used.push(that.id, other.id);
    }
  }
  return annihilations;
}

export function searchOpposites(state) {
  const opposites = [];
  const elements = state.elements;
  const isTile = (e) => e.type == "tile";
  const isSelected = (e) => state.selected.includes(e.id);
  const tiles = Object.values(current(elements)).filter((e) => isTile(e) && isSelected(e));
  const used = [];
  for (const [that, other] of allPairs(tiles)) {
    if (used.includes(that.id) || used.includes(other.id)) continue;
    if (oppositeText(that.text, other.text)) {
      opposites.push([that.id, other.id]);
      used.push(that.id, other.id);
    }
  }
  return opposites;
}

function addZero(state, { x, y }) {
  const id = newId();
  state.elements[id] = {
    type: "tile",
    id,
    x,
    y,
    width: 62,
    height: 93,
    size: 62,
    fill: "grey",
    stroke: "#000000",
    text: "0",
    locked: false,
  };
  state.fdMode = null;
  state.lastActiveElement = id;
  clearSelected(state);
}
