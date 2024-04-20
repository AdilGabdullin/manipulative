import { current, produce } from "immer";
import { arrayChunk, avg, clearSelected, cos, newId, sin } from "../util";
import { pushHistory } from "./historySlice";
import config from "../config";

const { animationDuration } = config;
const { size, depthScale, angle } = config.block;
const scale = size;
const depthStepX = cos(angle) * scale * depthScale;
const depthStepY = sin(angle) * scale * depthScale;

export const breakRegroupSlice = (set) => ({
  finishDelay: null,
  finishAnimations: () =>
    set(
      produce((state) => {
        for (const id in current(state.elements)) {
          const element = state.elements[id];
          if (element.moveTo) {
            element.x = element.moveTo.x;
            element.y = element.moveTo.y;
            element.moveTo = null;
          }
          if (element.deleteAfterMove) {
            delete state.elements[id];
          }
          if (element.visibleAfterMove) {
            state.elements[id].visibleAfterMove = null;
            state.elements[id].visible = true;
          }
        }
        state.finishDelay = null;
        clearSelected(state);
        pushHistory(state);
      })
    ),
  breakSelected: () =>
    set(
      produce((state) => {
        let id;
        while ((id = state.selected.pop())) {
          const block = state.elements[id];
          if (block.label == 1) {
            continue;
          } else if (block.label == 10) {
            createBlocks1(state, block);
          } else if (block.label == 100) {
            createBlocks10(state, block);
          } else if (block.label == 1000) {
            createBlocks100(state, block);
          }
          delete state.elements[id];
        }
        state.lastActiveElement = null;
        state.finishDelay = animationDuration;
      })
    ),
  regroupSelected: () =>
    set(
      produce((state) => {
        const entries = Object.entries(blocksByValue(current(state)));
        for (const [label, list] of entries) {
          for (const chunk of arrayChunk(list, 10)) {
            if (chunk.length < 10) continue;
            const { x, y } = avgPos(chunk, label);
            createBlock(state, label * 10, x, y, 0, 0, true);
            chunk.forEach(({ id }, i) => {
              const block = state.elements[id];
              if (label == 1) block.moveTo = { x, y: y + scale * i };
              if (label == 10) block.moveTo = { x: x + scale * i, y: y };
              if (label == 100) block.moveTo = { x: x + depthStepX * i, y: y - depthStepY * i };
              block.deleteAfterMove = true;
            });
          }
        }
        state.finishDelay = animationDuration;
        clearSelected(state);
      })
    ),
});

function blocksByValue(state) {
  const { elements, selected } = state;
  const blocks = Object.values(elements).filter((e) => e.type == "block" && e.label != 1000 && selected.includes(e.id));
  return Object.groupBy(blocks, (e) => e.label);
}

export function regroupPossible(state) {
  return Object.values(blocksByValue(state)).some((arr) => arr.length >= 10);
}

function avgPos(blocks, label) {
  const pos = { x: avg(blocks.map((d) => d.x)), y: avg(blocks.map((d) => d.y)) };
  switch (label) {
    case "1":
      pos.y -= scale * 4.5;
      break;
    case "10":
      pos.x -= scale * 4.5;
      break;
    case "100":
      pos.x -= scale * 2;
      pos.y += scale * 1.1;
      break;
  }
  return pos;
}

function createBlocks1(state, { x, y, size }) {
  const isVertical = size[0] < size[1];
  if (isVertical) {
    for (let i = 0; i < 10; i += 1) {
      const sign = i % 2 == 0 ? -1 : 1;
      createBlock(state, 1, x, y + i * scale, scale * sign, -(scale / 2) * sign);
    }
  } else {
    for (let i = 0; i < 10; i += 1) {
      const sign = i % 2 == 0 ? -1 : 1;
      createBlock(state, 1, x + i * scale, y, -(scale / 2) * sign, scale * sign);
    }
  }
}

function createBlocks10(state, { x, y }) {
  for (let i = 0; i < 10; i += 1) {
    const sign = i % 2 == 0 ? -1 : 1;
    createBlock(state, 10, x + i * scale, y, -(scale / 2) * sign, 5.5 * scale * sign);
  }
}

function createBlocks100(state, { x, y }) {
  for (let i = 0; i < 10; i += 1) {
    const sign = i < 5 == 0 ? 1 : -1;
    createBlock(state, 100, x + i * depthStepX, y - i * depthStepY, -2.5 * depthStepX * sign, -5.5 * scale * sign);
  }
}

function createBlock(state, label, x, y, dx, dy, visibleAfterMove = false) {
  const id = newId();
  const props = config.block.options[label];
  const { width, height, top, right } = props;
  state.elements[id] = {
    ...props,
    id,
    type: "block",
    x,
    y,
    moveTo: { x: x + dx, y: y + dy },
    width: width * scale,
    height: height * scale,
    top: top * scale,
    right: right * scale,
    scale,
    visible: !visibleAfterMove,
    visibleAfterMove,
    locked: false,
  };
  state.lastActiveElement = id;
}
