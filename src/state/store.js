import { create } from "zustand";
import { current, produce } from "immer";
import { leftToolbarWidth } from "../components/LeftToolbar";
import { newId, numberBetween } from "../util";
import { bottomToolbarHeight } from "../components/BottomToolbar";
import { maxOffset } from "../components/Scrolls";
import { freeDrawingSlice } from "./freeDrawingSlice";
import { historySlice, pushHistory } from "./historySlice";

const gridStep = 60;
export const boardSize = {
  width: 2460,
  height: 1660,
};

const initGrid = () => {
  const { width, height } = boardSize;
  const step = gridStep;
  const xStop = Math.ceil(width / 2 / step) * step + gridStep;
  const xStart = -xStop;
  const yStop = Math.ceil(height / 2 / step) * step;
  const yStart = -yStop - gridStep;
  const grid = [];
  for (let x = xStart; x <= xStop; x += step) {
    for (let y = yStart; y <= yStop; y += step) {
      grid.push({ x, y });
    }
  }
  return grid;
};

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const mode = urlParams.get("mode") ?? "geoboard";

export const useAppStore = create((set) => ({
  ...freeDrawingSlice(set),
  ...historySlice(set),
  mode,
  offset: { x: 0, y: 0 },
  scale: 1.0,
  // offset: { x: 50, y: 100 },
  // scale: 0.7,
  fullscreen: true,
  grid: mode == "geoboard" ? initGrid() : [],
  width: 0,
  height: 0,
  origin: { x: 0, y: 0 },
  selected: [],
  lockSelect: false,
  geoboardBands: [
  {
    id: newId(),
    fill: false,
    measures: true,
    color: "#d32f2f",
    points: [
      { id: newId(), x: -100, y: -100, locked: false },
      { id: newId(), x: 0, y: 0, locked: false },
      { id: newId(), x: 50, y: -200, locked: false },
    ],
  },
  {
    id: newId(),
    fill: false,
    measures: true,
    color: "#d32f2f",
    points: [
      { id: newId(), x: -100+300, y: -100, locked: false },
      { id: newId(), x: 0+100, y: 0, locked: false },
      { id: newId(), x: 50+100, y: -200, locked: false },
    ],
  },
  ],
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
          fill: false,
          measures: false,
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
        state.geoboardBands = [];
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
        const { id, x, y, locked } = element;
        if (!locked && inRect(x, y)) {
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
          while (state.selected.pop()) {}
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
          // toggle element
        }
        pushHistory(state);
      })
    ),
  copySelected: () =>
    set(
      produce((state) => {
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
              point.x += 20;
              point.y += 20;
            });
          }
        } else {
          // copy element
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
            state.elements[id].locked = true;
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
