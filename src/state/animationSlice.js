import { allPairs, boxesIntersect, clearSelected, distance2, newId, oppositeText } from "../util";
import { current, produce } from "immer";
import { pushHistory } from "./historySlice";
import { animationDuration, colors, config } from "../config";

export const animationSlice = (set) => ({
  finishDelay: null,
  checkAnnihilations: () =>
    set(
      produce((state) => {
        const elements = state.elements;
        const annihilations = searchAnnihilations(state);
        if (annihilations.length > 0 && !state.finishDelay) {
          for (const [id1, id2] of annihilations) {
            moveAndZero(elements[id1], elements[id2]);
          }
          state.finishDelay = animationDuration * 2;
          clearSelected(state);
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
            moveAndZero(elements[id1], elements[id2]);
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
          if (element.type == "tile" && ["+", "-"].includes(element.text)) {
            element.invert = true;
          }
        }
        state.finishDelay = animationDuration;
        clearSelected(state);
      })
    ),
  breakSelected: () =>
    set(
      produce((state) => {
        for (const id of current(state.selected)) {
          const element = state.elements[id];
          if (element.type == "tile" && element.text == "0") {
            element.break = true;
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
            if (element.text == "+") {
              element.text = "-";
              element.fill = config.tile.options[1].fill;
            } else {
              element.text = "+";
              element.fill = config.tile.options[0].fill;
            }
            delete element.invert;
          }
          if (element.break) {
            addPlusMinus(state, element);
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
  const tiles = Object.values(current(elements)).filter((e) => e.type == "tile");
  const size = config.tile.size;
  const threshold = size * size * 0.95;
  const used = [];
  for (const [that, other] of allPairs(tiles)) {
    if (used.includes(that.id) || used.includes(other.id)) continue;
    if (distance2(that, other) < threshold && oppositeText(that.text, other.text)) {
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

function moveAndZero(that, other) {
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
    fill: colors.darkGrey,
    text: "0",
    locked: false,
  };
  state.fdMode = null;
  state.lastActiveElement = id;
}

function addPlusMinus(state, { x, y }) {
  let id;
  const add = (y, text, fill) => {
    id = newId();
    state.elements[id] = {
      type: "tile",
      id,
      x,
      y,
      width: 62,
      height: 62,
      size: 62,
      fill: fill,
      text: text,
      locked: false,
    };
  };
  const size = config.tile.size;
  add(y - size / 2, "+", colors.yellow);
  add(y + size, "-", colors.red);
  state.fdMode = null;
  state.lastActiveElement = id;
}
