import { create } from "zustand";
import { current, produce } from "immer";
import { getColor, leftToolbarWidth } from "../components/LeftToolbar";
import { arrayChunk, clearSelected, elementBox, newId, numberBetween } from "../util";
import { topToolbarHeight } from "../components/TopToolbar";
import { maxOffset } from "../components/Scrolls";
import { freeDrawingSlice } from "./freeDrawingSlice";
import { historySlice, pushHistory } from "./historySlice";
import { createTenDisks, breakRegroupSlice, disksByValue, avgPos } from "./breakRegroup";
import { menuHeight } from "../components/Menu";
import { diskInBreakColumn, diskInRegroupColumn, diskInWrongColumn, getSubtractors } from "../components/PlaceValue";

export const gridStep = 60;
export const boardSize = {
  width: 2460,
  height: 1660,
};

export const useAppStore = create((set) => ({
  ...freeDrawingSlice(set),
  ...historySlice(set),
  ...breakRegroupSlice(set),
  mode: "Whole Numbers",
  imagesReady: false,
  loadedImagesCount: 0,
  offset: { x: 0, y: 0 },
  scale: 1.0,
  fullscreen: false,
  workspace: "Basic",
  width: 0,
  height: 0,
  origin: { x: 0, y: 0 },
  selected: [],
  lockSelect: false,
  minValueDropdown: false,
  maxValueDropdown: false,
  minValue: 1,
  maxValue: 1_000_000,

  subtractorCounts: {
    1_000_000: 0,
    100_000: 0,
    10_000: 0,
    1000: 0,
    100: 0,
    10: 0,
    1: 0,
    0.1: 0,
    0.01: 0,
    0.001: 0,
  },

  // fullscreen: true,
  // workspace: "Place Value",

  setMode: (value) =>
    set(
      produce((state) => {
        state.mode = value;
        if (value == "Whole Numbers") {
          state.minValue = 1;
          state.maxValue = 1_000_000;
        }
        if (value == "Decimals") {
          state.minValue = 0.001;
          state.maxValue = 10;
        }
        state.minValueDropdown = false;
        state.maxValueDropdown = false;
        removeOutrangeDisks(state);
        clearSelected(state);
        pushHistory(state);
      })
    ),
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
      })
    ),
  selectMinMax: (field, value) =>
    set(
      produce((state) => {
        state[field] = value;
        state.minValueDropdown = false;
        state.maxValueDropdown = false;
        removeOutrangeDisks(state);
        pushHistory(state);
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
        if (["Place Value", "Subtraction"].includes(workspace)) {
          for (const id in current(state.elements)) {
            if (diskInWrongColumn(state, state.elements[id])) {
              delete state.elements[id];
            }
          }
        }
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
        state.subtractorCounts = {
          1_000_000: 0,
          100_000: 0,
          10_000: 0,
          1000: 0,
          100: 0,
          10: 0,
          1: 0,
          0.1: 0,
          0.01: 0,
          0.001: 0,
        };
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
      return { ...state, selected, minValueDropdown: false, maxValueDropdown: false, lockSelect: false };
    }),

  selectIds: (ids, lockSelect) => set((state) => ({ ...state, selected: ids, lockSelect })),

  relocateSelected: (dx, dy) =>
    set(
      produce((state) => {
        const toMoved = (disk) => ({ ...disk, x: disk.x + dx, y: disk.y + dy });
        // regroup
        const regrouped = [];
        const entries = Object.entries(
          disksByValue(current(state), (disk) => diskInRegroupColumn(state, toMoved(disk)))
        );
        for (const [value, list] of entries) {
          for (const chunk of arrayChunk(list, 10)) {
            if (chunk.length < 10) continue;
            const id = newId();
            const { x, y } = avgPos(chunk, dx, dy);
            state.elements[id] = {
              id,
              type: "disk",
              x,
              y,
              color: getColor(value * 10),
              value: value * 10,
              visible: false,
              visibleAfterMove: true,
              locked: false,
            };
            for (const { id } of chunk) {
              const disk = state.elements[id];
              disk.moveFrom = { x: disk.x + dx, y: disk.y + dy };
              disk.x = x;
              disk.y = y;
              disk.deleteAfterMove = true;
              disk.ignoreSum = true;
              regrouped.push(disk.id);
            }
            state.animation = true;
          }
        }
        // end regroup
        for (const id of state.selected) {
          const element = state.elements[id];
          if (!element || regrouped.includes(element.id)) continue;
          const nextPosition = { ...current(element), x: element.x + dx, y: element.y + dy };
          if (diskInWrongColumn(state, nextPosition)) {
            if (diskInBreakColumn(current(state), nextPosition)) {
              createTenDisks(state, nextPosition);
              delete state.elements[id];
            } else {
              element.moveFrom = { x: element.x + dx, y: element.y + dy };
              state.animation = true;
            }
          } else {
            element.x += dx;
            element.y += dy;
            state.lastActiveElement = id;
          }
        }
        if (state.animation) {
          clearSelected(state);
          state.lastActiveElement = null;
        }
        pushHistory(state);
      })
    ),

  relocateElement: (id, dx, dy) =>
    set(
      produce((state) => {
        const element = state.elements[id];
        if (!element) return;
        const nextPosition = { ...current(element), x: element.x + dx, y: element.y + dy };
        if (diskInWrongColumn(state, nextPosition)) {
          if (diskInBreakColumn(current(state), nextPosition)) {
            createTenDisks(state, nextPosition);
            delete state.elements[id];
          } else {
            element.moveFrom = { x: element.x + dx, y: element.y + dy };
            state.animation = true;
          }
        } else {
          element.x += dx;
          element.y += dy;
          state.lastActiveElement = id;
          pushHistory(state);
        }
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
        const curr = current(state);
        if (diskInWrongColumn(curr, element)) {
          if (diskInBreakColumn(curr, element)) {
            createTenDisks(state, element);
          }
        } else {
          const id = newId();
          state.elements[id] = { ...element, id, locked: false };
          state.lastActiveElement = id;
        }
        clearSelected(state);
        state.fdMode = null;
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
  subtract: (ids) =>
    set(
      produce((state) => {
        for (const id of ids) {
          const disk = state.elements[id];
          const { x, y, width, height } = getSubtractors(current(state))[disk.value];
          disk.x = x + width / 2;
          disk.y = y + height / 2;
          disk.shrink = true;
          disk.deleteAfterMove = true;
          state.animation = true;
          state.subtractorCounts[disk.value] += 1;
        }
      })
    ),
  action: () => set(produce((state) => {})),
}));

function keepOrigin(state) {
  state.origin.x = ((state.width - leftToolbarWidth) / 2 + leftToolbarWidth) / state.scale;
  state.origin.y = ((state.height - menuHeight) / 2 + menuHeight) / state.scale;
}

function removeOutrangeDisks(state) {
  for (const [id, element] of Object.entries(current(state.elements))) {
    if (element.type != "disk") continue;
    if (element.value > state.maxValue) {
      delete state.elements[id];
    }
    if (element.value < state.minValue) {
      delete state.elements[id];
    }
  }
}
