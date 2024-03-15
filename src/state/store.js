import { create } from "zustand";
import { current, produce } from "immer";
import { leftToolbarWidth } from "../components/LeftToolbar";
import { clearSelected, elementBox, newId, numberBetween } from "../util";
import { bottomToolbarHeight } from "../components/BottomToolbar";
import { maxOffset } from "../components/Scrolls";
import { freeDrawingSlice } from "./freeDrawingSlice";
import { historySlice, pushHistory } from "./historySlice";

export const gridStep = 60;
export const cubeSize = 80;
export const cubeShift = (cubeSize - gridStep) / 2;
export const boardSize = {
  width: 2460,
  height: 1660,
};

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const mode =
  urlParams.get("mode").replace("cuisenaire-rods", "rods").replace("fraction-circle", "fractions") ?? "geoboard";

export const useAppStore = create((set) => ({
  ...freeDrawingSlice(set),
  ...historySlice(set),
  mode,
  imagesReady: false,
  loadedImagesCount: 0,
  offset: { x: 0, y: 0 },
  scale: 1.0,
  // offset: { x: 50, y: 100 },
  // scale: 0.7,
  // fullscreen: true,
  fullscreen: false,
  workspace: "square",
  grid: mode == "geoboard" ? initGrid("square") : [],
  lineGrid: mode == "rods" ? initLineGrid() : [],
  width: 0,
  height: 0,
  origin: { x: 0, y: 0 },
  selected: [],
  lockSelect: false,

  fill: mode != "geoboard",
  measures: false,
  showLineGrid: mode == "rods",
  toggleGlobal: (field) =>
    set(
      produce((state) => {
        const value = !state[field];
        state[field] = value;
        state.geoboardBands.forEach((band) => {
          band[field] = value;
        });
        for (const id in current(state).elements) {
          state.elements[id][field] = value;
        }
      })
    ),
  geoboardBands: [],
  elements: {},
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
          state.height = window.innerHeight - bottomToolbarHeight;
        } else {
          const root = document.querySelector("#manipulative-canvas-root");
          state.width = root.offsetWidth;
          state.height = root.offsetHeight - bottomToolbarHeight;
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
          state.height = root.offsetHeight - bottomToolbarHeight;
          state.fullscreen = false;
        } else {
          state.width = window.innerWidth;
          state.height = window.innerHeight - bottomToolbarHeight;
          state.fullscreen = true;
        }
        keepOrigin(state);
      })
    ),

  relocateBandPoint: (dragTarget, upPos) =>
    set(
      produce((state) => {
        state.geoboardBands = state.geoboardBands.map((band) => {
          if (band.id != dragTarget.band.id) return band;
          return {
            ...band,
            points: band.points.map((p) => {
              if (p.id != dragTarget.band.points[dragTarget.pointIndex].id) return p;
              return { ...p, ...upPos };
            }),
          };
        });
        pushHistory(state);
      })
    ),

  relocateBandSide: (dragTarget, upPos) =>
    set(
      produce((state) => {
        const { x, y } = upPos;
        const { band, sideIndex } = dragTarget;
        const points = band.points;
        const before = points.slice(0, sideIndex + 1);
        const after = points.slice(sideIndex + 1);
        state.geoboardBands = state.geoboardBands.map((band) => {
          if (band.id != dragTarget.band.id) return band;
          return {
            ...band,
            points: [...before, { id: newId(), x, y }, ...after],
          };
        });
        pushHistory(state);
      })
    ),

  addBand: (x, y, color) =>
    set(
      produce((state) => {
        const id = newId();
        state.geoboardBands.push({
          id,
          color,
          fill: state.fill,
          measures: state.measures,
          points: [
            { id: newId(), x: x, y: y, locked: false },
            { id: newId(), x: x + gridStep, y: y, locked: false },
          ],
        });
        state.fdMode = null;
        pushHistory(state);
      })
    ),

  clear: () =>
    set(
      produce((state) => {
        const curr = current(state);
        state.geoboardBands = [];
        for (const id in curr.elements) {
          delete state.elements[id];
        }
        clearSelected(state);
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
      const inRect = (x, y) => numberBetween(x, downPos.x, upPos.x) && numberBetween(y, downPos.y, upPos.y);

      const selected = [];
      if (state.mode == "geoboard") {
        for (const band of state.geoboardBands) {
          for (const point of band.points) {
            const { id, x, y, locked } = point;
            if (!locked && inRect(x, y)) {
              selected.push(id);
            }
          }
        }
        return { ...state, selected, lockSelect: false };
      }

      Object.keys(state.elements).map((key) => {
        const element = state.elements[key];
        const { id, locked } = element;
        const { x, y, width, height } = elementBox(element);
        if (
          !locked &&
          (inRect(x, y) || inRect(x + width, y) || inRect(x, y + height) || inRect(x + width, y + height))
        ) {
          selected.push(id);
        }
      });
      return { ...state, selected, lockSelect: false };
    }),

  selectIds: (ids, lockSelect) => set((state) => ({ ...state, selected: ids, lockSelect })),

  relocateSelected: (dx, dy) =>
    set(
      produce((state) => {
        if (state.mode == "geoboard") {
          state.geoboardBands = state.geoboardBands.map((band) => {
            return {
              ...band,
              points: band.points.map((p) => {
                if (!state.selected.includes(p.id)) return p;
                return { ...p, x: p.x + dx, y: p.y + dy };
              }),
            };
          });
        } else {
          for (const id of state.selected) {
            state.elements[id].x += dx;
            state.elements[id].y += dy;
          }
        }
        pushHistory(state);
      })
    ),

  relocateElement: (id, dx, dy) =>
    set(
      produce((state) => {
        state.elements[id].x += dx;
        state.elements[id].y += dy;
      })
    ),

  updateElement: (id, attrs) =>
    set(
      produce((state) => {
        for (const key in attrs) {
          state.elements[id][key] = attrs[key];
        }
      })
    ),

  deleteSelected: () =>
    set(
      produce((state) => {
        if (state.mode == "geoboard") {
          state.geoboardBands = state.geoboardBands
            .map((band) => {
              return {
                ...band,
                points: band.points.filter((p) => !state.selected.includes(p.id)),
              };
            })
            .filter((band) => band.points.length > 1);
          clearSelected(state);
        } else {
          let id;
          while ((id = state.selected.pop())) {
            delete state.elements[id];
          }
        }
        pushHistory(state);
      })
    ),
  toggleValueSelected: (field) =>
    set(
      produce((state) => {
        if (state.mode == "geoboard") {
          const bands = searchSelectedBands(state);
          for (const i in bands) {
            state.geoboardBands[i][field] = !state.geoboardBands[i][field];
          }
        } else {
          for (const id of current(state).selected) {
            state.elements[id][field] = !state.elements[id][field];
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
          const { x, y, width, height } = el;
          const cx = x + width / 2;
          const cy = y - height / 2;
          el.width = height;
          el.height = width;
          el.x += width / 2 - height / 2;
          el.y += height / 2 - width / 2;
        }
      })
    ),
  copySelected: () =>
    set(
      produce((state) => {
        const shift = state.mode == "rods" ? gridStep * 0.5 : 20;
        if (state.mode == "geoboard") {
          const bands = searchSelectedBands(state);
          // select all points
          for (const i in bands) {
            bands[i].points.forEach((p) => {
              if (!state.selected.includes(p.id)) {
                state.selected.push(p.id);
              }
            });
          }
          // add copy
          for (let band of Object.values(bands)) {
            const copy = { ...band, id: newId() };
            copy.points = copy.points.map((point) => {
              return { ...point, id: newId() };
            });
            state.geoboardBands.push(copy);
          }
          // shift original
          for (const i in bands) {
            state.geoboardBands[i].points.forEach((point) => {
              point.x += shift;
              point.y += shift;
            });
          }
        } else {
          const { elements } = current(state);
          for (const id of state.selected) {
            const copy = { ...elements[id], id: newId() };
            state.elements[copy.id] = copy;
            state.elements[id].x += shift;
            state.elements[id].y += shift;
          }
        }
        pushHistory(state);
      })
    ),
  lockSelected: (value) =>
    set(
      produce((state) => {
        if (state.mode == "geoboard") {
          for (const band of state.geoboardBands) {
            for (const point of band.points) {
              if (state.selected.includes(point.id)) {
                point.locked = value;
              }
            }
          }
          while (state.selected.pop()) {}
        } else {
          let id;
          while ((id = state.selected.pop())) {
            state.elements[id].locked = value;
          }
        }
        pushHistory(state);
      })
    ),

  // elements

  addElement: (data) =>
    set(
      produce((state) => {
        const id = newId();
        state.elements[id] = { ...data, id, locked: false };
        state.fdMode = null;
        pushHistory(state);
      })
    ),
  action: () => set(produce((state) => {})),
}));

function keepOrigin(state) {
  state.origin.x = ((state.width - leftToolbarWidth) / 2 + leftToolbarWidth) / state.scale;
  state.origin.y = state.height / 2 / state.scale;
}

function searchSelectedBands(state) {
  const bands = {};
  // search selected
  current(state).geoboardBands.forEach((band, i) => {
    for (const point of band.points) {
      if (state.selected.includes(point.id)) {
        bands[i] = band;
      }
    }
  });
  return bands;
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

function initLineGrid() {
  const grid = [];
  const { width, height } = boardSize;
  const stepX = gridStep;
  const stepY = gridStep;
  const xStop = Math.ceil(width / 2 / stepX) * stepX + gridStep;
  const xStart = -xStop;
  const yStop = Math.ceil(height / 2 / stepX) * stepX;
  const yStart = -yStop - gridStep;
  for (let y = yStart, i = 0; y <= yStop; y += stepY, i += 1) {
    for (let x = xStart; x <= xStop; x += stepX) {
      grid.push([x, yStart, x, yStop]);
      grid.push([xStart, y, xStop, y]);
    }
  }
  return grid;
}
