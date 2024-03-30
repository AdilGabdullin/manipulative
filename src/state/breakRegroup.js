import { current, produce } from "immer";
import { radius } from "../components/Disk";
import { getColor } from "../components/LeftToolbar";
import { arrayChunk, avg, clearSelected, newId } from "../util";
import { pushHistory } from "./historySlice";

export const breakRegroupSlice = (set) => ({
  animation: false,
  breakDisks: () =>
    set(
      produce((state) => {
        for (const id of current(state.selected)) {
          const disk = current(state.elements[id]);
          const value = disk.value / 10;
          const color = getColor(value);
          for (let y = disk.y - radius * 4; y < disk.y + radius * 5; y += 2 * radius) {
            for (let x = disk.x - radius; x <= disk.x + radius; x += 2 * radius) {
              const id = newId();
              state.elements[id] = {
                id,
                type: "disk",
                x: x,
                y: y,
                color,
                value,
                moveFrom: { x: disk.x, y: disk.y },
                visible: false,
                visibleAfterMove: true,
                locked: false,
              };
              state.animation = true;
              state.lastActiveElement = id;
            }
          }
          delete state.elements[id];
        }
        clearSelected(state);
      })
    ),

  stopAnimations: () =>
    set(
      produce((state) => {
        if (state.animation) {
          for (const id in current(state.elements)) {
            const element = state.elements[id];
            if (element.moveFrom) {
              delete element.moveFrom;
            }
            if (element.visibleAfterMove) {
              element.visible = true;
            }
            if (element.deleteAfterMove) {
              delete state.elements[id];
            }
          }
          state.animation = false;
          clearSelected(state);
          pushHistory(state);
        }
      })
    ),

  regroupSelected: () =>
    set(
      produce((state) => {
        const entries = Object.entries(disksByValue(current(state)));
        for (const [value, list] of entries) {
          for (const chunk of arrayChunk(list, 10)) {
            if (chunk.length < 10) continue;
            const id = newId();
            const { x, y } = avgPos(chunk);
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
              disk.moveFrom = { x: disk.x, y: disk.y };
              disk.x = x;
              disk.y = y;
              disk.deleteAfterMove = true;
            }
            state.animation = true;
            clearSelected(state);
            state.lastActiveElement = id;
          }
        }
      })
    ),
});

export function disksByValue(state) {
  const { elements, maxValue, selected } = state;
  const disks = Object.values(elements).filter(
    (e) => e.type == "disk" && e.value < maxValue && selected.includes(e.id)
  );
  return Object.groupBy(disks, (e) => e.value);
}

export function breakPossible(state) {
  const { elements, minValue, selected } = state;
  return selected.some((id) => elements[id].type == "disk" && elements[id].value > minValue);
}

export function regroupPossible(state) {
  return Object.values(disksByValue(state)).some((arr) => arr.length >= 10);
}

function avgPos(disks) {
  return { x: avg(disks.map((d) => d.x)), y: avg(disks.map((d) => d.y)) };
}
