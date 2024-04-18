import { current, produce } from "immer";
import { clearSelected, cos, newId, sin } from "../util";
import { pushHistory } from "./historySlice";
import config from "../config";

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
          // if (element.delete) {
          //   delete state.elements[id];
          // }
          // if (element.invert) {
          //   if (state.workspace == workspace.solving && boxesIntersect(element, solvingRectProps(state))) {
          //     element.x = -element.x - element.width;
          //   }
          //   element.text = invertText(element.text);
          //   delete element.invert;
          // }
          // if (element.rotate) {
          //   const { x, y, width, height } = element;
          //   element.width = height;
          //   element.height = width;
          //   element.x = x + width / 2 - height / 2;
          //   element.y = y + height / 2 - width / 2;
          //   delete element.rotate;
          // }
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
          const target = state.elements[id];
          if (target.label == 10) {
            createBlocks1(state, target);
          } else if (target.label == 100) {
            createBlocks10(state, target);
          } else if (target.label == 1000) {
            createBlocks100(state, target);
          }
          delete state.elements[id];
        }
        state.lastActiveElement = null;
        state.finishDelay = config.animationDuration;
      })
    ),
});

function createBlocks1(state, { x, y }) {
  const scale = config.block.size;
  for (let i = 0; i < 10; i += 1) {
    const sign = i % 2 == 0 ? -1 : 1;
    createBlock(state, 1, x, y + i * scale, scale * sign, -(scale / 2) * sign);
  }
}

function createBlocks10(state, { x, y }) {
  const scale = config.block.size;
  for (let i = 0; i < 10; i += 1) {
    const sign = i % 2 == 0 ? -1 : 1;
    createBlock(state, 10, x + i * scale, y, -(scale / 2) * sign, 5.5 * scale * sign);
  }
}

function createBlocks100(state, { x, y }) {
  const { size, depthScale, angle } = config.block;
  const scale = size;
  const depthStepX = cos(angle) * scale * depthScale;
  const depthStepY = sin(angle) * scale * depthScale;
  for (let i = 0; i < 10; i += 1) {
    const sign = i < 5 == 0 ? 1 : -1;
    createBlock(state, 100, x + i * depthStepX, y - i * depthStepY, -2.5 * depthStepX * sign, -5.5 * scale * sign);
  }
}

function createBlock(state, label, x, y, dx, dy) {
  const scale = config.block.size;
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
  };
  state.lastActiveElement = id;
}
