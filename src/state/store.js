import { create } from "zustand";
import { current, produce } from "immer";
import { arrayChunk, clearSelected, elementBox, newId, numberBetween } from "../util";
import { topToolbarHeight } from "../components/TopToolbar";
import { maxOffset } from "../components/Scrolls";
import { freeDrawingSlice } from "./freeDrawingSlice";
import { historySlice, pushHistory } from "./historySlice";
import config from "../config";
import { avgPos, blocksByValue, breakBlock, breakRegroupSlice, createBlock } from "./breakRegroupSlice";
import { elementInBreakColumn, elementInRegroupColumn, elementInWrongColumn } from "../components/PlaceValue";
import { getSizes } from "../components/Block";

export const gridStep = 60;
export const boardSize = {
  width: 2460,
  height: 1660,
};

export const useAppStore = create((set) => ({
  ...freeDrawingSlice(set),
  ...historySlice(set),
  ...breakRegroupSlice(set),
  imagesReady: false,
  loadedImagesCount: 0,
  offset: { x: 0, y: 0 },
  scale: 1.0,
  fullscreen: false,
  workspace: config.workspace.basic,
  numberSet: config.numberSet.whole,
  blockSet: config.blockSet.cubes,
  width: 0,
  height: 0,
  origin: { x: 0, y: 0 },
  selected: [],
  lockSelect: false,
  showLabels: false,
  showSummary: true,
  multiColored: true,

  // fullscreen: true,
  workspace: config.workspace.addition,

  toggleGlobal: (field) =>
    set(
      produce((state) => {
        const value = !state[field];
        state[field] = value;
        for (const id in current(state).elements) {
          state.elements[id][field] = value;
        }
      })
    ),
  elements: {},
  lastActiveElement: null,
  setValue: (field, value) =>
    set(
      produce((state) => {
        state[field] = value;
        const elements = state.elements;
        const { cubes, rods } = config.blockSet;
        if (field == "blockSet") {
          const toDelete = (block) => (block.label == 100 && value == rods) || (block.label == 1000 && value != cubes);
          for (const id in current(elements)) {
            if (elements[id].type == "block" && toDelete(elements[id])) {
              delete elements[id];
            }
          }
        }
      })
    ),
  setSize: () =>
    set(
      produce((state) => {
        if (state.fullscreen) {
          state.width = window.innerWidth;
          state.height = window.innerHeight - topToolbarHeight;
        } else {
          const root = document.querySelector("#manipulative-canvas-root");
          state.width = root.offsetWidth;
          state.height = root.offsetHeight - topToolbarHeight;
        }
        keepOrigin(state);
      })
    ),
  setWorkspace: (workspace) =>
    set(
      produce((state) => {
        state.workspace = workspace;
        state.offset.x = 0;
        state.offset.y = 0;
        state.scale = 1.0;
        keepOrigin(state);
        clearSelected(state);
        for (const id in state.elements) {
          if (state.elements[id].type == "block") {
            delete state.elements[id];
          }
        }
        state.blockSet = workspace == config.workspace.factors ? config.blockSet.flats : config.blockSet.cubes;
        pushHistory(state);
      })
    ),
  toggle: (field) =>
    set(
      produce((state) => {
        state[field] = !state[field];
      })
    ),

  toggleFullscreen: () =>
    set(
      produce((state) => {
        if (state.fullscreen) {
          const root = document.querySelector("#manipulative-canvas-root");
          state.width = root.offsetWidth;
          state.height = root.offsetHeight - topToolbarHeight;
          state.fullscreen = false;
        } else {
          state.width = window.innerWidth;
          state.height = window.innerHeight - topToolbarHeight;
          state.fullscreen = true;
        }
        keepOrigin(state);
      })
    ),

  clear: () =>
    set(
      produce((state) => {
        const curr = current(state);
        for (const id in curr.elements) {
          delete state.elements[id];
        }
        clearSelected(state);
        state.lastActiveElement = null;
        document.getElementById("editable-text")?.remove();
        pushHistory(state);
      })
    ),

  setScale: (scale) =>
    set(
      produce((state) => {
        if (scale > 0.4 && scale < 2) {
          state.scale = scale;
          keepOrigin(state);
        }
      })
    ),

  setOffsetX: (offset) =>
    set(
      produce((state) => {
        state.offset.x = offset < -maxOffset ? -maxOffset : offset > maxOffset ? maxOffset : offset;
      })
    ),

  setOffsetY: (offset) =>
    set(
      produce((state) => {
        state.offset.y = offset < -maxOffset ? -maxOffset : offset > maxOffset ? maxOffset : offset;
      })
    ),

  clearSelect: () => set((state) => ({ ...state, selected: [], lockSelect: false })),

  select: (downPos, upPos) =>
    set((state) => {
      const selected = [];
      const boxInRect = ({ x, y, width, height }) => {
        return (
          (numberBetween(x, downPos.x, upPos.x) ||
            numberBetween(x + width, downPos.x, upPos.x) ||
            numberBetween(downPos.x, x, x + width) ||
            numberBetween(upPos.x, x, x + width)) &&
          (numberBetween(y, downPos.y, upPos.y) ||
            numberBetween(y + height, downPos.y, upPos.y) ||
            numberBetween(downPos.y, y, y + height) ||
            numberBetween(upPos.y, y, y + height))
        );
      };

      Object.keys(state.elements).map((key) => {
        const element = state.elements[key];
        if (element) {
          const { id, locked } = element;
          if (!locked && boxInRect(elementBox(element))) {
            selected.push(id);
          }
        }
      });
      return { ...state, selected, lockSelect: false };
    }),

  selectIds: (ids, lockSelect) => set((state) => ({ ...state, selected: ids, lockSelect })),

  relocateSelected: (dx, dy) =>
    set(
      produce((state) => {
        let haveAnimation = false;
        // regroup
        const regrouped = [];
        const toMoved = (block) => ({ ...block, x: block.x + dx, y: block.y + dy });
        const { scale, depthStepX, depthStepY } = getSizes(state);
        const curState = current(state);
        const entries = Object.entries(blocksByValue(curState, (e) => elementInRegroupColumn(curState, toMoved(e))));
        for (const [label, list] of entries) {
          for (const chunk of arrayChunk(list, 10)) {
            if (chunk.length < 10) continue;
            haveAnimation = true;
            state.finishDelay = config.animationDuration;
            const { x, y } = avgPos(chunk, label, scale);
            createBlock(state, label * 10, x, y, dx, dy, true);
            chunk.forEach(({ id }, i) => {
              const block = state.elements[id];
              block.x += dx;
              block.y += dy;
              if (label == 1) block.moveTo = { x: x + dx, y: y + dy + scale * i };
              if (label == 10) block.moveTo = { x: x + dx + scale * i, y: y + dy };
              if (label == 100) block.moveTo = { x: x + dx + depthStepX * i, y: y + dy - depthStepY * i };
              block.deleteAfterMove = true;
              regrouped.push(id);
            });
          }
        }
        // end regroup

        for (const id of state.selected) {
          const element = state.elements[id];
          if (!element || regrouped.includes(element.id)) continue;
          element.x += dx;
          element.y += dy;
          if (elementInBreakColumn(state, element)) {
            breakBlock(state, element);
            delete state.elements[id];
            haveAnimation = true;
          } else if (elementInWrongColumn(state, element)) {
            element.x -= dx;
            element.y -= dy;
            cancelMove(state, id, dx, dy);
            haveAnimation = true;
          }
          state.lastActiveElement = id;
        }
        if (haveAnimation) {
          clearSelected(state);
        } else {
          pushHistory(state);
        }
      })
    ),

  relocateElement: (id, dx, dy) =>
    set(
      produce((state) => {
        const element = state.elements[id];
        if (!element) return;
        element.x += dx;
        element.y += dy;
        state.lastActiveElement = id;
        pushHistory(state);
      })
    ),
  relocateElements: (ids, dx, dy) =>
    set(
      produce((state) => {
        for (const id of ids) {
          state.elements[id].x += dx;
          state.elements[id].y += dy;
          state.lastActiveElement = id;
        }
        pushHistory(state);
      })
    ),

  rotateBlock10: (id) =>
    set(
      produce((state) => {
        const element = state.elements[id];
        const size = element.size;
        const { width, height } = current(element);
        size[0] = size[0] == 1 ? 10 : 1;
        size[1] = size[1] == 1 ? 10 : 1;
        element.width = height;
        element.height = width;
      })
    ),

  updateElement: (id, attrs, doPush = true) =>
    set(
      produce((state) => {
        for (const key in attrs) {
          state.elements[id][key] = attrs[key];
        }
        if (doPush) pushHistory(state);
      })
    ),

  deleteSelected: () =>
    set(
      produce((state) => {
        let id;
        while ((id = state.selected.pop())) {
          delete state.elements[id];
        }
        state.lastActiveElement = null;
        pushHistory(state);
      })
    ),
  toggleValueSelected: (field) =>
    set(
      produce((state) => {
        for (const id of current(state).selected) {
          const element = state.elements[id];
          if (element && element[field] !== undefined) {
            element[field] = !element[field];
          }
        }
        pushHistory(state);
      })
    ),
  copySelected: () =>
    set(
      produce((state) => {
        const shift = 20;
        const { elements } = current(state);
        for (const id of state.selected) {
          const element = elements[id];
          if (element) {
            const copy = { ...elements[id], id: newId() };
            state.elements[copy.id] = copy;
            if (element.type == "text" && state.selected.length == 1) {
              state.elements[id].y += element.height;
            } else {
              state.elements[id].x += shift;
              state.elements[id].y += shift;
            }
          }
        }

        pushHistory(state);
      })
    ),
  lockSelected: (value) =>
    set(
      produce((state) => {
        let id;
        while ((id = state.selected.pop())) {
          const element = state.elements[id];
          if (element) {
            element.locked = value;
          }
        }
        pushHistory(state);
      })
    ),

  addElement: (element) =>
    set(
      produce((state) => {
        const id = newId();
        state.elements[id] = { ...element, id, locked: false };
        state.fdMode = null;
        state.lastActiveElement = id;
        clearSelected(state);
        pushHistory(state);
      })
    ),

  addElements: (elements) =>
    set(
      produce((state) => {
        for (const element of elements) {
          const id = newId();
          state.elements[id] = { ...element, id, locked: false };
          state.lastActiveElement = id;
        }
        state.fdMode = null;
        clearSelected(state);
        pushHistory(state);
      })
    ),

  cancelMove: (id, dx, dy) =>
    set(
      produce((state) => {
        cancelMove(state, id, dx, dy);
      })
    ),
  action: () => set(produce((state) => {})),
}));

function keepOrigin(state) {
  const menuHeight = config.menu.height;
  const width = config.leftToolbar.width;
  state.origin.x = ((state.width - width) / 2 + width) / state.scale;
  state.origin.y = ((state.height - menuHeight) / 2 + menuHeight) / state.scale;
}

function cancelMove(state, id, dx, dy) {
  const block = state.elements[id];
  block.moveTo = { x: block.x, y: block.y };
  block.x += dx;
  block.y += dy;
  state.finishDelay = config.animationDuration;
}
