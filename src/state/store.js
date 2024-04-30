import { create } from "zustand";
import { current, produce } from "immer";
import { leftToolbarWidth } from "../components/LeftToolbar";
import { clearSelected, elementBox, newId, numberBetween } from "../util";
import { topToolbarHeight } from "../components/TopToolbar";
import { maxOffset } from "../components/Scrolls";
import { freeDrawingSlice } from "./freeDrawingSlice";
import { historySlice, pushHistory } from "./historySlice";
import { defaultMinMax, nlHeight, nlWidth } from "../components/NumberLine";

export const gridStep = 60;
export const boardSize = {
  width: 2460,
  height: 1660,
};

export const useAppStore = create((set) => ({
  ...freeDrawingSlice(set),
  ...historySlice(set),
  imagesReady: false,
  loadedImagesCount: 0,
  offset: { x: 0, y: 0 },
  scale: 1.0,
  fullscreen: false,
  workspace: "Integers",
  width: 0,
  height: 0,
  origin: { x: 0, y: 0 },
  selected: [],
  lockSelect: false,
  showLabels: true,

  // fullscreen: true,
  // workspace: "Fractions",
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
  elements: initElements(),
  lastActiveElement: null,
  setValue: (field, value) =>
    set(
      produce((state) => {
        state[field] = value;
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
        removeElements(state);
        for (let id in current(state.elements)) {
          const type = state.elements[id].type;
          if (type == "number-line") {
            const line = state.elements[id];
            const { min, max, denominator } = defaultMinMax(workspace);
            line.min = min;
            line.max = max;
            line.denominator = denominator;
          }
        }
        state.lastActiveElement = null;
        clearSelected(state);
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
        for (const id of state.selected) {
          const element = state.elements[id];
          if (!element) continue;
          element.x += dx;
          element.y += dy;
          state.lastActiveElement = id;
        }
        pushHistory(state);
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

  updateElement: (id, attrs, doPush = true) =>
    set(
      produce((state) => {
        const element = state.elements[id];
        if (attrs.width == 0 && [ "straight-arrow", "rect-shape"].includes(element.type) ) {
            delete state.elements[id];
        } else {
          for (const key in attrs) {
            element[key] = attrs[key];
          }
          state.lastActiveElement = id;
        }
        if (doPush) pushHistory(state);
      })
    ),

  setMinMax: (id, field, value, doPush = true) =>
    set(
      produce((state) => {
        state.elements[id][field] = value;
        removeElements(state);
        if (doPush) pushHistory(state);
      })
    ),
  removeElements: () =>
    set(
      produce((state) => {
        removeElements(state);
        clearSelected(state);
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
  keyDown: (key) =>
    set(
      produce((state) => {
        const { selected, elements, lastActiveElement, workspace } = state;
        const selectedTarget = selected.length == 1 && elements[selected[0]];
        const activeTarget = selected.length == 0 && lastActiveElement && elements[lastActiveElement];
        const target = selectedTarget || activeTarget;
        if (workspace != "Open" || !target || target.text === undefined ) return;
        const text = "" + target.text;
        if (key == "Backspace") {
          target.text = text.substring(0, text.length - 1);
        } else if (key == "Delete") {
          target.text = "";
        } else if (key.match(/^[0-9\.\-]$/) && text.length < 4) {
          target.text = text + key;
        }
      })
    ),
  action: () => set(produce((state) => {})),
}));

function keepOrigin(state) {
  state.origin.x = ((state.width - leftToolbarWidth) / 2 + leftToolbarWidth) / state.scale;
  state.origin.y = state.height / 2 / state.scale;
}

function removeElements(state) {
  const deleteTypes = ["arrow", "straight-arrow", "rect-shape", "marker", "open-marker"];
  for (const id in current(state.elements)) {
    const type = state.elements[id].type;
    if (deleteTypes.includes(type)) {
      delete state.elements[id];
    }
  }
}

export function initElements() {
  const id = "default-line";
  return {
    [id]: {
      id,
      type: "number-line",
      x: 0 - nlWidth / 2,
      y: 0 - nlHeight / 2,
      width: nlWidth,
      height: nlHeight,
      ...defaultMinMax("Integers"),
      // ...defaultMinMax("Fractions"),
    },
  };
}
