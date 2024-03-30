import { current, produce } from "immer";
import { radius } from "../components/Disk";
import { getColor } from "../components/LeftToolbar";
import { avg, clearSelected, newId } from "../util";
import { pushHistory } from "./historySlice";

export const breakRegroupSlice = (set) => ({
  animation: false,
  breakDisk: (id) =>
    set(
      produce((state) => {
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
              locked: false,
            };
            state.animation = true;
            state.lastActiveElement = id;
          }
        }
        clearSelected(state);
        delete state.elements[id];
      })
    ),

  stopAnimations: () =>
    set(
      produce((state) => {
        for (const id in current(state.elements)) {
          const element = state.elements[id];
          if (element.moveFrom) delete element.moveFrom;
        }
        state.animation = false;
        pushHistory(state);
      })
    ),

  regroupSelected: () =>
    set(
      produce((state) => {
        const entries = Object.entries(disksByValue(current(state)));
        for (const [value, list] of entries) {
          if (list.length < 10) continue;

          const id = newId();
          const { x, y } = avgPos(list);
          state.elements[id] = {
            id,
            type: "disk",
            x,
            y,
            color: getColor(value * 10),
            value: value * 10,
            // moveFrom: { x: disk.x, y: disk.y },
            locked: false,
          };
        //   state.animation = true;
          state.lastActiveElement = id;
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
  return selected.length == 1 && elements[selected[0]].type == "disk" && elements[selected[0]].value > minValue;
}

export function regroupPossible(state) {
  return Object.values(disksByValue(state)).some((arr) => arr.length >= 10);
}

function avgPos(disks) {
  return { x: avg(disks.map((d) => d.x)), y: avg(disks.map((d) => d.y)) };
}
