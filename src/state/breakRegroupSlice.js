import { current, produce } from "immer";
import { arrayChunk, avg, clearSelected, cos, halfPixel, newId, sin } from "../util";
import { pushHistory } from "./historySlice";
import config from "../config";
import { getSizes } from "../components/Block";

const { animationDuration } = config;

export const breakRegroupSlice = (set) => ({
  finishDelay: null,
  finishAnimations: () =>
    set(
      produce((state) => {
        let doPush = false;
        for (const id in current(state.elements)) {
          const element = state.elements[id];
          if (element.moveTo) {
            element.x = element.moveTo.x;
            element.y = element.moveTo.y;
            element.moveTo = null;
            doPush = true;
          }
          if (element.deleteAfterMove) {
            delete state.elements[id];
            doPush = true;
          }
          if (element.visibleAfterMove) {
            state.elements[id].visibleAfterMove = null;
            state.elements[id].visible = true;
            doPush = true;
          }
        }
        state.finishDelay = null;
        clearSelected(state);
        if (doPush) pushHistory(state);
      })
    ),
  breakSelected: () =>
    set(
      produce((state) => {
        let id;
        while ((id = state.selected.pop())) {
          breakBlock(state, state.elements[id]);
          delete state.elements[id];
        }
        state.lastActiveElement = null;
        state.finishDelay = animationDuration;
      })
    ),
  breakPlaced: (block) =>
    set(
      produce((state) => {
        breakBlock(state, block);
      })
    ),
  relocateAndBreak: (id, dx, dy) =>
    set(
      produce((state) => {
        const block = state.elements[id];
        if (!block) return;
        block.x += dx;
        block.y += dy;
        if (block.label == 1) {
          return;
        } else if (block.label == 10) {
          createBlocks1(state, block);
        } else if (block.label == 100) {
          createBlocks10(state, block);
        } else if (block.label == 1000) {
          createBlocks100(state, block);
        }
        delete state.elements[id];
        state.lastActiveElement = null;
        state.finishDelay = animationDuration;
      })
    ),
  regroupSelected: () =>
    set(
      produce((state) => {
        const { scale, depthStepX, depthStepY } = getSizes(state);
        const entries = Object.entries(blocksByValue(current(state)));
        for (const [label, list] of entries) {
          for (const chunk of arrayChunk(list, 10)) {
            if (chunk.length < 10) continue;
            const { x, y } = avgPos(chunk, label, scale);
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

export function blocksByValue(state, filter) {
  const { elements, selected } = state;
  let blocks = Object.values(elements).filter((e) => e.type == "block" && e.label != 1000 && selected.includes(e.id));
  if (filter) {
    blocks = blocks.filter(filter);
  }
  return Object.groupBy(blocks, (e) => e.label);
}

export function regroupPossible(state) {
  return Object.values(blocksByValue(state)).some((arr) => arr.length >= 10);
}

export function avgPos(blocks, label, scale) {
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
  const { scale } = getSizes(state);
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
  const { scale } = getSizes(state);
  for (let i = 0; i < 10; i += 1) {
    const sign = i % 2 == 0 ? -1 : 1;
    createBlock(state, 10, x + i * scale, y, -(scale / 2) * sign, 5.5 * scale * sign);
  }
}

function createBlocks100(state, { x, y }) {
  const { scale, depthStepX, depthStepY } = getSizes(state);
  for (let i = 0; i < 10; i += 1) {
    const sign = i < 5 == 0 ? 1 : -1;
    createBlock(state, 100, x + i * depthStepX, y - i * depthStepY, -2.5 * depthStepX * sign, -5.5 * scale * sign);
  }
}

export function createBlock(state, label, x, y, dx, dy, visibleAfterMove = false) {
  const { scale } = getSizes(state);
  const id = newId();
  const props = config.block.options[label];
  const { width, height, top, right } = props;
  state.elements[id] = {
    ...props,
    id,
    type: "block",
    x: halfPixel(x),
    y: halfPixel(y),
    moveTo: { x: halfPixel(x + dx), y: halfPixel(y + dy) },
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

export function breakBlock(state, block) {
  if (block.label == 1) {
    return;
  } else if (block.label == 10) {
    createBlocks1(state, block);
  } else if (block.label == 100) {
    createBlocks10(state, block);
  } else if (block.label == 1000) {
    createBlocks100(state, block);
  }
  state.lastActiveElement = null;
  state.finishDelay = animationDuration;
}
