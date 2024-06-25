import { create } from "zustand";
import { current, produce } from "immer";
import { leftToolbarWidth } from "../components/LeftToolbar";
import { clearSelected, combineBoxList, elementBox, newId, numberBetween, rotateVector, setNewId, sin } from "../util";
import { topToolbarHeight } from "../components/TopToolbar";
import { maxOffset } from "../components/Scrolls";
import { freeDrawingSlice } from "./freeDrawingSlice";
import { historySlice, pushHistory } from "./historySlice";
import { colorOptions } from "../components/TextElement";

export const gridStep = 60;
export const cubeSize = 80;
export const cubeShift = (cubeSize - gridStep) / 2;
export const boardSize = {
  width: 2460,
  height: 1660,
};

const mode = "linking-cubes";

export const useAppStore = create((set) => ({
  ...freeDrawingSlice(set),
  ...historySlice(set),
  imagesReady: false,
  loadedImagesCount: 0,
  offset: { x: 0, y: 0 },
  scale: 1.0,
  fullscreen: false,
  grid: [],
  lineGrid: [],
  width: 0,
  height: 0,
  origin: { x: 0, y: 0 },
  selected: [],
  lockSelect: false,
  colorMenuVisible: false,
  setColor: (colorIndex) =>
    set(
      produce((state) => {
        const { fill, stroke } = colorOptions[colorIndex];
        current(state.selected).forEach((id) => {
          const element = state.elements[id];
          if (element.type == "text") {
            element.color = fill;
          }
        });
      })
    ),

  // offset: { x: 80, y: -200 },
  // scale: 0.5,
  // fullscreen: true,

  fill: false,
  showGroups: true,
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
        state.grid = initGrid(workspace);
      })
    ),
  toggle: (field) =>
    set(
      produce((state) => {
        state.field = !state.field;
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

  clearSelect: () => set((state) => ({ ...state, selected: [], lockSelect: false, colorMenuVisible: false })),

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
      return { ...state, selected, lockSelect: false, colorMenuVisible: false };
    }),

  selectIds: (ids, lockSelect) => set((state) => ({ ...state, selected: ids, lockSelect, colorMenuVisible: false })),

  relocateSelected: (dx, dy) =>
    set(
      produce((state) => {
        for (const id of state.selected) {
          const element = state.elements[id];
          if (!element) continue;
          element.x += dx;
          element.y += dy;
          if (element.type == "template") {
            for (const i in current(state).elements[id].patterns) {
              const pattern = element.patterns[i];
              pattern.x += dx;
              pattern.y += dy;
            }
          }
          if (element.type == "rekenrek") {
            for (const i in current(state).elements[id].beads) {
              element.beads[i] += dx;
            }
          }
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
        if (element.type == "template") {
          for (const i in current(state).elements[id].patterns) {
            const pattern = element.patterns[i];
            pattern.x += dx;
            pattern.y += dy;
          }
        }
        if (element.type == "rekenrek") {
          for (const i in current(state).elements[id].beads) {
            element.beads[i] += dx;
          }
        }
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
        for (const key in attrs) {
          state.elements[id][key] = attrs[key];
        }
        if (doPush) pushHistory(state);
      })
    ),

  updateBeads: (id, beads) =>
    set(
      produce((state) => {
        const stateBeads = state.elements[id].beads;
        for (const i in beads) {
          stateBeads[i] = beads[i];
        }
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
  rotateSelected: () =>
    set(
      produce((state) => {
        for (const id of current(state).selected) {
          const el = state.elements[id];
          if (!el || el.type != "rod") {
            continue;
          }
          const { x, y, width, height } = el;
          el.width = height;
          el.height = width;
          el.x += width / 2 - height / 2;
          el.y += height / 2 - width / 2;
        }
        pushHistory(state);
      })
    ),
  copySelected: () =>
    set(
      produce((state) => {
        const shift = state.mode == "rods" ? gridStep * 0.5 : 20;
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

  convertPatternsToTemplate: () =>
    set(
      produce((state) => {
        const curr = current(state);
        const patterns = Object.values(curr.elements)
          .filter((e) => curr.selected.includes(e.id) && e.type == "pattern")
          .map((p) => ({ ...p }));
        for (const element of patterns) {
          delete state.elements[element.id];
        }
        const id = newId();
        const box = combineBoxList(patterns);
        state.elements[id] = {
          ...box,
          id,
          type: "template",
          locked: true,
          patterns,
        };
        clearSelected(state);
        pushHistory(state);
      })
    ),
  addElement: (element) =>
    set(
      produce((state) => {
        const id = newId();
        if (element.x == undefined && element.y == undefined && element.type == "cube") {
          state.elements[id] = { ...element, id, locked: false, ...getNextElementPosition(state, element) };
        } else {
          state.elements[id] = { ...element, id, locked: false };
        }
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
  saveState: (onSave) =>
    set(
      produce((state) => {
        const curr = { ...current(state), elements: { ...current(state).elements } };
        curr.historyIndex = 0;
        curr.history = [{ elements: {}, fdLines: {} }];
        delete curr.width;
        delete curr.height;
        curr.newId = +newId().split("-")[1];
        for (const id in curr.elements) {
          const element = curr.elements[id];
          if (element.type == "cube") {
            curr.elements[id] = {
              ...element,
              image: element.image.id,
            };
          }
        }
        onSave(JSON.stringify(curr));
      })
    ),
  loadState: (initialState) =>
    set((state) => {
      const { elements, fdLines } = initialState;
      for (const id in elements) {
        const element = elements[id];
        if (element.type == "cube") {
          elements[id] = {
            ...element,
            image: document.getElementById(element.image),
          };
        }
      }
      setNewId(initialState.newId);
      return { ...initialState, imagesReady: state.imagesReady };
    }),
  action: () => set(produce((state) => {})),
}));

function keepOrigin(state) {
  state.origin.x = ((state.width - leftToolbarWidth) / 2 + leftToolbarWidth) / state.scale;
  state.origin.y = state.height / 2 / state.scale;
}

function initGrid(workspace) {
  const grid = [];
  if (workspace == "circular") {
    const rings = [1, 4, 12, 24, 36];
    let r = 0;
    for (const n of rings) {
      let theta = 0;
      for (let i = 0; i < n; i += 1) {
        theta += (Math.PI * 2) / n;
        grid.push({ x: Math.cos(theta) * r, y: Math.sin(theta) * r });
      }
      r += gridStep * 1.3;
    }
    return grid;
  }
  const { width, height } = boardSize;
  const stepX = gridStep;
  const stepY = workspace == "square" ? gridStep : gridStep * Math.sin(Math.PI / 3);
  const xStop = Math.ceil(width / 2 / stepX) * stepX + gridStep;
  const xStart = -xStop;
  const yStop = Math.ceil(height / 2 / stepX) * stepX;
  const yStart = -yStop - gridStep;
  for (let y = yStart, i = 0; y <= yStop; y += stepY, i += 1) {
    for (let x = xStart; x <= xStop; x += stepX) {
      if (workspace == "square") {
        grid.push({ x, y });
      } else {
        grid.push({ x: x + Math.cos(Math.PI / 3) * gridStep * (i % 2), y: y });
      }
    }
  }
  return grid;
}

function getNextElementPosition(state, element) {
  if (state.lastActiveElement == null) {
    return { x: 0, y: 0 };
  }
  const last = state.elements[state.lastActiveElement];
  if (last.rotation == 0) {
    return { x: last.x, y: last.y - 47 };
  } else {
    return { x: last.x + 47, y: last.y };
  }
}
